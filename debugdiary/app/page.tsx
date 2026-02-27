import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Constellation from "@/components/Constellation"
import LandingNav from "@/components/LandingNav"

export default async function LandingPage() {
  const session = await getServerSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#040608] text-text font-sans relative selection:bg-blue/30 overflow-hidden">
      <Constellation />

      {/* NAV */}
      <LandingNav />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 min-h-[90vh] flex items-center z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Hero Content */}
          <div className="max-w-[700px] flex flex-col items-start relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue/30 bg-blue/10 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-blue/90 tracking-wide">
                Semantic search · Déjà Vu detection · VS Code extension
              </span>
            </div>

            <h1 className="font-syne font-extrabold text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-tight mb-8">
              <span className="block text-white">Stop Solving</span>
              <span className="block bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">The Same Bug</span>
              <span className="block bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">Twice.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#6b7a99] mb-10 max-w-[480px] leading-relaxed">
              Stack Overflow helps strangers. <strong className="text-white/80 font-medium font-syne">DebugDiary</strong> helps you.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto text-center font-bold bg-blue hover:bg-blue/90 text-white px-8 py-4 rounded-xl text-lg shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.4)] transition-all">
                Start Free — No Setup
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto text-center font-semibold text-muted hover:text-white px-8 py-4 rounded-xl transition-colors">
                See How It Works
              </a>
            </div>

            <div className="mt-16 flex items-center gap-6 md:gap-12 text-sm">
              <div>
                <p className="font-syne font-bold text-white text-xl">0 competitors</p>
                <p className="text-[10px] text-muted font-bold tracking-widest mt-1">EXACT PROBLEM SPACE</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <p className="font-syne font-bold text-white text-xl">&lt; 30s</p>
                <p className="text-[10px] text-muted font-bold tracking-widest mt-1">TO LOG A BUG FIX</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <p className="font-syne font-bold text-white text-xl">∞</p>
                <p className="text-[10px] text-muted font-bold tracking-widest mt-1">ENTRIES FREE</p>
              </div>
            </div>
          </div>

          {/* Floating Demo Card */}
          <div className="hidden lg:block relative z-20 w-full h-[500px] perspective-[900px]">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[380px] bg-[#0c0f14]/90 border border-white/10 rounded-[20px] p-6 backdrop-blur-2xl shadow-2xl transition-transform duration-700 hover:rotate-y-[-2deg] hover:rotate-x-[1deg] rotate-y-[-8deg] rotate-x-[4deg] transform-style-3d">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-500 text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-syne font-bold text-white text-lg leading-tight">Déjà Vu Detected</h3>
                  <p className="text-xs text-amber-500/80 font-medium">You hit this exactly 47 days ago</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 mb-5">
                <p className="font-mono text-[13px] text-red-400/90 mb-3 leading-relaxed line-clamp-2">
                  TypeError: Cannot read properties of undefined (reading 'map')
                </p>
                <div className="h-px bg-white/5 w-full mb-3"></div>
                <div className="flex gap-2 items-start">
                  <span className="text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mt-0.5">FIX</span>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    Added <code className="text-blue/90">|| []</code> fallback to the API response before rendering the list.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted font-medium">react</span>
                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted font-medium">javascript</span>
                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted font-medium">TypeError</span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-lg text-sm transition-colors border border-white/5">
                  Dismiss
                </button>
                <button className="flex-1 bg-blue hover:bg-blue/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg">
                  View Full Fix
                </button>
              </div>
            </div>

            {/* Decorative glow behind card */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] bg-blue/20 blur-[100px] rounded-full pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 py-32 bg-black/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-20">
            <span className="text-xs font-bold text-blue tracking-[0.2em] uppercase mb-4 block">SIMPLE BY DESIGN</span>
            <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-6">Three steps. Permanent memory.</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">No complex setup. No mandatory fields. Just log your fix, search later, and never repeat a debugging session.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gradient-to-r from-blue/0 via-blue/20 to-amber-500/0 border-t border-dashed border-white/10 blur-[0.5px]"></div>

            {/* Card 1 */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue/20 to-transparent flex items-center justify-center border border-blue/20 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <span className="text-3xl">📝</span>
              </div>
              <span className="absolute top-8 right-8 font-syne font-bold text-5xl text-white/[0.03]">01</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Paste Your Error</h3>
              <p className="text-muted leading-relaxed text-sm">Dump the raw error message and exactly what you did to fix it. Takes 20 seconds. Return to coding.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors relative group mt-0 md:mt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center border border-purple-500/20 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <span className="text-3xl text-purple-400">✦</span>
              </div>
              <span className="absolute top-8 right-8 font-syne font-bold text-5xl text-white/[0.03]">02</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">AI Does The Rest</h3>
              <p className="text-muted leading-relaxed text-sm">Background jobs automatically tag the language, framework, and error type. It even writes a human-readable explanation of why it happened.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors relative group mt-0 md:mt-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center border border-amber-500/20 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <span className="text-3xl text-amber-500">⚡</span>
              </div>
              <span className="absolute top-8 right-8 font-syne font-bold text-5xl text-white/[0.03]">03</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Déjà Vu Catches It</h3>
              <p className="text-muted leading-relaxed text-sm">Next time you paste a similar error—even weeks later—DebugDiary alerts you instantly and surfaces your past fix.</p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-6xl mx-auto px-6 space-y-40">

          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-blue/10 blur-[100px] rounded-full"></div>
              <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl">
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-4 py-3 mb-6">
                  <span className="text-muted">🔍</span>
                  <span className="text-sm font-mono text-white/80">that weird CORS thing in Express</span>
                </div>
                <div className="space-y-3 relative">
                  <div className="absolute left-6 top-12 bottom-6 w-px bg-white/5"></div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 pl-12 relative overflow-hidden">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue bg-blue/10 px-2 py-0.5 rounded">94% Semantic Match</span>
                    </div>
                    <p className="text-sm text-white/90 font-medium mb-1">Access-Control-Allow-Origin missing</p>
                    <p className="text-xs text-muted truncate">Added the cors middleware with credentials: true</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 pl-12 relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-muted bg-white/5 px-2 py-0.5 rounded">81% Semantic Match</span>
                    </div>
                    <p className="text-sm text-white/70 font-medium mb-1 opacity-60">Preflight request failed Option</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-blue font-bold text-sm tracking-widest uppercase mb-4 block">🔍 Search Engine</span>
              <h2 className="font-syne font-bold text-4xl text-white mb-6 leading-tight">Find errors by meaning,<br />not just keywords.</h2>
              <p className="text-lg text-muted leading-relaxed">
                Forget exact string matching. Type exactly what you're thinking like "that strange cors thing" and DebugDiary's embedded Gemini AI finds the right entry—even if you never explicitly wrote "CORS" in the original fix.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue font-bold text-sm tracking-widest uppercase mb-4 block">🔷 VS Code Extension</span>
              <h2 className="font-syne font-bold text-4xl text-white mb-6 leading-tight">Lives where you debug.<br />Not in another tab.</h2>
              <p className="text-lg text-muted leading-relaxed">
                Don't break your context. Select an error in your editor, right-click to instantly save it. When you hit a familiar error later, a VS Code notification pops up with the fix before you even open your browser.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full"></div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden relative z-10 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-[#252526] border-b border-[#333] px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-[#cccccc] text-xs font-medium ml-2">Notification</span>
                </div>
                <div className="p-4 bg-[#252526] m-2 rounded shadow-sm border border-[#333]">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 text-lg mt-0.5">⚡</span>
                    <div>
                      <p className="text-[#cccccc] font-medium text-sm mb-1">DebugDiary — Déjà Vu!</p>
                      <p className="text-[#999999] text-xs mb-3">94% match found from 47 days ago</p>
                      <div className="bg-[#1e1e1e] border border-[#333] p-2 rounded text-[#cccccc] font-mono text-[11px] mb-3">
                        TypeError: Cannot read properties...
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-[11px] px-3 py-1.5 rounded transition-colors">View Fix</button>
                        <button className="bg-[#333] hover:bg-[#444] text-[#cccccc] text-[11px] px-3 py-1.5 rounded transition-colors">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full"></div>
              <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-purple-400">✦</span>
                  <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">AI Generated Insight</span>
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Why it happens</h4>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  React is attempting to call `.map()` on the `users` array before the asynchronous fetch request completes. Since the initial state is `null` instead of `[]`, the runtime throws a TypeError when accessing properties on null.
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex gap-2">
                    <span className="bg-blue/10 text-blue border border-blue/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">React</span>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">TypeError</span>
                  </div>
                  <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Difficulty: Medium</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-blue font-bold text-sm tracking-widest uppercase mb-4 block">✦ AI Analysis</span>
              <h2 className="font-syne font-bold text-4xl text-white mb-6 leading-tight">Know <em className="text-white/50 italic font-medium">why</em> it broke,<br />not just how to fix it.</h2>
              <p className="text-lg text-muted leading-relaxed">
                DebugDiary doesn't just store solutions. Every entry is automatically analyzed by AI to explain the root cause. Next time you see the same pattern, you'll recognize the underlying concept immediately.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 py-32 border-t border-white/5 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-6 leading-tight">
            Your Next Debugging Session<br />Should Be Your Last Repeat.
          </h2>
          <p className="text-xl text-muted mb-10 max-w-xl mx-auto">
            Free forever for solo developers. No credit card required. Start building your personal knowledge base today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto font-bold bg-blue hover:bg-blue/90 text-white px-8 py-4 rounded-xl text-lg shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all">
              Start Your Journal
            </Link>
            <Link href="/login" className="w-full sm:w-auto font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl text-lg transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-[#040608]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📓</span>
            <div>
              <p className="font-syne font-bold text-white leading-none mb-1">DebugDiary</p>
              <p className="text-xs text-muted">Built for developers who hate repeating themselves.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-muted hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="text-white font-medium hover:text-blue transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
