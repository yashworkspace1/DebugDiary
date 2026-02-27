"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, TerminalSquare, Globe, Sparkles, Loader2, Zap } from "lucide-react"
import { languageColors, errorTypeColors, difficultyConfig } from "@/lib/badges"
import { Button } from "@/components/ui/button"

export default function EntriesPage() {
    const router = useRouter()
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [langFilter, setLangFilter] = useState("All")
    const [typeFilter, setTypeFilter] = useState("All")
    const [sortOrder, setSortOrder] = useState("newest")
    const [searchQuery, setSearchQuery] = useState("")

    const fetchEntries = async () => {
        setLoading(true)
        try {
            let url = "/api/entries?"
            if (langFilter !== "All") url += `lang=${langFilter.toLowerCase()}&`
            if (typeFilter !== "All") url += `tag=${typeFilter}&` // tag vs type - simple filter for now

            const res = await fetch(url)
            const data = await res.json()
            setEntries(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEntries()
    }, [langFilter, typeFilter])

    // Client-side quick search & sort
    let filteredEntries = entries.filter((e) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            e.errorText?.toLowerCase().includes(q) ||
            e.fixText?.toLowerCase().includes(q) ||
            e.summary?.toLowerCase().includes(q) ||
            e.tags?.some((t: string) => t.toLowerCase().includes(q))
        )
    })

    if (sortOrder === "oldest") {
        filteredEntries = filteredEntries.reverse()
    }

    // Handle Enter key in Search bar to route to semantic search
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const languages = ["All", "JavaScript", "TypeScript", "Python", "Go", "Other"]
    const errorTypes = ["All", "TypeError", "CORS", "Auth", "Database", "Config"]

    if (loading && entries.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        )
    }

    if (!loading && entries.length === 0 && langFilter === "All" && typeFilter === "All" && !searchQuery) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-6xl mb-2">📝</div>
                <h2 className="text-2xl font-syne font-bold text-text">Your journal is empty</h2>
                <p className="text-muted max-w-md">Start by logging your first bug fix. The déjà vu detector needs at least 3 entries to start working.</p>
                <Button asChild className="mt-4 bg-blue hover:bg-blue/90 text-white rounded-xl py-6">
                    <Link href="/entries/new">Log Your First Bug &rarr;</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">

            {/* HEADER ROW */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-syne font-bold text-text">Your Journal</h1>
                    <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full font-medium">
                        {filteredEntries.length} entries
                    </span>
                </div>
                <Button asChild className="bg-blue hover:bg-blue/90 text-white rounded-lg gap-2 shadow-lg shadow-blue/20">
                    <Link href="/entries/new"><Plus className="h-4 w-4" /> New Entry</Link>
                </Button>
            </div>

            {/* FILTER ROW */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">

                <div className="flex-1 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        <span className="text-xs uppercase font-semibold tracking-wider text-muted mr-2">Language:</span>
                        {languages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLangFilter(lang)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${langFilter === lang
                                    ? "bg-blue text-white"
                                    : "bg-surface border border-white/5 text-muted hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}

                        <span className="w-4"></span> {/* Spacer */}

                        <span className="text-xs uppercase font-semibold tracking-wider text-muted mr-2">Type:</span>
                        {errorTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${typeFilter === type
                                    ? "bg-amber-500 text-white"
                                    : "bg-surface border border-white/5 text-muted hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="shrink-0">
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Quick filter (or press Enter for semantic search)..."
                    className="w-full bg-[#0c0f14] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-[#f0f4ff] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all placeholder:text-muted/50"
                />
            </div>

            {/* ENTRY CARDS GRID */}
            {filteredEntries.length === 0 ? (
                <div className="text-center py-20 text-muted">
                    No entries match your filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredEntries.map(entry => {
                        const langStyle = entry.language ? (languageColors[entry.language.toLowerCase()] || languageColors.default) : languageColors.default
                        const errorColor = entry.errorType ? (errorTypeColors[entry.errorType] || errorTypeColors.Other) : errorTypeColors.Other
                        const diffStyle = entry.difficulty ? (difficultyConfig[entry.difficulty.toLowerCase()] || difficultyConfig.medium) : null

                        return (
                            <Link
                                href={`/entries/${entry.id}`}
                                key={entry.id}
                                className={`block bg-[#0c0f14] border border-white/5 rounded-2xl p-5 hover:border-white/15 hover:-translate-y-1 transition-all duration-200 cursor-pointer ${!entry.aiEnriched ? 'animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.1)] border-blue/20' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2 items-center">
                                        {entry.language && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: langStyle.bg, color: langStyle.color, border: `1px solid ${langStyle.border}` }}>
                                                {entry.language}
                                            </span>
                                        )}
                                        {entry.errorType && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10" style={{ color: errorColor }}>
                                                {entry.errorType}
                                            </span>
                                        )}
                                    </div>
                                    {diffStyle && (
                                        <span className="text-[10px] font-semibold flex items-center gap-1 opacity-80" style={{ color: diffStyle.color }}>
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: diffStyle.color }}></div>
                                            {diffStyle.label}
                                        </span>
                                    )}
                                </div>

                                <div className="font-mono text-xs text-slate-200 bg-white/5 border border-white/5 rounded-lg p-3 mb-3 truncate">
                                    {entry.errorText}
                                </div>

                                {entry.aiEnriched ? (
                                    <p className="text-sm text-muted mb-4 line-clamp-2 min-h-[40px]">
                                        {entry.summary || entry.fixText}
                                    </p>
                                ) : (
                                    <div className="space-y-2 mb-4 min-h-[40px] pt-1.5">
                                        <div className="h-2 bg-white/5 rounded-full w-full"></div>
                                        <div className="h-2 bg-white/5 rounded-full w-[70%]"></div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1.5 mb-5 h-6 overflow-hidden">
                                    {entry.tags?.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/5">
                                            #{tag}
                                        </span>
                                    ))}
                                    {entry.tags?.length > 3 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/5">
                                            +{entry.tags.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-[11px] text-muted font-medium">
                                        {entry.source === 'sdk' ? <Zap className="h-3.5 w-3.5 text-cyan-400" /> : entry.source === 'vscode' ? <TerminalSquare className="h-3.5 w-3.5 text-purple-400" /> : <Globe className="h-3.5 w-3.5 text-blue" />}
                                        {Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                    </div>

                                    {entry.aiEnriched ? (
                                        <div className="flex items-center gap-1 text-[10px] text-blue bg-blue/10 px-2 py-0.5 rounded border border-blue/20">
                                            <Sparkles className="h-2.5 w-2.5" /> Enriched
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Processing
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
