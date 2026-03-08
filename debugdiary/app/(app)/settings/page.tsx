"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Loader2, AlertTriangle, Save, LogOut, Eye, EyeOff, Github, Trash2, Lock } from "lucide-react"

const LANGUAGES = [
    "JavaScript", "TypeScript", "Python", "React", "Node.js", "Java",
    "Go", "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Other"
]

export default function SettingsPage() {
    const { data: session, update } = useSession()

    // Profile State
    const [name, setName] = useState("")
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileMessage, setProfileMessage] = useState("")

    // Stats State
    const [stats, setStats] = useState({ total: 0, joinDate: "" })

    // Preferences State
    const [defaultLang, setDefaultLang] = useState("Other")
    const [sensitivity, setSensitivity] = useState(82)

    // Danger Zone State
    const [deleteEntriesConfirm, setDeleteEntriesConfirm] = useState("")
    const [deletingEntries, setDeletingEntries] = useState(false)

    const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("")
    const [deletingAccount, setDeletingAccount] = useState(false)

    // Digest State
    const [emailAlerts, setEmailAlerts] = useState(true)
    const [timezone, setTimezone] = useState("Asia/Kolkata")

    // GitHub Integration State
    const [githubPAT, setGithubPAT] = useState("")
    const [showPAT, setShowPAT] = useState(false)
    const [savingGithub, setSavingGithub] = useState(false)
    const [githubMessage, setGithubMessage] = useState("")
    const [githubConnected, setGithubConnected] = useState(false)

    useEffect(() => {
        if (session?.user?.name) setName(session.user.name)

        // Load preferences
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('default_language')
            if (savedLang) setDefaultLang(savedLang)

            const savedSens = localStorage.getItem('dejavu_sensitivity')
            if (savedSens) setSensitivity(Math.round(parseFloat(savedSens) * 100))
        }

        // Fetch user stats
        fetch('/api/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('Not authorized')
                return res.json()
            })
            .then(data => {
                if (data && data.stats) {
                    setStats({
                        total: data.stats.total || 0,
                        joinDate: "" // Would need to add createdAt to session or fetch explicitly, omit for now
                    })
                }
            })
            .catch(() => { })

        // Fetch digest settings
        fetch('/api/settings/digest')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setEmailAlerts(data.emailAlerts)
                    setTimezone(data.timezone)
                }
            })
            .catch(() => { })

        // Fetch GitHub settings
        fetch('/api/settings/github')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setGithubPAT(data.githubPAT || '')
                    setGithubConnected(!!data.githubPAT)
                }
            })
            .catch(() => { })
    }, [session])

    const handleSaveProfile = async () => {
        if (!name.trim()) return
        setSavingProfile(true)
        setProfileMessage("")

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                await update({ name })
                setProfileMessage("Profile updated successfully")
                setTimeout(() => setProfileMessage(""), 3000)
            } else {
                setProfileMessage("Failed to update profile")
            }
        } catch (e) {
            setProfileMessage("Error updating profile")
        } finally {
            setSavingProfile(false)
        }
    }

    const handlePrefChange = (type: 'lang' | 'sens', value: string | number) => {
        if (type === 'lang') {
            setDefaultLang(value as string)
            localStorage.setItem('default_language', value as string)
        } else {
            setSensitivity(value as number)
            localStorage.setItem('dejavu_sensitivity', (Number(value) / 100).toString())
        }
    }

    const handleDeleteEntries = async () => {
        if (deleteEntriesConfirm !== "DELETE") return
        setDeletingEntries(true)

        try {
            const res = await fetch('/api/entries/all', { method: 'DELETE' })
            if (res.ok) {
                setDeleteEntriesConfirm("")
                alert("All entries deleted permanently.")
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            alert("Error deleting entries")
        } finally {
            setDeletingEntries(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteAccountConfirm.toLowerCase() !== session?.user?.email?.toLowerCase()) return
        setDeletingAccount(true)

        try {
            const res = await fetch('/api/settings/account', { method: 'DELETE' })
            if (res.ok) {
                signOut({ callbackUrl: '/' })
            }
        } catch (e) {
            console.error(e)
            alert("Error deleting account")
        } finally {
            setDeletingAccount(false)
        }
    }

    if (!session) return null

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="mb-8">
                <h1 className="font-syne text-3xl font-bold text-text mb-1 tracking-tight">Settings</h1>
                <p className="text-muted">Manage your account and preferences.</p>
            </div>

            {/* SECTION 1: PROFILE */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Profile</h3>

                <div className="flex items-start gap-6 bg-[#0c0f14] border border-white/5 rounded-2xl p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue to-teal-400 flex items-center justify-center text-white font-syne font-bold text-2xl shadow-lg shrink-0">
                        {session.user?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:ring-1 focus:ring-blue/50 focus:border-blue/50 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={session.user?.email || ""}
                                disabled
                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-muted cursor-not-allowed font-medium opacity-60"
                            />
                        </div>
                        <div className="pt-2 flex items-center gap-4">
                            <button
                                onClick={handleSaveProfile}
                                disabled={savingProfile || name === session.user?.name || !name.trim()}
                                className="bg-blue hover:bg-blue/90 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                            {profileMessage && (
                                <span className="text-sm text-green-400 animate-in fade-in">{profileMessage}</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: ACCOUNT */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Account</h3>

                <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded mb-3 uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Free Plan
                        </div>
                        <p className="text-text font-medium">{stats.total} entries logged</p>
                        <p className="text-xs text-muted mt-1">Free forever for solo developers.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-muted hover:text-white flex items-center gap-2 text-sm transition-colors border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PREFERENCES */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Preferences</h3>

                <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 space-y-8">

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text block">Default Language Provider</label>
                        <p className="text-xs text-muted mb-3">Preferred language pre-filled when creating new manual entries.</p>
                        <select
                            value={defaultLang}
                            onChange={(e) => handlePrefChange('lang', e.target.value)}
                            className="w-full md:w-1/2 bg-bg/50 border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-blue/50 focus:border-blue/50 transition-all font-medium appearance-none"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-px bg-white/5 w-full"></div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-text block flex items-center justify-between">
                                <span>Déjà Vu Sensitivity</span>
                                <span className={sensitivity > 90 ? 'text-amber-500' : 'text-blue'}>{sensitivity}%</span>
                            </label>
                            <p className="text-xs text-muted mt-1 max-w-md">Higher sets a stricter match threshold for warnings. Lower catches more loosely similar errors.</p>
                        </div>
                        <input
                            type="range"
                            min="60"
                            max="98"
                            value={sensitivity}
                            onChange={(e) => handlePrefChange('sens', parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue"
                        />
                        <div className="flex justify-between text-[10px] text-muted font-bold uppercase tracking-widest">
                            <span>Broad</span>
                            <span>Strict</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* SECTION 3.5: EMAIL DIGEST */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Email Digest</h3>

                <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 space-y-6">
                    <div>
                        <p className="text-sm text-white/40 mb-4">Get error summaries at 8:00 AM ☕ and 10:00 PM 🌙 in your timezone.</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Daily Digest Emails</p>
                            <p className="text-white/40 text-sm">Morning ☕ and Evening 🌙 reports</p>
                        </div>
                        <button
                            onClick={async () => {
                                const newVal = !emailAlerts
                                setEmailAlerts(newVal)
                                await fetch('/api/settings/digest', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ emailAlerts: newVal })
                                })
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${emailAlerts ? 'bg-green-500' : 'bg-white/10'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="h-px bg-white/5 w-full"></div>

                    <div>
                        <p className="text-white font-medium mb-2">Your Timezone</p>
                        <select
                            value={timezone}
                            onChange={async (e) => {
                                const newTz = e.target.value
                                setTimezone(newTz)
                                await fetch('/api/settings/digest', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ timezone: newTz })
                                })
                            }}
                            className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-blue/50 focus:border-blue/50 transition-all font-medium appearance-none"
                        >
                            <option value="Asia/Kolkata">IST — India (UTC+5:30)</option>
                            <option value="America/New_York">EST — New York (UTC-5)</option>
                            <option value="America/Los_Angeles">PST — Los Angeles (UTC-8)</option>
                            <option value="Europe/London">GMT — London (UTC+0)</option>
                            <option value="Europe/Paris">CET — Paris (UTC+1)</option>
                            <option value="Asia/Tokyo">JST — Tokyo (UTC+9)</option>
                            <option value="Australia/Sydney">AEST — Sydney (UTC+10)</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* SECTION: GITHUB INTEGRATION */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">GitHub Integration</h3>

                <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Github className="w-5 h-5 text-white/70" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">Global Personal Access Token</h4>
                                    <p className="text-xs text-muted">A Personal Access Token (PAT) identifies you to GitHub. It allows DebugDiary to fetch exact code context across all your connected projects.</p>
                                </div>
                            </div>
                        </div>
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            githubConnected
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-white/5 border-white/10 text-muted'
                        }`}>
                            {githubConnected ? '✅ Saved' : 'No Token'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">GitHub Personal Access Token</label>
                            <div className="relative">
                                <input
                                    type={showPAT ? 'text' : 'password'}
                                    value={githubPAT}
                                    onChange={(e) => setGithubPAT(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxx"
                                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm text-text placeholder-muted focus:outline-none focus:ring-1 focus:ring-blue/50 focus:border-blue/50 transition-all font-medium"
                                />
                                <button
                                    onClick={() => setShowPAT(!showPAT)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                >
                                    {showPAT ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[11px] text-muted">Required for accessing private repositories and making automated PRs. GitHub → Settings → Developer Settings → Fine-grained tokens → Contents: Read & Write</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        Your token is encrypted with AES-256 before storage. Never readable after saving.
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={async () => {
                                setSavingGithub(true)
                                setGithubMessage('')
                                try {
                                    const res = await fetch('/api/settings/github', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ githubPAT })
                                    })
                                    if (res.ok) {
                                        setGithubMessage('GitHub token securely saved!')
                                        setGithubConnected(true)
                                        // Reload to get masked PAT
                                        const data = await fetch('/api/settings/github').then(r => r.json())
                                        setGithubPAT(data.githubPAT || '')
                                        setTimeout(() => setGithubMessage(''), 3000)
                                    } else {
                                        const err = await res.json()
                                        setGithubMessage(err.error || 'Failed to save')
                                    }
                                } catch {
                                    setGithubMessage('Error saving settings')
                                } finally {
                                    setSavingGithub(false)
                                }
                            }}
                            disabled={savingGithub || !githubPAT}
                            className="bg-blue hover:bg-blue/90 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingGithub ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </button>

                        {githubConnected && (
                            <button
                                onClick={async () => {
                                    await fetch('/api/settings/github', { method: 'DELETE' })
                                    setGithubPAT('')
                                    setGithubConnected(false)
                                    setGithubMessage('GitHub token removed')
                                    setTimeout(() => setGithubMessage(''), 3000)
                                }}
                                className="text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 font-medium py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Remove
                            </button>
                        )}

                        {githubMessage && (
                            <span className={`text-sm animate-in fade-in ${githubMessage.includes('saved') || githubMessage.includes('removed') ? 'text-green-400' : 'text-red-400'}`}>
                                {githubMessage}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 4: DANGER ZONE */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-red-500/80 uppercase tracking-wider mb-4 border-b border-red-500/10 pb-2">Danger Zone</h3>

                <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 space-y-8">

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">Delete All Entries</h4>
                            <p className="text-sm text-muted">Permanently erase all {stats.total} journal entries and their AI enriched data. This action cannot be undone.</p>
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <input
                                type="text"
                                placeholder="Type DELETE to confirm"
                                value={deleteEntriesConfirm}
                                onChange={(e) => setDeleteEntriesConfirm(e.target.value)}
                                className="w-full bg-black/40 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400 placeholder-red-500/30 focus:outline-none focus:border-red-500/50"
                            />
                            <button
                                onClick={handleDeleteEntries}
                                disabled={deleteEntriesConfirm !== "DELETE" || deletingEntries}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                            >
                                {deletingEntries ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete All Entries"}
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-red-500/10 w-full"></div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">Delete Account</h4>
                            <p className="text-sm text-muted">Permanently delete your account, API keys, and all journal entries. This action cannot be undone.</p>
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <input
                                type="text"
                                placeholder={session?.user?.email || "Type your email"}
                                value={deleteAccountConfirm}
                                onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                                className="w-full bg-black/40 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400 placeholder-red-500/30 focus:outline-none focus:border-red-500/50"
                            />
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteAccountConfirm.toLowerCase() !== session?.user?.email?.toLowerCase() || deletingAccount}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                            >
                                {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
                            </button>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    )
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
