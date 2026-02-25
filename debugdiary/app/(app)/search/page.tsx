"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search as SearchIcon, X, Zap, Loader2, Sparkles, TerminalSquare, Globe } from "lucide-react"
import { languageColors, errorTypeColors, difficultyConfig } from "@/lib/badges"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const debounceTimer = useRef<NodeJS.Timeout>(null)

    const performSearch = async (searchStr: string) => {
        if (!searchStr.trim()) {
            setResults([])
            setHasSearched(false)
            return
        }

        setLoading(true)
        setHasSearched(true)
        try {
            const res = await fetch('/api/entries/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchStr })
            })
            const data = await res.json()
            setResults(data)
        } catch (err) {
            console.error("Search failed:", err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    // Debounce search
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)

        if (query.length > 2) {
            debounceTimer.current = setTimeout(() => {
                performSearch(query)
            }, 500)
        } else if (query.length === 0) {
            setResults([])
            setHasSearched(false)
        }

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current)
        }
    }, [query])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (debounceTimer.current) clearTimeout(debounceTimer.current)
            performSearch(query)
        }
    }

    const handleExampleClick = (example: string) => {
        setQuery(example)
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        performSearch(example)
    }

    // Helper to highlight matching words. Simple keyword matching for display purposes.
    const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm || !text) return text
        const words = searchTerm.split(' ').filter(w => w.length > 2)
        if (words.length === 0) return text

        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        let highlighted = text
        words.forEach(word => {
            const escapedWord = escapeRegExp(word)
            const regex = new RegExp(`(${escapedWord})`, 'gi')
            highlighted = highlighted.replace(regex, '<mark class="bg-blue/20 text-blue rounded-[3px] px-[3px] py-[1px]">$1</mark>')
        })

        return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
    }

    const examples = [
        "that CORS error in Express",
        "undefined is not a function",
        "database connection refused"
    ]

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-full space-y-8">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-syne font-bold text-text flex items-center gap-3">
                    Search Your Journal
                </h1>
                <p className="text-muted mt-2">
                    Semantic search — finds errors by meaning, not just keywords
                </p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative group">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted h-5 w-5 group-focus-within:text-blue transition-colors" />
                <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-14 bg-[#0c0f14] border border-white/10 text-lg text-white rounded-2xl pl-14 pr-12 focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all placeholder:text-muted/60 shadow-lg shadow-black/20"
                    placeholder="e.g. that weird CORS thing in Express..."
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* EXAMPLES (Before search) */}
            {!hasSearched && !loading && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
                    <p className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Try searching for:</p>
                    <div className="flex flex-wrap gap-3">
                        {examples.map(ex => (
                            <button
                                key={ex}
                                onClick={() => handleExampleClick(ex)}
                                className="bg-surface border border-white/5 hover:bg-white/5 hover:border-white/10 text-sm text-white/80 py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
                            >
                                <SearchIcon className="h-3.5 w-3.5 opacity-50" /> {ex}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && (
                <div className="space-y-4 pt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-[#0c0f14] border border-white/5 rounded-2xl p-5 animate-pulse">
                            <div className="flex gap-2 mb-4">
                                <div className="h-5 w-16 bg-white/5 rounded-full"></div>
                                <div className="h-5 w-20 bg-white/5 rounded-full"></div>
                            </div>
                            <div className="h-16 bg-white/5 rounded-lg mb-4"></div>
                            <div className="h-4 bg-white/5 rounded w-[80%] mb-2"></div>
                            <div className="h-4 bg-white/5 rounded w-[60%]"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* RESULTS HEADER */}
            {!loading && hasSearched && (
                <div className="flex items-center justify-between pt-4 pb-2 border-b border-white/5">
                    <h2 className="text-lg font-syne font-semibold text-white/90">
                        {results.length} results for <span className="text-blue">"{query}"</span>
                    </h2>
                </div>
            )}

            {/* RESULTS LIST */}
            {!loading && hasSearched && results.length > 0 && (
                <div className="space-y-4">
                    {results.map(entry => {
                        const langStyle = entry.language ? (languageColors[entry.language.toLowerCase()] || languageColors.default) : languageColors.default
                        const errorColor = entry.errorType ? (errorTypeColors[entry.errorType] || errorTypeColors.Other) : errorTypeColors.Other
                        const matchScore = Math.round(entry.score * 100)

                        return (
                            <Link
                                href={`/entries/${entry.id}`}
                                key={entry.id}
                                className="block bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
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

                                    {/* Similarity Score Badge */}
                                    <div className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${matchScore > 85 ? "bg-blue/10 text-blue border border-blue/20" : "bg-white/5 text-muted border border-white/10"
                                        }`}>
                                        <Zap className={`h-3 w-3 ${matchScore > 85 ? "fill-blue text-blue" : "text-muted"}`} />
                                        {matchScore}% match
                                    </div>
                                </div>

                                <div className="font-mono text-xs text-slate-200 bg-white/5 border border-white/5 rounded-lg p-3 mb-3 truncate">
                                    {highlightText(entry.errorText, query)}
                                </div>

                                {entry.aiEnriched && (
                                    <p className="text-sm text-white/70 mb-4 line-clamp-2">
                                        {highlightText(entry.summary || entry.fixText, query)}
                                    </p>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                                        {entry.tags?.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/5">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] text-muted font-medium shrink-0">
                                        {entry.source === 'vscode' ? <TerminalSquare className="h-3.5 w-3.5 text-purple-400" /> : <Globe className="h-3.5 w-3.5 text-blue" />}
                                        {Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* NO RESULTS STATE */}
            {!loading && hasSearched && results.length === 0 && (
                <div className="text-center py-24 space-y-4">
                    <div className="text-5xl opacity-80 mb-4">🔍</div>
                    <h3 className="text-xl font-syne font-semibold text-white/90">No entries found for "{query}"</h3>
                    <p className="text-muted max-w-sm mx-auto text-sm">
                        Try different keywords or add more entries to improve search accuracy.
                    </p>
                    <Button asChild className="mt-4 bg-surface hover:bg-surface2 text-white border border-white/10 rounded-xl">
                        <Link href="/entries/new">Add an entry about this &rarr;</Link>
                    </Button>
                </div>
            )}

        </div>
    )
}
