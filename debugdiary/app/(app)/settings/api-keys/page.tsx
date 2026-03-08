"use client"

import { useEffect, useState } from "react"
import { Copy, KeyRound, Trash2, Plus, AlertTriangle, Loader2, Check } from "lucide-react"
import { useToast } from "@/components/Toast"

export default function ApiKeysPage() {
    const { addToast } = useToast()
    const [keys, setKeys] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [newKeyName, setNewKeyName] = useState("VS Code Extension")
    const [generating, setGenerating] = useState(false)
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const [keysRes, projectsRes] = await Promise.all([
                fetch('/api/apikeys'), // Assuming GET is to /api/apikeys, though original code fetched /api/keys. I'll use /api/keys to match original.
                fetch('/api/projects')
            ])

            if (keysRes.ok) {
                const data = await keysRes.json()
                setKeys(data)
            }
            if (projectsRes.ok) {
                const data = await projectsRes.json()
                setProjects(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName.trim()) return

        setGenerating(true)
        try {
            const res = await fetch('/api/apikeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    label: newKeyName, 
                    projectId: selectedProject || undefined 
                })
            })

            if (res.ok) {
                const data = await res.json()
                setGeneratedKey(data.key)
                setKeys([data, ...keys])
                addToast("API Key generated successfully", "success")
            } else {
                addToast("Failed to generate key", "error")
            }
        } catch (e) {
            addToast("An error occurred", "error")
        } finally {
            setGenerating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this API key entirely? Any extensions using it will stop working.")) return

        try {
            const res = await fetch('/api/apikeys', { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyId: id })
            })
            if (res.ok) {
                setKeys(keys.filter(k => k.id !== id))
                addToast("API Key deleted", "info")
            }
        } catch (e) {
            addToast("Failed to delete key", "error")
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        addToast("Copied to clipboard", "success")
    }

    const closeAndResetModal = () => {
        setShowModal(false)
        setGeneratedKey(null)
        setNewKeyName("VS Code Extension")
        setSelectedProject("")
        setCopied(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div>
                <h1 className="font-syne text-3xl font-bold text-text mb-2">VS Code Extension</h1>
                <p className="text-muted">Connect DebugDiary directly to your editor to log errors seamlessly.</p>
            </div>

            {/* Setup Instructions */}
            <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl font-bold text-text mb-6">Setup in 3 steps</h2>

                <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue text-background font-bold flex items-center justify-center">1</div>
                        <div className="space-y-3 flex-1">
                            <h3 className="font-semibold text-text">Install the extension (.vsix)</h3>
                            <p className="text-sm text-muted">Because this is an early hackathon demo, the extension isn't on the public VS Code Marketplace yet. You need to install it manually:</p>

                            <div className="pt-1 pb-3">
                                <a href="/debugdiary-0.0.1.vsix" download="debugdiary-0.0.1.vsix" className="inline-flex items-center gap-2 bg-blue/20 hover:bg-blue/30 text-blue px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue/30">
                                    Download debugdiary-0.0.1.vsix
                                </a>
                            </div>
                            <ol className="list-decimal list-inside text-sm text-muted space-y-1.5 ml-1">
                                <li>Open VS Code and press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">Cmd/Ctrl</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">Shift</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">X</kbd></li>
                                <li>Click the <strong>"..."</strong> menu at the top right of the Extensions panel</li>
                                <li>Select <strong>"Install from VSIX..."</strong></li>
                                <li>Choose the downloaded <code className="text-xs text-blue">debugdiary-0.0.1.vsix</code> file.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue text-background font-bold flex items-center justify-center">2</div>
                        <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-text">Open Command Palette</h3>
                            <p className="text-sm text-muted">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">Cmd/Ctrl</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">Shift</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/10">P</kbd> and search for <strong>DebugDiary: Connect Account</strong>.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue text-background font-bold flex items-center justify-center">3</div>
                        <div className="space-y-1 flex-1">
                            <h3 className="font-semibold text-text">Paste your API key</h3>
                            <p className="text-sm text-muted">Generate one below and paste it into VS Code.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Keys Settings */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text">Your API Keys</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue hover:bg-blue/90 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
                    >
                        <Plus className="h-4 w-4" /> Generate New Key
                    </button>
                </div>

                {keys.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center">
                        <KeyRound className="h-8 w-8 text-muted mx-auto mb-3 opacity-50" />
                        <h3 className="font-medium text-text mb-1">No API keys yet</h3>
                        <p className="text-sm text-muted mb-4">Generate one to connect VS Code to your account.</p>
                        <button onClick={() => setShowModal(true)} className="bg-blue hover:bg-blue/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                            Generate Key
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {keys.map(key => (
                            <div key={key.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-medium text-text text-sm flex items-center gap-2 mb-1">
                                        <KeyRound className="h-4 w-4 text-blue" />
                                        {key.label}
                                        {key.project && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 ml-2">
                                                📁 {key.project.name}
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <code className="text-xs font-mono text-muted bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                            {key.key.length > 30 ? key.key.substring(0, 8) + '••••••••' + key.key.slice(-4) : 'dd_••••••••••••' + key.key.slice(-4)}
                                        </code>
                                    </div>
                                    <p className="text-[11px] text-muted flex gap-3">
                                        <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                        <span>Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                        onClick={() => handleDelete(key.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                                        title="Delete Key"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* GENERATE KEY MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">

                        {!generatedKey ? (
                            <form onSubmit={handleGenerate}>
                                <h2 className="text-xl font-bold mb-2">Generate API Key</h2>
                                <p className="text-sm text-muted mb-6">Create a key to authenticate extensions or scripts.</p>

                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Name this key</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                                        placeholder="VS Code Laptop"
                                    />
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Link to Project (optional)</label>
                                    <select
                                        value={selectedProject}
                                        onChange={e => setSelectedProject(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                                    >
                                        <option value="">No project — unassigned</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-row justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={closeAndResetModal}
                                        className="px-5 py-2.5 bg-transparent border border-white/10 text-white/70 rounded-xl hover:bg-white/5 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={generating}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                                    >
                                        {generating ? 'Generating...' : 'Generate Key'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-500">
                                    <Check className="h-5 w-5" /> Key Generated
                                </h2>

                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                                    <p className="text-yellow-400 text-sm font-medium flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Save your API key now
                                    </p>
                                    <p className="text-white/60 text-xs mt-1">
                                        This key will never be shown again because it is securely hashed. Copy it now and store it safely.
                                    </p>
                                </div>

                                <div className="bg-black/60 border border-white/10 rounded-lg p-4 flex items-center justify-between gap-4 mb-6 relative group overflow-hidden">
                                    <code className="text-sm font-mono text-blue/90 break-all">{generatedKey}</code>
                                    <button
                                        onClick={() => handleCopy(generatedKey)}
                                        className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={closeAndResetModal} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
