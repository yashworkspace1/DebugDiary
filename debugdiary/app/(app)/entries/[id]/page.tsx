"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Edit2, Copy, Sparkles, Loader2, Globe, TerminalSquare, Zap, X, ExternalLink } from "lucide-react"
import { useToast } from "@/components/Toast"
import { useEnrichmentPoller } from "@/hooks/useEnrichmentPoller"
import { languageColors, errorTypeColors, difficultyConfig } from "@/lib/badges"
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import * as Dialog from '@radix-ui/react-dialog'

const VscodeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
    </svg>
)

export default function EntryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()

    const [initialEntry, setInitialEntry] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [journeyOpen, setJourneyOpen] = useState(false)

    // Fetch initial entry
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const res = await fetch(`/api/entries/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setInitialEntry(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchEntry()
    }, [params.id])

    // Polling hook takes over if needed
    const { enriched, entry: polledEntry } = useEnrichmentPoller(
        params.id as string,
        initialEntry?.aiEnriched || false
    )

    const entry = polledEntry || initialEntry

    const handleDelete = async () => {
        if (!confirm("Delete this entry?")) return
        try {
            const res = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' })
            if (res.ok) {
                addToast("Entry deleted", "info")
                router.push("/entries")
            }
        } catch (err) {
            addToast("Failed to delete entry", "error")
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        addToast("Copied to clipboard", "success")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        )
    }

    if (!entry) {
        return (
            <div className="p-8 max-w-5xl mx-auto h-full text-center py-20">
                <h2 className="text-xl font-semibold mb-2">Entry not found</h2>
                <Link href="/entries" className="text-blue hover:underline">← Back to entries</Link>
            </div>
        )
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    }).format(new Date(entry.createdAt))

    const langStyle = entry.language ? (languageColors[entry.language.toLowerCase()] || languageColors.default) : languageColors.default
    const errorColor = entry.errorType ? (errorTypeColors[entry.errorType] || errorTypeColors.Other) : errorTypeColors.Other
    const diffStyle = entry.difficulty ? (difficultyConfig[entry.difficulty.toLowerCase()] || difficultyConfig.medium) : null

    // Parse fileContext if available
    const fileContext = entry.fileContext
        ? (() => {
            try {
                return JSON.parse(entry.fileContext)
            } catch {
                return null
            }
        })()
        : null

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-full">

            {/* HEADER */}
            <div className="mb-6 space-y-4">
                <Link href="/entries" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> All Entries
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-syne font-bold text-text leading-tight max-w-3xl">
                        {entry.summary || entry.errorText.substring(0, 60) + (entry.errorText.length > 60 ? "..." : "")}
                    </h1>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted">{formattedDate}</span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${entry.source?.startsWith('sdk')
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : entry.source === 'vscode'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-blue/10 text-blue border-blue/20'
                            }`}>
                            {entry.source?.startsWith('sdk') ? <Zap className="h-3 w-3" /> : entry.source === 'vscode' ? <VscodeIcon className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {(entry.source === 'sdk' || entry.source === 'sdk_js') ? 'JS SDK' : entry.source === 'sdk_node' ? 'Server SDK' : entry.source === 'vscode' ? 'VS Code' : 'Web Menu'}
                        </div>
                    </div>
                </div>
            </div>

            {/* RECURRING ERROR BANNER */}
            {entry.occurrences > 1 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔁</span>
                        <div>
                            <p className="text-orange-400 font-bold font-syne">Recurring Error</p>
                            <p className="text-white/60 text-sm">
                                This error has occurred{' '}
                                <span className="text-white font-bold">{entry.occurrences} times</span>
                                {' '}across{' '}
                                <span className="text-white font-bold">{entry.affectedUrls?.length || 1} {entry.affectedUrls?.length === 1 ? 'page' : 'pages'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-xs text-white/40">
                        <p>First seen</p>
                        <p className="text-white/60">{entry.firstSeenAt ? new Date(entry.firstSeenAt).toLocaleDateString() : 'N/A'}</p>
                        <p className="mt-1">Last seen</p>
                        <p className="text-white/60">{entry.lastSeenAt ? new Date(entry.lastSeenAt).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
            )}

            {/* AFFECTED PAGES */}
            {entry.affectedUrls?.length > 1 && (
                <div className="mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Affected Pages</p>
                    <div className="flex flex-wrap gap-2">
                        {entry.affectedUrls.map((url: string) => (
                            <span key={url} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white/60 font-mono truncate max-w-xs">
                                {url}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* BADGES ROW */}
            <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-white/5">
                {entry.language && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: langStyle.bg, color: langStyle.color, border: `1px solid ${langStyle.border}` }}>
                        {entry.language}
                    </span>
                )}

                {entry.framework && entry.framework.toLowerCase() !== 'none' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/80">
                        {entry.framework}
                    </span>
                )}

                {entry.errorType && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10" style={{ color: errorColor }}>
                        {entry.errorType}
                    </span>
                )}

                {diffStyle && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10" style={{ color: diffStyle.color }}>
                        {diffStyle.label}
                    </span>
                )}

                <div className="flex-1"></div>

                {/* AI Enriched indicator */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-500 ${enriched
                    ? 'bg-blue/10 border-blue/20 text-blue'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse'
                    }`}>
                    {enriched ? <Sparkles className="h-3.5 w-3.5 fill-blue text-blue" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {enriched ? 'AI Enriched' : 'AI Processing...'}
                </div>
            </div>

            {/* TWO COLUMN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT COLUMN (60%) */}
                <div className="w-full lg:w-[60%] space-y-6">

                    {/* Error Section */}
                    <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-xl p-5 relative group">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase bg-red-500/10 px-2 py-0.5 rounded">Error</span>
                            <button onClick={() => handleCopy(entry.errorText)} className="text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                        <pre className="font-mono text-sm text-red-200/90 whitespace-pre-wrap word-break-all leading-relaxed">
                            {entry.errorText}
                        </pre>
                    </div>

                    {/* Fix Section */}
                    <div className="bg-green-500/5 border-l-4 border-green-500 rounded-r-xl p-5 relative group">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-green-500 tracking-wider uppercase bg-green-500/10 px-2 py-0.5 rounded">Fix</span>
                            <button onClick={() => handleCopy(entry.fixText)} className="text-green-500/50 hover:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-green-100/90 leading-relaxed whitespace-pre-wrap">
                            {entry.fixText}
                        </p>
                    </div>

                    {/* Code Snippet (Optional) */}
                    {entry.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-white/10">
                            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted">Snippet</span>
                                <button onClick={() => handleCopy(entry.codeSnippet)} className="text-muted hover:text-white">
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <CodeMirror
                                value={entry.codeSnippet}
                                theme={oneDark}
                                extensions={[javascript({ jsx: true, typescript: true })]}
                                readOnly={true}
                                editable={false}
                                basicSetup={{ lineNumbers: true, foldGutter: false }}
                                className="text-sm"
                            />
                        </div>
                    )}

                    {/* Affected Files Section */}
                    {fileContext && (
                        <div className="mt-6 space-y-4">

                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <span className="text-purple-400 text-lg">📁</span>
                                <h3 className="text-white font-syne font-bold text-lg">Affected Files</h3>
                                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5">AI Generated</span>
                            </div>

                            {/* File Info Card */}
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/40 text-xs uppercase tracking-wider">FILE</span>
                                        <code className="text-blue-400 text-sm font-mono">{fileContext.filePath}</code>
                                        {fileContext.lineNumber && (
                                            <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5">
                                                line {fileContext.lineNumber}
                                            </span>
                                        )}
                                    </div>

                                    {fileContext.fileUrl && (
                                        <a
                                            href={fileContext.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 border border-blue-500/30 rounded-lg px-3 py-1.5"
                                        >
                                            <ExternalLink className="h-3 w-3" /> View on GitHub
                                        </a>
                                    )}
                                </div>

                                {fileContext.explanation && (
                                    <p className="text-white/60 text-sm mt-3 pt-3 border-t border-white/5 leading-relaxed">
                                        💡 {fileContext.explanation}
                                    </p>
                                )}
                            </div>

                            {/* Before / After Code Diff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Before — Buggy Code */}
                                {fileContext.beforeCode && (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20 bg-red-500/5">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <span className="text-red-400 text-xs font-medium uppercase tracking-wider">Before — Buggy Code</span>
                                        </div>
                                        <pre className="p-4 text-xs text-red-200/80 overflow-x-auto font-mono leading-relaxed max-h-64">
                                            <code>{fileContext.beforeCode}</code>
                                        </pre>
                                    </div>
                                )}

                                {/* After — Fixed Code */}
                                {fileContext.afterCode && (
                                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/20 bg-green-500/5">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-green-400 text-xs font-medium uppercase tracking-wider">After — Fixed Code</span>
                                        </div>
                                        <pre className="p-4 text-xs text-green-200/80 overflow-x-auto font-mono leading-relaxed max-h-64">
                                            <code>{fileContext.afterCode}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pending state — has stack but no fileContext yet */}
                    {entry.codeSnippet && !fileContext && entry.aiEnriched && (
                        <div className="mt-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <div>
                                <p className="text-white/60 text-sm">File context not available</p>
                                <p className="text-white/30 text-xs mt-0.5">Link a GitHub repo to this entry's project to see before/after code diffs</p>
                            </div>
                            <a href="/settings/projects" className="ml-auto text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg px-3 py-1.5">
                                Edit Project →
                            </a>
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN (40%) */}
                <div className="w-full lg:w-[40%]">
                    <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 shadow-xl sticky top-6">
                        <h3 className="font-syne font-bold text-lg mb-6 flex items-center gap-2 text-white">
                            <Sparkles className="h-4 w-4 text-blue" /> AI Analysis
                        </h3>

                        <div className="space-y-6">

                            {/* Why This Happens */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Why This Happens</h4>
                                <div className="text-sm text-white/80 leading-relaxed min-h-[60px]">
                                    {enriched ? (
                                        <div className="animate-in fade-in duration-500">{entry.whyItHappens || "No explanation generated."}</div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="h-2 bg-white/5 rounded-full w-full animate-pulse"></div>
                                            <div className="h-2 bg-white/5 rounded-full w-[85%] animate-pulse delay-75"></div>
                                            <div className="h-2 bg-white/5 rounded-full w-[60%] animate-pulse delay-150"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Tags</h4>
                                {enriched ? (
                                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
                                        {entry.tags && entry.tags.length > 0 ? (
                                            entry.tags.map((tag: string) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => router.push(`/search?tag=${encodeURIComponent(tag)}`)}
                                                    className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors"
                                                >
                                                    #{tag}
                                                </button>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted">No tags generated</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse"></div>
                                        <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse delay-75"></div>
                                        <div className="h-6 w-14 bg-white/5 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                )}
                            </div>

                            {/* Context */}
                            {((entry.source?.startsWith('sdk') || entry.source === 'vscode' || entry.source === 'manual' || entry.source === 'web' || !entry.source)) && entry.context ? (() => {
                                let ctx: any = null
                                try { ctx = JSON.parse(entry.context) } catch { }
                                if (!ctx) return null

                                const isManual = entry.source === 'manual' || entry.source === 'web' || !entry.source;
                                
                                return (
                                    <div className="space-y-4">
                                        <div className={`border rounded-xl p-5 ${
                                            entry.source === 'vscode' ? 'bg-purple-500/5 border-purple-500/15' : 
                                            isManual ? 'bg-slate-500/5 border-slate-500/15' : 'bg-cyan-500/5 border-cyan-500/15'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-4">
                                                {entry.source === 'vscode' ? <VscodeIcon className="h-4 w-4 text-purple-400" /> : 
                                                 isManual ? <Globe className="h-4 w-4 text-slate-400" /> : <Zap className="h-4 w-4 text-cyan-400" />}
                                                <h4 className="text-sm font-bold text-white">{isManual ? 'Manual Entry' : 'Auto Captured'}</h4>
                                                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                                    entry.source === 'vscode' ? 'bg-purple-500/20 text-purple-300' : 
                                                    isManual ? 'bg-slate-500/20 text-slate-300' : 'bg-cyan-500/20 text-cyan-300'
                                                }`}>
                                                    {entry.source === 'sdk_node' ? 'SERVER SDK' : 
                                                     entry.source === 'vscode' ? 'VS CODE' : 
                                                     isManual ? 'MANUAL' : 'SDK'}
                                                </span>
                                            </div>
                                            
                                            {isManual ? (
                                                <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto p-3 bg-white/5 rounded-lg border border-white/10">
                                                    {JSON.stringify(ctx, null, 2)}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Application</p>
                                                        <p className="text-white font-medium">{ctx.appName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Page</p>
                                                        <p className="text-white/70 truncate text-xs">{ctx.pageTitle || ctx.pageUrl}</p>
                                                    </div>
                                                <div>
                                                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">File</p>
                                                    <p className="text-white/70 font-mono text-xs truncate">{ctx.source}:{ctx.line}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Captured At</p>
                                                    <p className="text-white/70 text-xs">{ctx.capturedAt ? new Date(ctx.capturedAt).toLocaleString() : 'N/A'}</p>
                                                </div>
                                                {ctx.pageUrl && (
                                                    <div className="col-span-2">
                                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Page URL</p>
                                                        <p className="text-white/50 font-mono text-[11px] truncate">{ctx.pageUrl}</p>
                                                    </div>
                                                )}
                                            </div>
                                            )}
                                        </div>

                                        {/* USER JOURNEY BREADCRUMBS */}
                                        {ctx.breadcrumbs && ctx.breadcrumbs.length > 0 && (() => {
                                            const all = ctx.breadcrumbs as any[]
                                            const preview = all.slice(-5)
                                            const hasMore = all.length > 5

                                            const renderCrumb = (crumb: any, i: number) => {
                                                const isError = crumb.type === 'error'
                                                return (
                                                    <div key={i} className="flex items-start gap-3 relative">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-[10px] border ${isError ? 'bg-red-500/20 border-red-500/40' : 'bg-white/5 border-white/10'}`}>
                                                            {crumb.type === 'navigation' ? '🌐' :
                                                                crumb.type === 'click' ? '👆' :
                                                                    crumb.type === 'fetch' ? (crumb.status >= 400 ? '🔴' : '🟢') :
                                                                        crumb.type === 'fetch_error' ? '🔴' :
                                                                            crumb.type === 'console_error' ? '⚠️' :
                                                                                crumb.type === 'console_warn' ? '💛' :
                                                                                    crumb.type === 'page_load' ? '📄' :
                                                                                        crumb.type === 'error' ? '💥' : '•'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${isError ? 'text-red-400' : 'text-white/40'}`}>
                                                                    {crumb.type === 'navigation' ? 'Navigation' :
                                                                        crumb.type === 'click' ? 'Interaction' :
                                                                            crumb.type === 'fetch' ? `${crumb.method} Request` :
                                                                                crumb.type === 'fetch_error' ? 'Network Error' :
                                                                                    crumb.type === 'console_error' ? 'Console Error' :
                                                                                        crumb.type === 'console_warn' ? 'Warning' :
                                                                                            crumb.type === 'page_load' ? 'Page Load' :
                                                                                                crumb.type === 'error' ? 'Crash' : crumb.type}
                                                                </span>
                                                                <span className="text-[10px] text-white/20 tabular-nums">
                                                                    {crumb.secondsAgo === 0 ? 'now' : `-${crumb.secondsAgo}s`}
                                                                </span>
                                                            </div>
                                                            <p className={`text-xs truncate ${isError ? 'text-red-300/90 font-mono' : 'text-white/70'}`}>
                                                                {crumb.type === 'navigation' ? crumb.url :
                                                                    crumb.type === 'click' ? crumb.element :
                                                                        crumb.type === 'fetch' || crumb.type === 'fetch_error' ? `${crumb.url} ${crumb.status ? '(' + crumb.status + ')' : ''}` :
                                                                            crumb.type === 'page_load' ? crumb.url :
                                                                                crumb.message || ''}
                                                            </p>
                                                            {crumb.type === 'fetch' && crumb.status >= 400 && (
                                                                <p className="text-[10px] text-red-400/80 mt-1 italic leading-tight">Potentially triggered subsequent failure</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                                                    <div className="flex items-center gap-2 mb-5">
                                                        <span className="text-purple-400 text-sm">🔍</span>
                                                        <h3 className="font-syne font-bold text-white text-sm">User Journey</h3>
                                                        <span className="text-white/40 text-[10px] ml-auto">{all.length} events before crash</span>
                                                    </div>

                                                    {/* Preview: last 5 */}
                                                    <div className="relative pl-2">
                                                        <div className="absolute left-[13px] top-2 bottom-2 w-px bg-white/10" />
                                                        <div className="space-y-4">
                                                            {hasMore && (
                                                                <div className="flex items-center gap-2 pl-7 py-0.5">
                                                                    <span className="text-white/20 text-[10px] italic">{all.length - 5} earlier events hidden…</span>
                                                                </div>
                                                            )}
                                                            {preview.map(renderCrumb)}
                                                        </div>
                                                    </div>

                                                    {/* Show more button */}
                                                    {hasMore && (
                                                        <button
                                                            onClick={() => setJourneyOpen(true)}
                                                            className="mt-4 w-full text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-400/40 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg py-2 transition-all font-medium"
                                                        >
                                                            View Full Journey ({all.length} events) →
                                                        </button>
                                                    )}

                                                    {/* Full journey modal */}
                                                    <Dialog.Root open={journeyOpen} onOpenChange={setJourneyOpen}>
                                                        <Dialog.Portal>
                                                            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                                                            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0c0f14] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-purple-400">🔍</span>
                                                                        <Dialog.Title className="font-syne font-bold text-white">Full User Journey</Dialog.Title>
                                                                        <span className="text-white/40 text-xs ml-1">({all.length} events)</span>
                                                                    </div>
                                                                    <Dialog.Close className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                                                                        <X className="h-4 w-4" />
                                                                    </Dialog.Close>
                                                                </div>
                                                                <div className="overflow-y-auto px-6 py-4">
                                                                    <div className="relative pl-2">
                                                                        <div className="absolute left-[13px] top-2 bottom-2 w-px bg-white/10" />
                                                                        <div className="space-y-4">
                                                                            {all.map(renderCrumb)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Dialog.Content>
                                                        </Dialog.Portal>
                                                    </Dialog.Root>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )
                            })() : entry.context ? (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Context</h4>
                                    <p className="text-sm text-white/80">{entry.context}</p>
                                </div>
                            ) : null}

                            {/* Metadata */}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-xs text-muted">
                                    <span>Source</span>
                                    <span className="text-white/80">{entry.source === 'sdk' ? '⚡ SDK Auto-Capture' : entry.source === 'vscode' ? 'VS Code Extension' : 'Web App'}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted">
                                    <span>Date Added</span>
                                    <span className="text-white/80">
                                        {Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-3">
                                {/* 
                  Note: Inline edit mode is a complex feature. For now we just implement the shell.
                  Future version: open a modal to edit the entry.
                */}
                                <button
                                    className="flex-1 bg-surface2 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    onClick={() => addToast("Edit mode coming soon", "info")}
                                >
                                    <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                                    title="Delete Entry"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
