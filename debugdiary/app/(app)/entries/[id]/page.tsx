"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Edit2, Copy, Sparkles, Loader2, Globe, TerminalSquare } from "lucide-react"
import { useToast } from "@/components/Toast"
import { useEnrichmentPoller } from "@/hooks/useEnrichmentPoller"
import { languageColors, errorTypeColors, difficultyConfig } from "@/lib/badges"
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'

export default function EntryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()

    const [initialEntry, setInitialEntry] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${entry.source === 'vscode'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-blue/10 text-blue border-blue/20'
                            }`}>
                            {entry.source === 'vscode' ? <TerminalSquare className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {entry.source === 'vscode' ? 'VS Code' : 'Web'}
                        </div>
                    </div>
                </div>
            </div>

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
                            {entry.context && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Context</h4>
                                    <p className="text-sm text-white/80">{entry.context}</p>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-xs text-muted">
                                    <span>Source</span>
                                    <span className="text-white/80">{entry.source === 'vscode' ? 'VS Code Extension' : 'Web App'}</span>
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
