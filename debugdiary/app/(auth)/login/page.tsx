"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react"
import Constellation from "@/components/Constellation"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showDemo, setShowDemo] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = () => {
        setEmail("dev@debugdiary.com")
        setPassword("demo2026")
    }

    return (
        <div className="min-h-screen bg-[#040608] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
            <Constellation />

            <div className="relative z-10 w-full max-w-[420px] bg-[#0c0f14]/92 border border-white/5 rounded-[20px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📓</span>
                        <span className="font-syne font-extrabold text-xl tracking-tight leading-none text-white">DebugDiary</span>
                    </Link>
                    <h1 className="text-2xl font-bold font-syne tracking-tight mb-2">Welcome back</h1>
                    <p className="text-sm text-[#6b7a99]">Sign in to your journal</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 mb-4 animate-in slide-in-from-top-1 duration-200">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-blue focus:ring-1 focus:ring-blue/30 focus:outline-none transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-white/20 focus:border-blue focus:ring-1 focus:ring-blue/30 focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a99] hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue hover:bg-blue/90 text-white font-syne font-bold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Demo Toggle */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="text-xs text-[#6b7a99] hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        Use demo account <ChevronDown className={`w-3 h-3 transition-transform ${showDemo ? "rotate-180" : ""}`} />
                    </button>

                    {showDemo && (
                        <div className="mt-3 bg-white/[0.03] border border-white/5 rounded-lg p-3 text-left animate-in slide-in-from-top-1 duration-200">
                            <div className="flex flex-col gap-1.5 mb-3 text-sm font-mono opacity-80">
                                <p>📧 dev@debugdiary.com</p>
                                <p>🔑 demo2026</p>
                            </div>
                            <button
                                onClick={fillDemo}
                                className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white py-2 rounded transition-colors"
                            >
                                Use these →
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-sm text-[#6b7a99]">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue hover:text-blue/80 font-medium transition-colors">
                            Create one →
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}
