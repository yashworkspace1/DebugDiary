"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/Toast"
import { Zap, X, Plus, CheckCircle, Loader2, Sparkles, ExternalLink } from "lucide-react"
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'

export default function NewEntryPage() {
    const router = useRouter()
    const { addToast } = useToast()

    const [errorText, setErrorText] = useState("")
    const [fixText, setFixText] = useState("")
    const [context, setContext] = useState("")
    const [language, setLanguage] = useState("auto")
    const [framework, setFramework] = useState("auto")

    const [showCode, setShowCode] = useState(false)
    const [codeSnippet, setCodeSnippet] = useState("")

    const [checkingDejaVu, setCheckingDejaVu] = useState(false)
    const [dejaVuMatch, setDejaVuMatch] = useState<any>(null)
    const [dejaVuChecked, setDejaVuChecked] = useState(false)

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [validationError, setValidationError] = useState("")

    const handleBlurErrorText = async () => {
        if (errorText.length < 10) return
        setCheckingDejaVu(true)
        setDejaVuMatch(null)
        setDejaVuChecked(false)
        try {
            const res = await fetch('/api/entries/check-dejavu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ errorText })
            })
            const data = await res.json()
            if (data.match) {
                setDejaVuMatch(data.match)
                addToast("Similar error found in history!", "info")
            } else {
                setDejaVuChecked(true)
                setTimeout(() => setDejaVuChecked(false), 3000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setCheckingDejaVu(false)
        }
    }

    const handleSubmit = async () => {
        if (errorText.length < 5 || fixText.length < 5) {
            setValidationError("Error message and fix description must be at least 5 characters.")
            return
        }
        setValidationError("")
        setLoading(true)

        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    errorText,
                    fixText,
                    codeSnippet: showCode ? codeSnippet : null,
                    context,
                    language: language !== 'auto' ? language : null,
                    framework: framework !== 'auto' ? framework : null
                })
            })

            const data = await res.json()
            setSuccess(true)
            addToast("Saved! AI is enriching...", "success")

            setTimeout(() => {
                router.refresh()
                router.push(`/entries/${data.id}`)
            }, 1500)
        } catch (err) {
            console.error(err)
            addToast("Failed to save entry", "error")
            setLoading(false)
        }
    }

    const hasContent = errorText.length > 0 || fixText.length > 0

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-syne font-extrabold text-text">Log a Bug Fix</h1>
                <p className="text-muted mt-2">Paste the error and what fixed it. AI does the rest.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT COLUMN - THE FORM */}
                <div className="w-full lg:w-[60%] space-y-8 pb-12">

                    {/* Error Message Field */}
                    <div className="space-y-2 relative">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-text">Error Message</label>
                            <span className="text-xs text-muted">Paste the exact error from your terminal or browser console</span>
                        </div>
                        <textarea
                            value={errorText}
                            onChange={(e) => setErrorText(e.target.value)}
                            onBlur={handleBlurErrorText}
                            placeholder="TypeError: Cannot read properties of undefined (reading 'map')"
                            className="w-full bg-[#0c0f14] border border-white/10 rounded-xl p-4 font-mono text-sm text-[#f0f4ff] min-h-[120px] resize-y focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all placeholder:text-muted/50"
                        />

                        {checkingDejaVu && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                                <Loader2 className="h-3 w-3 animate-spin" /> Checking your history...
                            </div>
                        )}
                        {dejaVuChecked && !dejaVuMatch && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-400 animate-in fade-in">
                                <CheckCircle className="h-3 w-3" /> ✓ No similar errors in your journal
                            </div>
                        )}
                    </div>

                    {/* DÉJÀ VU BANNER */}
                    {dejaVuMatch && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-amber-500 font-semibold">
                                    <Zap className="h-4 w-4 fill-amber-500" />
                                    <span>Déjà Vu Detected</span>
                                </div>
                                <button onClick={() => setDejaVuMatch(null)} className="text-muted hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-sm text-muted mb-3">
                                You hit something similar {Math.max(1, Math.floor((Date.now() - new Date(dejaVuMatch.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} days ago
                            </p>

                            <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5 pointer-events-none">
                                <p className="font-mono text-xs text-text truncate mb-2 opacity-80">{dejaVuMatch.errorText.substring(0, 100)}</p>
                                <p className="text-xs text-muted truncate mb-2">{dejaVuMatch.fixText.substring(0, 80)}</p>
                                <div className="flex gap-2">
                                    {dejaVuMatch.language && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{dejaVuMatch.language}</span>}
                                    {dejaVuMatch.errorType && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{dejaVuMatch.errorType}</span>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(`/entries/${dejaVuMatch.id}`, '_blank')}
                                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                                >
                                    View full entry <ExternalLink className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => setDejaVuMatch(null)}
                                    className="flex-1 bg-surface border border-border hover:bg-surface2 text-text text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                                >
                                    Different issue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* What Fixed It Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-text">What Fixed It</label>
                            <span className="text-xs text-muted">Describe your fix in plain language</span>
                        </div>
                        <textarea
                            value={fixText}
                            onChange={(e) => setFixText(e.target.value)}
                            placeholder="Added || [] fallback because API was returning null..."
                            className="w-full bg-[#0c0f14] border border-white/10 rounded-xl p-4 text-sm text-[#f0f4ff] min-h-[100px] resize-y focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all placeholder:text-muted/50"
                        />
                    </div>

                    {/* Code Snippet Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-text flex items-center gap-2">
                                Code Snippet <span className="text-muted font-normal text-xs">(optional)</span>
                            </label>
                            {!showCode && (
                                <button
                                    type="button"
                                    onClick={() => setShowCode(true)}
                                    className="text-xs text-blue hover:text-blue/80 flex items-center gap-1 font-medium"
                                >
                                    Add snippet <Plus className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {showCode && (
                            <div className="rounded-xl overflow-hidden border border-white/10 relative group">
                                <button
                                    type="button"
                                    onClick={() => { setShowCode(false); setCodeSnippet(""); }}
                                    className="absolute top-2 right-2 z-10 p-1 rounded-md bg-white/10 text-white/50 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <CodeMirror
                                    value={codeSnippet}
                                    height="200px"
                                    theme={oneDark}
                                    extensions={[javascript({ jsx: true, typescript: true })]}
                                    onChange={(val) => setCodeSnippet(val)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Context Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-text flex items-center gap-2">
                                Project / Context <span className="text-muted font-normal text-xs">(optional)</span>
                            </label>
                            <span className="text-xs text-muted">Helps you find this later</span>
                        </div>
                        <input
                            type="text"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="DriveCycle backend, Auth module, Week 3"
                            className="w-full bg-[#0c0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f4ff] focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all placeholder:text-muted/50"
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-[#0c0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f4ff] appearance-none focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all cursor-pointer"
                            >
                                <option value="auto">Auto-detect</option>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option>
                                <option value="php">PHP</option>
                                <option value="ruby">Ruby</option>
                                <option value="csharp">C#</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text">Framework</label>
                            <select
                                value={framework}
                                onChange={(e) => setFramework(e.target.value)}
                                className="w-full bg-[#0c0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f4ff] appearance-none focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all cursor-pointer"
                            >
                                <option value="auto">Auto-detect</option>
                                <option value="react">React</option>
                                <option value="nextjs">Next.js</option>
                                <option value="express">Express</option>
                                <option value="django">Django</option>
                                <option value="fastapi">FastAPI</option>
                                <option value="vue">Vue</option>
                                <option value="angular">Angular</option>
                                <option value="spring">Spring</option>
                                <option value="none">None</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {validationError && (
                        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl">
                            {validationError}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className={`w-full py-4 rounded-xl font-syne font-bold text-base transition-all flex items-center justify-center gap-2 ${success
                            ? "bg-green-500 text-white"
                            : loading
                                ? "bg-blue/70 text-white cursor-not-allowed"
                                : "bg-blue hover:bg-blue/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                            }`}
                    >
                        {success ? (
                            <><CheckCircle className="h-5 w-5" /> Saved! AI is enriching...</>
                        ) : loading ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
                        ) : (
                            "Save to Journal"
                        )}
                    </button>
                </div>

                {/* RIGHT COLUMN - LIVE PREVIEW PANEL */}
                <div className="w-full lg:w-[40%]">
                    <div className="sticky top-6 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden relative">

                        {/* Ambient bg glow */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-blue/10 blur-3xl rounded-full pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="font-syne font-bold text-lg flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue" /> AI Preview
                            </h3>
                            {hasContent && (
                                <div className="flex items-center gap-2 text-xs font-medium text-blue bg-blue/10 px-2.5 py-1 rounded-full animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue"></div> Live
                                </div>
                            )}
                        </div>

                        {!hasContent ? (
                            // DEFAULT STATE
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
                                <div className="text-5xl opacity-80">🤖</div>
                                <p className="text-muted text-sm max-w-[200px]">Start typing your error to see AI enrichment preview</p>
                            </div>
                        ) : (
                            // ACTIVE STATE
                            <div className="space-y-8 relative z-10 animate-in fade-in duration-500">

                                {/* Pre-submit explanatory text */}
                                <div className="space-y-3 pb-4 border-b border-border">
                                    <p className="text-xs font-medium text-white/70 mb-2">After saving, AI will add:</p>

                                    <div className="flex items-center gap-3 text-sm text-muted animate-in slide-in-from-left-2 fade-in fill-mode-both delay-75">
                                        <div className="bg-white/5 p-1.5 rounded-md"><Sparkles className="h-3 w-3 text-blue" /></div>
                                        <span>Plain-English summary</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted animate-in slide-in-from-left-2 fade-in fill-mode-both delay-150">
                                        <div className="bg-white/5 p-1.5 rounded-md"><Zap className="h-3 w-3 text-amber-400" /></div>
                                        <span>Why this error happens</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted animate-in slide-in-from-left-2 fade-in fill-mode-both delay-300">
                                        <div className="bg-white/5 p-1.5 rounded-md"><div className="font-mono text-[10px]">&lt;/&gt;</div></div>
                                        <span>Auto-tags for search</span>
                                    </div>
                                </div>

                                {/* Skeletons to represent what's coming */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Summary Draft</h4>
                                    <div className="space-y-2">
                                        <div className="h-2.5 bg-white/5 rounded-full w-full animate-pulse"></div>
                                        <div className="h-2.5 bg-white/5 rounded-full w-[70%] animate-pulse delay-75"></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Explanation Draft</h4>
                                    <div className="space-y-2">
                                        <div className="h-2.5 bg-white/5 rounded-full w-[90%] animate-pulse delay-100"></div>
                                        <div className="h-2.5 bg-white/5 rounded-full w-full animate-pulse delay-150"></div>
                                        <div className="h-2.5 bg-white/5 rounded-full w-[40%] animate-pulse delay-200"></div>
                                    </div>
                                </div>

                                {/* Shows active language/framework selection as a preview */}
                                {(language !== 'auto' || framework !== 'auto') && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Auto Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {language !== 'auto' && (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-blue/10 text-blue border border-blue/20">
                                                    {language}
                                                </span>
                                            )}
                                            {framework !== 'auto' && (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                    {framework}
                                                </span>
                                            )}
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/30 border border-white/5 animate-pulse">
                                                generating...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
