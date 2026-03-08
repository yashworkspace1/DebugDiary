import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { enrichEntry, generateEmbedding, analyzeFileContext } from '@/lib/gemini'
import { checkRateLimit } from '@/lib/rateLimit'
import { hashApiKey } from '@/lib/encryption'
import { sanitizeEntry } from '@/lib/sanitize'
import { fetchFileFromGitHub, extractFilePathFromStack } from '@/lib/github'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}

export async function OPTIONS() {
    return new Response(null, { status: 200, headers: corsHeaders })
}

function parseStack(stack: string, fallbackSource?: string, fallbackLine?: number) {
    if (!stack) return { functionName: 'unknown', fileName: fallbackSource || 'unknown', lineNumber: String(fallbackLine || 0) }
    const lines = stack.split('\n')
    const firstLine = lines[1] || lines[0]
    const match = firstLine.match(/at (.+?) \((.+?):(\d+):(\d+)\)/)
    return {
        functionName: match?.[1] || 'unknown',
        fileName: match?.[2] || fallbackSource || 'unknown',
        lineNumber: match?.[3] || String(fallbackLine || 0)
    }
}

function detectErrorType(message: string): string {
    if (message.includes('TypeError')) return 'TypeError'
    if (message.includes('ReferenceError')) return 'ReferenceError'
    if (message.includes('SyntaxError')) return 'SyntaxError'
    if (message.includes('RangeError')) return 'RangeError'
    if (message.includes('NetworkError') || message.includes('fetch') || message.includes('Failed to fetch')) return 'Network'
    if (message.includes('CORS') || message.includes('cross-origin')) return 'CORS'
    if (message.includes('Promise') || message.includes('Unhandled')) return 'PromiseError'
    return 'RuntimeError'
}

function buildFixHint(message: string): string {
    if (message.includes('Cannot read properties of null') || message.includes('Cannot read properties of undefined')) {
        return 'Add null check before accessing property. Use optional chaining (?.) or nullish coalescing (??).'
    }
    if (message.includes('is not a function')) {
        return 'Verify the variable is the expected type before calling it as a function.'
    }
    if (message.includes('is not defined')) {
        return 'Check variable is declared and in scope before use.'
    }
    if (message.includes('fetch') || message.includes('NetworkError')) {
        return 'Check network connection and API endpoint URL. Verify CORS headers.'
    }
    if (message.includes('JSON')) {
        return 'Validate JSON format before parsing. Check API response content-type.'
    }
    return 'Check the stack trace for the exact location of the error.'
}

export async function POST(req: Request) {
    try {
        const {
            apiKey, error, stack, source,
            line, col, errorType, pageUrl,
            pageTitle, userAgent, timestamp,
            appName, breadcrumbs, clientSource
        } = await req.json()


        if (!apiKey || !error) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders })
        }

        const sanitized = sanitizeEntry({
            errorText: error,
            stackTrace: stack,
            appName: appName,
            pageTitle: pageTitle
        })

        const safeError = sanitized.errorText || error
        const safeStack = sanitized.stackTrace || stack
        const safeAppName = sanitized.appName || appName
        const safePageTitle = sanitized.pageTitle || pageTitle

        // Validate API key - Check hash first, fallback to plaintext for older legacy keys
        const hashedKey = hashApiKey(apiKey)
        let keyRecord = await prisma.apiKey.findUnique({
            where: { key: hashedKey },
            include: { user: true, project: true }
        })

        if (!keyRecord) {
            keyRecord = await prisma.apiKey.findUnique({
                where: { key: apiKey },
                include: { user: true, project: true }
            })
        }


        if (!keyRecord) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders })
        }

        // Rate limit check (100 errors/hour per key, 10 identical errors/hour)
        const rateCheck = checkRateLimit(apiKey, safeError)
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { captured: false, reason: rateCheck.reason },
                { status: 429, headers: corsHeaders }
            )
        }

        // Error grouping — check for existing similar entry
        function isSameError(error1: string, error2: string): boolean {
            const normalize = (str: string) => str
                .toLowerCase()
                .replace(/\d+/g, 'N')
                .replace(/0x[a-f0-9]+/g, 'X')
                // Only replace quoted strings if they contain numbers (likely IDs/timestamps)
                .replace(/'.*?\d+.*?'/g, 'S')
                .replace(/".*?\d+.*?"/g, 'S')
                .trim()

            const n1 = normalize(error1)
            const n2 = normalize(error2)
            return n1 === n2 || n1.includes(n2) || n2.includes(n1)
        }

        const existingEntries = await prisma.entry.findMany({
            where: {
                userId: keyRecord.userId,
                source: 'sdk',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
                }
            },
            select: {
                id: true,
                errorText: true,
                occurrences: true,
                affectedUrls: true,
                lastSeenAt: true,
                context: true
            }
        })

        const matchingEntry = existingEntries.find((e: any) => isSameError(e.errorText, safeError))

        // If match found → update existing entry
        if (matchingEntry) {
            const updatedUrls = Array.from(new Set([
                ...matchingEntry.affectedUrls,
                ...(pageUrl ? [pageUrl] : [])
            ]))

            await prisma.entry.update({
                where: { id: matchingEntry.id },
                data: {
                    occurrences: { increment: 1 },
                    lastSeenAt: new Date(),
                    affectedUrls: updatedUrls,
                    isGrouped: true,
                    context: JSON.stringify({
                        ...(matchingEntry.context
                            ? JSON.parse(
                                typeof matchingEntry.context === 'string'
                                    ? matchingEntry.context
                                    : JSON.stringify(matchingEntry.context)
                            )
                            : {}),
                        breadcrumbs: breadcrumbs || []
                    })
                }
            })

            return NextResponse.json(
                { captured: true, grouped: true, entryId: matchingEntry.id, occurrences: matchingEntry.occurrences + 1 },
                { status: 200, headers: corsHeaders }
            )
        }

        // No match → create new entry
        const parsed = parseStack(safeStack, source, line)

        const entry = await prisma.entry.create({
            data: {
                userId: keyRecord.userId,
                projectId: keyRecord.projectId || null,
                errorText: safeError.substring(0, 1000),
                fixText: buildFixHint(safeError),
                codeSnippet: safeStack ? safeStack.substring(0, 500) : null,

                context: JSON.stringify({
                    appName: safeAppName || 'Unknown App',
                    pageUrl,
                    pageTitle: safePageTitle,
                    userAgent,
                    source: parsed.fileName || source,
                    line: parsed.lineNumber || line,
                    col,
                    functionName: parsed.functionName,
                    capturedAt: timestamp,
                    sdkErrorType: errorType,
                    breadcrumbs: breadcrumbs || []
                }),
                source: clientSource || 'sdk_js',
                errorType: detectErrorType(safeError),

                aiEnriched: false,
                language: 'javascript',
                tags: [],
                affectedUrls: pageUrl ? [pageUrl] : [],
                firstSeenAt: new Date(),
                lastSeenAt: new Date()
            }
        })

            // Background AI enrichment (fire and forget)
            ; (async () => {
                try {
                    const enriched = await enrichEntry(
                        safeError,
                        buildFixHint(safeError),
                        safeStack?.substring(0, 500)
                    )

                    const embedding = await generateEmbedding(
                        safeError + ' ' + buildFixHint(safeError)
                    )

                    // Fetch file context from GitHub
                    let fileContext = null

                    const userPAT = await prisma.user.findUnique({
                        where: { id: keyRecord.userId },
                        select: { githubPAT: true }
                    })

                    const projectRepo = keyRecord.project?.githubRepo

                    if (projectRepo && safeStack) {
                        const filePath = extractFilePathFromStack(safeStack)

                        if (filePath) {
                            const file = await fetchFileFromGitHub(
                                projectRepo,
                                filePath,
                                userPAT?.githubPAT
                            )

                            if (file) {
                                const diff = await analyzeFileContext(
                                    file.content,
                                    file.path,
                                    safeError,
                                    safeStack
                                )

                                if (diff) {
                                    fileContext = JSON.stringify({
                                        ...diff,
                                        filePath: file.path,
                                        fileUrl: file.url
                                    })
                                }
                            }
                        }
                    }

                    await prisma.entry.update({
                        where: { id: entry.id },
                        data: {
                            ...enriched,
                            embedding,
                            aiEnriched: true,
                            ...(fileContext ? { fileContext } : {})
                        }
                    })
                } catch (err) {
                    console.error('SDK AI enrichment failed:', err)
                }
            })()

        return NextResponse.json(
            { captured: true, entryId: entry.id },
            { status: 201, headers: corsHeaders }
        )
    } catch (e: any) {
        console.error('SDK capture error:', e)
        return NextResponse.json(
            { error: e?.message || 'Internal error' },
            { status: 500, headers: corsHeaders }
        )
    }
}
