"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Zap, Loader2, Search, ArrowRight, ShieldCheck } from "lucide-react"
import { errorTypeColors, languageColors } from "@/lib/badges"

export default function DejavuPage() {
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null) // null = initial, { match: ... } or { match: null }
    const [history, setHistory] = useState<any[]>([])

    // Load recent history (for demo purposes we'll just fetch all and filter by source='dejavu' or 'vscode')
    useEffect(() => {
        fetch('/api/entries?search=')
            .then(res => {
                if (!res.ok) throw new Error('Not authorized')
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setHistory(data.filter((e: any) => e.source === 'dejavu' || e.source === 'vscode').slice(0, 5))
                }
            })
            .catch(() => { })
    }, [result])

    const handleCheck = async () => {
        if (!text.trim()) return

        setLoading(true)
        setResult(null)

        try {
            // Read sensitivity from localStorage
            const sensitivity = typeof window !== 'undefined' ? localStorage.getItem('dejavu_sensitivity') || '0.82' : '0.82'

            const res = await fetch('/api/entries/check-dejavu', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ errorText: text, threshold: parseFloat(sensitivity) })
            })

            const data = await res.json()
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleCheck()
        }
    }

    // Quick log form state for no-match cases
    const [fixText, setFixText] = useState("")
    const [quickLogLoading, setQuickLogLoading] = useState(false)
    const [quickLogSuccess, setQuickLogSuccess] = useState(false)

    const handleQuickLog = async () => {
        if (!text.trim() || !fixText.trim()) return

        setQuickLogLoading(true)
        try {
            const res = await fetch('/api/entries', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    errorText: text,
                    fixText: fixText,
                    source: "dejavu"
                })
            })
            if (res.ok) {
                setQuickLogSuccess(true)
                setResult(null)
                setText("")
                setFixText("")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setQuickLogLoading(false)
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                    <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="font-syne text-3xl md:text-4xl font-bold text-text mb-3 tracking-tight">Déjà Vu Detector</h1>
                <p className="text-muted text-lg max-w-md mx-auto">Paste any error message to check if you've solved it before.</p>
            </div>

            {/* DETECTOR CARD */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 shadow-2xl relative z-20">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste your error message here..."
                    className="w-full h-36 bg-bg/50 border border-border rounded-xl p-4 text-sm font-mono text-text placeholder-muted resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all mb-4"
                />
                <button
                    onClick={handleCheck}
                    disabled={loading || !text.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-500/90 text-black font-syne font-bold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Scanning your journal...
                        </>
                    ) : (
                        <>
                            <Search className="h-5 w-5" />
                            Check My History
                        </>
                    )}
                </button>
                <div className="text-center mt-3">
                    <span className="text-xs text-muted font-medium bg-white/5 px-2 py-1 rounded-md">or press <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">Enter</kbd></span>
                </div>
            </div>

            {/* RESULT STATES */}
            {result && result.match && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 mt-8">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-t-2xl p-4 flex items-center justify-center gap-3 text-amber-500 shadow-[0_10px_40px_rgba(245,158,11,0.1)] relative z-10">
                        <Zap className="h-5 w-5" fill="currentColor" />
                        <span className="font-syne font-bold text-lg">
                            Found it! {Math.round(result.similarity * 100)}% match from {Math.floor((new Date().getTime() - new Date(result.match.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                    </div>

                    <div className="bg-[#0c0f14] border border-white/5 border-t-0 rounded-b-2xl p-6 shadow-2xl relative z-0">
                        {/* Match details */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Original Error</h4>
                            <div className="bg-bg/50 border border-border rounded-xl p-4 text-sm font-mono text-red-400 overflow-x-auto">
                                {result.match.errorText}
                            </div>
                        </div>

                        <div className="mb-6 relative">
                            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-green-500/20"></div>
                            <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 pl-8 relative">
                                <span className="absolute left-[9.5px] top-0 bottom-0 w-3 h-3 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center"><Check className="w-2 h-2 text-green-500" /></span>
                                How you fixed it
                            </h4>
                            <div className="pl-8 text-white/90 leading-relaxed whitespace-pre-wrap">
                                {result.match.fixText}
                            </div>
                        </div>

                        {result.match.aiAnalysis && (
                            <div className="mb-6 bg-purple-500/5 border border-purple-500/10 rounded-xl p-5">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><span className="text-lg">✦</span> AI Explanation</h4>
                                <p className="text-sm text-purple-100/70 leading-relaxed font-medium">
                                    {result.match.aiAnalysis.whyItHappens}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
                            <div className="flex flex-wrap gap-2">
                                {result.match.language && (
                                    <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted font-medium flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (languageColors[result.match.language.toLowerCase()] || languageColors.default).color }}></div>
                                        {result.match.language}
                                    </span>
                                )}
                                {result.match.errorType && (
                                    <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted font-medium flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: errorTypeColors[result.match.errorType] || errorTypeColors.Other }}></div>
                                        {result.match.errorType}
                                    </span>
                                )}
                            </div>
                            <Link href={`/entries/${result.match.id}`} className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-white">
                                View Full Entry <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link href={`/entries/new?error=${encodeURIComponent(text)}`} className="text-sm text-muted hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                            Not the right fix? Log as a completely new issue.
                        </Link>
                    </div>
                </div>
            )}

            {result && !result.match && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 mt-8">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-t-2xl p-4 flex flex-col items-center justify-center gap-1 text-green-500 shadow-[0_10px_40px_rgba(34,197,94,0.1)]">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-6 w-6" />
                            <span className="font-syne font-bold text-xl">Clean Slate</span>
                        </div>
                        <span className="text-sm font-medium text-green-400/80">You've never seen this error before.</span>
                    </div>

                    <div className="bg-[#0c0f14] border border-white/5 border-t-0 rounded-b-2xl p-6 shadow-2xl">
                        <h3 className="font-bold text-white mb-4">Want to log it right now?</h3>
                        <p className="text-sm text-muted mb-4">You already pasted the error. Just write down what you did to fix it, and we'll save it to your journal.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider block mb-1.5">How did you fix it?</label>
                                <textarea
                                    value={fixText}
                                    onChange={(e) => setFixText(e.target.value)}
                                    placeholder="e.g. Added the CORS middleware in the express setup before the routes."
                                    className="w-full h-32 bg-bg/50 border border-border rounded-xl p-4 text-sm text-white placeholder-muted resize-none focus:outline-none focus:ring-1 focus:ring-blue/50 focus:border-blue/50 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleQuickLog}
                                disabled={quickLogLoading || !fixText.trim()}
                                className="w-full bg-blue hover:bg-blue/90 text-white font-syne font-bold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {quickLogLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save to Journal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {quickLogSuccess && !result && (
                <div className="animate-in fade-in zoom-in-95 duration-300 mt-8 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-syne font-bold text-white text-xl mb-2">Saved to Journal!</h3>
                    <p className="text-sm text-green-400">The error and fix have been logged. AI is currently tagging and enriching it.</p>
                    <button onClick={() => setQuickLogSuccess(false)} className="mt-4 text-sm font-medium bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
                        Check another error
                    </button>
                </div>
            )}

            {/* HISTORY (Optional) */}
            {history.length > 0 && !result && !quickLogSuccess && (
                <div className="pt-12 border-t border-white/5 mt-12 animate-in fade-in duration-1000 delay-300 fill-mode-both">
                    <h3 className="font-semibold text-lg text-white mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" /> Recent Déjà Vu Catches
                    </h3>
                    <div className="space-y-3">
                        {history.map(entry => (
                            <Link key={entry.id} href={`/entries/${entry.id}`} className="block bg-[#0c0f14] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <p className="text-sm font-medium text-white/90 mb-1 group-hover:text-blue transition-colors truncate">
                                            {entry.summary || entry.errorText.slice(0, 100)}
                                        </p>
                                        <p className="text-xs text-muted truncate">
                                            {entry.fixText}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-500/20">{entry.source === 'vscode' ? 'VS Code' : 'Web'}</span>
                                        <span className="text-xs text-muted">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {history.length === 0 && !result && !quickLogSuccess && (
                <div className="pt-12 border-t border-white/5 mt-12 text-center animate-in fade-in duration-1000 delay-300 fill-mode-both opacity-50">
                    <p className="text-sm text-muted">No catches yet — keep logging and DebugDiary will start recognizing patterns.</p>
                </div>
            )}

        </div>
    )
}

function Check(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
