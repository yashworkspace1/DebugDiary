"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function LandingNav() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        // Initial check
        handleScroll()

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-[#040608]/85 backdrop-blur-md border-b border-white/5 py-0"
            : "bg-transparent py-2"
            }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform origin-bottom-left">📓</span>
                    <div className="flex flex-col">
                        <span className="font-syne font-extrabold text-xl tracking-tight leading-none text-white">DebugDiary</span>
                        <span className="text-[9px] font-bold text-blue tracking-[0.2em] uppercase mt-0.5">Personal Error Journal</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                    <a href="#for-devs" className="hover:text-white transition-colors">For Devs</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link href="/signup" className="text-sm font-bold bg-blue hover:bg-blue/90 text-white px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all">
                        Start Free
                    </Link>
                </div>
            </div>
        </nav>
    )
}
