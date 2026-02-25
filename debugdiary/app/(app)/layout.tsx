"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, List, Plus, Search, Zap, Key, Settings, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [entryCount, setEntryCount] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/entries/count')
            .then(res => {
                if (!res.ok) throw new Error('Not authorized')
                return res.json()
            })
            .then(data => {
                if (data && typeof data.count === 'number') {
                    setEntryCount(data.count)
                }
            })
            .catch(() => { })
    }, [])

    const isCurrent = (path: string) => pathname === path

    return (
        <div className="flex h-screen bg-[#040608] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] fixed inset-y-0 left-0 border-r border-white/5 bg-[#0c0f14] flex flex-col z-40">
                {/* Logo Section */}
                <div className="px-5 py-6 flex flex-col items-start">
                    <Link href="/dashboard" className="flex items-center gap-2 group mb-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-bottom-left">📓</span>
                        <div className="flex flex-col">
                            <span className="font-syne font-extrabold text-xl tracking-tight leading-none text-white">DebugDiary</span>
                            <span className="text-[10px] text-[#6b7a99] uppercase tracking-widest mt-1 font-semibold leading-none">Error Journal</span>
                        </div>
                    </Link>
                    {entryCount !== null && (
                        <div className="bg-blue/10 border border-blue/20 text-blue font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide">

                    {/* JOURNAL */}
                    <div>
                        <h4 className="px-3 text-[10px] font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Journal</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/dashboard")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/entries"
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/entries")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <List className="h-4 w-4" />
                                        All Entries
                                    </div>
                                    {entryCount !== null && (
                                        <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-md text-white/50">{entryCount}</span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/entries/new"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/entries/new")
                                        ? "bg-blue border-l-2 border-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                        : "text-blue hover:text-blue hover:bg-blue/10 border-l-2 border-transparent"
                                        }`}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Entry
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* TOOLS */}
                    <div>
                        <h4 className="px-3 text-[10px] font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Tools</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/search"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/search")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <Search className="h-4 w-4" />
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dejavu"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/dejavu")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <Zap className="h-4 w-4" />
                                    Déjà Vu
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* SETTINGS */}
                    <div>
                        <h4 className="px-3 text-[10px] font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Settings</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/settings/api-keys"
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/settings/api-keys")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Key className="h-4 w-4" />
                                        API Keys
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 py-0.5 px-1.5 rounded text-white/40">VS Code</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent("/settings")
                                        ? "bg-blue/10 border-l-2 border-blue text-white"
                                        : "text-[#6b7a99] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
                                        }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>
                            </li>
                        </ul>
                    </div>

                </nav>

                {/* BOTTOM USER SECTION */}
                <div className="p-4 border-t border-white/5 shrink-0 bg-[#0c0f14]">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-full ring-1 ring-white/10 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-blue to-teal-400 text-white text-xs font-bold">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-xs font-bold text-white truncate">{session?.user?.name || "User"}</p>
                            <p className="text-[10px] text-[#6b7a99] truncate font-medium">{session?.user?.email}</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-1.5 text-[#6b7a99] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0 group"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[260px] h-full overflow-y-auto bg-transparent relative z-10 w-[calc(100%-260px)]">
                {children}
            </main>
        </div>
    )
}
