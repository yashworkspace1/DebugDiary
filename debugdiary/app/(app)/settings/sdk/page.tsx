"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Copy, Check, Zap, Globe, TerminalSquare, ExternalLink } from "lucide-react"

export default function SDKSetupPage() {
    const { data: session } = useSession()
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetch('/api/apikeys')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setApiKey(data[0].key)
                }
            })
            .catch(() => { })
    }, [])

    const scriptTag = `<script\n  src="https://debugdiary.vercel.app/sdk.js"\n  data-key="${apiKey || 'YOUR_API_KEY'}"\n  data-app="My App Name">\n</script>`

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptTag)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Zap className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-syne font-bold text-white">Install DebugDiary SDK</h1>
                        <p className="text-muted text-sm">Monitor any website with one line of code</p>
                    </div>
                </div>
            </div>

            {/* Script Tag Install */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-1">HTML / Vanilla JS</h3>
                <p className="text-sm text-muted mb-4">Add this script tag to your website's HTML</p>

                <div className="relative">
                    <pre className="bg-[#0a0c10] border border-white/10 rounded-xl p-4 text-sm font-mono text-cyan-300 overflow-x-auto">
                        {scriptTag}
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted hover:text-white transition-colors"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                </div>

                {!apiKey && (
                    <p className="mt-3 text-xs text-amber-400/80">
                        ⚠️ No API key found. Create one in <a href="/settings/api-keys" className="underline hover:text-amber-300">API Keys</a> first.
                    </p>
                )}
            </div>

            {/* Setup Steps */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-4">Quick Setup</h3>
                <div className="space-y-4">
                    {[
                        { step: '1', text: 'Add the script tag above to any HTML page, before the closing </body> tag' },
                        { step: '2', text: 'Open the page in your browser — look for the green "DebugDiary SDK Active" badge in console' },
                        { step: '3', text: 'Trigger any JavaScript error (e.g. call an undefined function)' },
                        { step: '4', text: 'Check your DebugDiary dashboard — the error appears automatically with AI enrichment' },
                    ].map(item => (
                        <div key={item.step} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                                {item.step}
                            </div>
                            <p className="text-sm text-white/70 pt-1">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* What Gets Captured */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-4">What Gets Captured</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        'Uncaught JavaScript errors',
                        'Unhandled Promise rejections',
                        'Console.error calls',
                        'File name + line number',
                        'Page URL + title',
                        'AI enrichment + fix suggestion',
                        'Error type classification',
                        'Stack trace extraction'
                    ].map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>

            {/* Source Badges Info */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-4">Entry Sources</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Zap className="h-3 w-3" /> SDK Auto
                        </div>
                        <span className="text-sm text-muted">Auto-captured from any website via SDK</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <TerminalSquare className="h-3 w-3" /> VS Code
                        </div>
                        <span className="text-sm text-muted">Logged from VS Code extension</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'rgb(96,165,250)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <Globe className="h-3 w-3" /> Web
                        </div>
                        <span className="text-sm text-muted">Manually logged from the web dashboard</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
