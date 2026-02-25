"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, AlertTriangle, Check, X } from "lucide-react"
import Constellation from "@/components/Constellation"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [emailExists, setEmailExists] = useState(false)
    const [checkingEmail, setCheckingEmail] = useState(false)

    // Password Strength
    const getStrength = (pass: string) => {
        if (!pass) return { score: 0, label: "", color: "bg-white/10" }
        if (pass.length < 6) return { score: 1, label: "Weak", color: "bg-red-500" }
        if (pass.length < 9) return { score: 2, label: "Fair", color: "bg-orange-500" }
        if (pass.length < 12) return { score: 3, label: "Good", color: "bg-blue" }
        return { score: 4, label: "Strong", color: "bg-green-500" }
    }
    const strength = getStrength(password)

    // Check Email Existence on Blur
    const handleEmailBlur = async () => {
        if (!email || !email.includes('@')) return
        setCheckingEmail(true)
        try {
            const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
            const data = await res.json()
            setEmailExists(data.exists)
        } catch (e) {
            // ignore
        } finally {
            setCheckingEmail(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (emailExists) {
            setError("An account with this email already exists")
            return
        }

        setLoading(true)

        try {
            // Register via our custom API
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            if (!res.ok) {
                const data = await res.text()
                setError(data || "Failed to create account")
                setLoading(false)
                return
            }

            // Immediately sign them in
            const signRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signRes?.error) {
                setError("Account created, but automatic sign in failed.")
                setLoading(false)
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#040608] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
            <Constellation />

            <div className="relative z-10 w-full max-w-[420px] bg-[#0c0f14]/92 border border-white/5 rounded-[20px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in zoom-in-95 duration-500 my-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📓</span>
                        <span className="font-syne font-extrabold text-xl tracking-tight leading-none text-white">DebugDiary</span>
                    </Link>
                    <h1 className="text-2xl font-bold font-syne tracking-tight mb-2">Start your journal</h1>
                    <p className="text-sm text-[#6b7a99]">Free forever. No credit card.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 mb-4 animate-in slide-in-from-top-1 duration-200">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-blue focus:ring-1 focus:ring-blue/30 focus:outline-none transition-all"
                            placeholder="Jane Smith"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider flex justify-between">
                            <span>Email</span>
                            {checkingEmail && <span className="text-white/30 lowercase normal-case">checking...</span>}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                setEmailExists(false)
                            }}
                            onBlur={handleEmailBlur}
                            className={`w-full bg-white/[0.04] border ${emailExists ? 'border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/30' : 'border-white/5 focus:border-blue focus:ring-blue/30'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:outline-none transition-all`}
                            placeholder="you@example.com"
                            required
                        />
                        {emailExists && (
                            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1 animate-in fade-in duration-200">
                                <AlertTriangle className="w-3 h-3" />
                                Account exists. <Link href="/login" className="underline hover:text-amber-400">Sign in instead →</Link>
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider flex justify-between">
                            <span>Password</span>
                            {strength.label && <span className={`normal-case text-[10px] font-bold tracking-widest uppercase ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>}
                        </label>
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
                        {/* Strength Meter lines */}
                        <div className="flex gap-1 h-1 mt-2">
                            {[1, 2, 3, 4].map(level => (
                                <div
                                    key={level}
                                    className={`flex-1 rounded-full transition-colors duration-300 ${strength.score >= level ? strength.color : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-white/[0.04] border ${confirmPassword && password !== confirmPassword ? 'border-red-500/30' : 'border-white/5'} rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-white/20 focus:border-blue focus:ring-1 focus:ring-blue/30 focus:outline-none transition-all`}
                                placeholder="••••••••"
                                required
                            />
                            {confirmPassword && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                    {password === confirmPassword
                                        ? <Check className="w-4 h-4 text-green-500" />
                                        : <X className="w-4 h-4 text-red-500" />
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || emailExists}
                        className="w-full bg-blue hover:bg-blue/90 text-white font-syne font-bold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-sm text-[#6b7a99]">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue hover:text-blue/80 font-medium transition-colors">
                            Sign in →
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}
