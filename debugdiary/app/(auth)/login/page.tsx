"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react"
import Constellation from "@/components/Constellation"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showDemo, setShowDemo] = useState(false)

    // Read error from URL (e.g. after cancelling GitHub OAuth) and clean it up
    useEffect(() => {
        const urlError = searchParams.get("error")
        if (urlError) {
            if (urlError === "Callback" || urlError === "OAuthCallback") {
                setError("Sign-in was cancelled. Please try again.")
            } else if (urlError === "OAuthAccountNotLinked") {
                setError("This email is already registered with a different sign-in method.")
            } else {
                setError("Sign-in failed. Please try again.")
            }
            // Clean the URL so users can retry without being stuck
            window.history.replaceState({}, "", "/login")
        }
    }, [searchParams])

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
        setEmail("devdebugdiary@gmail.com")
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

                {/* OAuth Dividers */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0c0f14] px-4 text-[#6b7a99]">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/5 transition-all text-sm font-medium"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/5 transition-all text-sm font-medium"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                    </button>
                </div>

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
                                <p>📧 devdebugdiary@gmail.com</p>
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

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    )
}
