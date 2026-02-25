"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, BookOpen, Bug, Code2, Sparkles, AlertCircle, ArrowRight, Flame } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { errorTypeColors, languageColors } from "@/lib/badges"

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface2 border border-border rounded-lg p-3 text-sm shadow-xl">
                <p className="font-medium mb-1">{payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill || payload[0].fill }}></div>
                    <span className="text-muted">{payload[0].value} errors</span>
                </div>
            </div>
        )
    }
    return null
}

const HeatmapCell = ({ date, count, colIndex }: { date: string, count: number, colIndex: number }) => {
    let bg = "bg-white/5"
    if (count === 1) bg = "bg-blue/30"
    if (count === 2) bg = "bg-blue/60"
    if (count >= 3) bg = "bg-blue/90"

    // If it's one of the first 3 columns, align left so it doesn't clip
    const tooltipAlignment = colIndex < 3
        ? "left-0 -translate-x-2"
        : "left-1/2 -translate-x-1/2"

    return (
        <div
            className={`w-[10px] h-[10px] rounded-[2px] ${bg} hover:ring-1 hover:ring-white transition-all cursor-pointer group relative hover:z-50`}
        >
            <div className={`opacity-0 group-hover:opacity-100 absolute bottom-full ${tooltipAlignment} mb-2 px-2 py-1 bg-surface2 border border-border text-xs rounded whitespace-nowrap z-50 pointer-events-none transition-opacity shadow-lg`}>
                {count > 0 ? `${count} entries` : 'No entries'} on {date}
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load dashboard")
                return res.json()
            })
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(e => {
                setError(e.message)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl"></div>)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80 bg-white/5 rounded-2xl"></div>
                        <div className="h-80 bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center text-red">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p>Error loading dashboard.</p>
            </div>
        )
    }

    const { stats, byLanguage, byErrorType, recentEntries, activityGrid } = data

    const StatCard = ({ title, value, icon: Icon, color, subtext, subtextColor = "text-muted" }: { title: string, value: string | number, icon: any, color: string, subtext: string, subtextColor?: string }) => (
        <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-full flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-syne font-bold text-text mb-1">{value}</h3>
                <p className="text-sm text-text font-medium mb-1">{title}</p>
                <p className={`text-xs ${subtextColor}`}>{subtext}</p>
            </div>
        </div>
    )

    // Build Activity Grid (12 cols x 7 rows)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const msInDay = 24 * 60 * 60 * 1000
    const gridDays = []

    // Generate the last 84 days strictly
    for (let i = 83; i >= 0; i--) {
        const d = new Date(today.getTime() - i * msInDay)
        const dateStr = d.toISOString().split('T')[0]
        gridDays.push({
            dateStr,
            count: activityGrid[dateStr] || 0
        })
    }

    // Convert into columns of 7 to flow top-to-bottom, left-to-right
    const gridCols = []
    for (let i = 0; i < gridDays.length; i += 7) {
        gridCols.push(gridDays.slice(i, i + 7))
    }

    // Insight calculation
    const topErrorEntry = byErrorType?.[0]
    const topErrorColor = topErrorEntry ? (errorTypeColors[topErrorEntry.name] || '#3b82f6') : '#3b82f6'

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-syne text-3xl font-bold text-text mb-1">Dashboard</h1>
                    <p className="text-muted">Your debugging intelligence at a glance</p>
                </div>
                <Link prefetch={true} href="/entries/new" className="bg-blue hover:bg-blue/90 text-background font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all w-fit shrink-0">
                    <PlusIcon className="h-4 w-4" /> New Entry
                </Link>
            </div>

            {/* ROW 1: STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Errors Logged"
                    value={stats.total}
                    icon={BookOpen}
                    color="bg-blue/10 text-blue"
                    subtext={`+${stats.thisWeek} this week`}
                    subtextColor={stats.thisWeek > 0 ? "text-green" : "text-muted"}
                />
                <StatCard
                    title="AI Enriched"
                    value={stats.aiEnriched}
                    icon={Sparkles}
                    color="bg-purple-500/10 text-purple-400"
                    subtext={`${stats.total ? Math.round((stats.aiEnriched / stats.total) * 100) : 0}% of your journal`}
                    subtextColor="text-blue"
                />
                <StatCard
                    title="Day Streak"
                    value={stats.streak}
                    icon={Flame}
                    color="bg-orange-500/10 text-orange-500"
                    subtext="Keep logging daily!"
                    subtextColor="text-orange-500/80"
                />
                <StatCard
                    title="Languages"
                    value={stats.languages}
                    icon={Code2}
                    color="bg-green-500/10 text-green-500"
                    subtext={stats.total > 0 ? `Top: ${stats.topLanguage}` : "No data yet"}
                />
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* DONUT CHART */}
                <div className="lg:col-span-6 xl:col-span-7 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                    <h3 className="font-semibold text-lg text-text">Errors by Type</h3>
                    <p className="text-sm text-muted mb-4">What breaks most for you</p>

                    {byErrorType.length === 0 ? (
                        <div className="h-[250px] flex items-center justify-center text-muted text-sm border border-white/5 border-dashed rounded-xl">No error types logged</div>
                    ) : (
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byErrorType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {byErrorType.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={errorTypeColors[entry.name] || errorTypeColors.Other} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value: string) => <span className="text-muted text-xs mr-3">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                                <span className="text-3xl font-syne font-bold">{stats.total}</span>
                                <span className="text-[10px] text-muted uppercase tracking-widest mt-0.5">errors</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* BAR CHART */}
                <div className="lg:col-span-6 xl:col-span-5 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                    <h3 className="font-semibold text-lg text-text">Languages</h3>
                    <p className="text-sm text-muted mb-4">Your debugging spread</p>

                    {byLanguage.length === 0 ? (
                        <div className="h-[250px] flex items-center justify-center text-muted text-sm border border-white/5 border-dashed rounded-xl">No languages logged</div>
                    ) : (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={byLanguage}
                                    layout="vertical"
                                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="language"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        width={80}
                                    />
                                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                                        {byLanguage.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={(languageColors[entry.language.toLowerCase()] || languageColors.default).color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 3: RECENT & INSIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* RECENT ENTRIES */}
                <div className="lg:col-span-7 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-text">Recent Entries</h3>
                        <Link href="/entries" className="text-xs text-blue hover:text-blue/80 flex items-center gap-1 transition-colors group">
                            View all <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {recentEntries.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted text-sm border border-white/5 border-dashed rounded-xl p-8">No entries yet. Start logging!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {recentEntries.map((entry: any) => {
                                const langStyle = entry.language ? (languageColors[entry.language.toLowerCase()] || languageColors.default) : languageColors.default;
                                return (
                                    <Link key={entry.id} href={`/entries/${entry.id}`} className="group relative flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 pr-4">
                                            <div className="flex shrink-0 gap-1.5">
                                                {entry.language && (
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langStyle.color }}></div>
                                                )}
                                                {entry.errorType && (
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: errorTypeColors[entry.errorType] || errorTypeColors.Other }}></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-text/90 truncate font-medium group-hover:text-blue transition-colors">
                                                {entry.summary || entry.errorText}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {entry.aiEnriched && <Sparkles className="h-3.5 w-3.5 fill-blue text-blue opacity-80" />}
                                            <span className="text-xs text-muted w-24 text-right">
                                                {Math.floor((new Date().getTime() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d ago
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* WEAK SPOT INSIGHT */}
                <div className="lg:col-span-5 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors flex flex-col">
                    <h3 className="font-semibold text-lg text-text mb-6">Your Weak Spot</h3>

                    {topErrorEntry ? (
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10" style={{ color: topErrorColor }}>
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-syne font-bold text-text leading-none">{topErrorEntry.value}</span>
                                        <span className="text-sm text-muted pb-0.5">times</span>
                                    </div>
                                    <p className="text-sm text-muted mt-1 leading-snug">
                                        you've hit <strong style={{ color: topErrorColor }}>{topErrorEntry.name}</strong> errors.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                {byErrorType.slice(0, 3).map((err: any) => {
                                    const percent = Math.round((err.value / stats.total) * 100);
                                    const color = errorTypeColors[err.name] || errorTypeColors.Other;
                                    return (
                                        <div key={err.name} className="relative">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-white/80">{err.name}</span>
                                                <span className="text-muted">{err.value} <span className="opacity-50">({percent}%)</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percent}%`, backgroundColor: color }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="bg-blue/5 border-l-4 border-blue rounded-r-lg p-3 text-xs text-blue/90 leading-relaxed">
                                💡 You encounter {topErrorEntry.name} errors most often. Consider creating a cheat sheet or adding fixes to your search shortcuts.
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted text-sm border border-white/5 border-dashed rounded-xl">
                            Log some errors to see insights!
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 4: ACTIVITY HEATMAP */}
            <div className="bg-[#0c0f14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="mb-6">
                    <h3 className="font-semibold text-lg text-text">Logging Activity</h3>
                    <p className="text-sm text-muted">Last 12 weeks of error logging</p>
                </div>

                <div className="flex gap-4">
                    {/* Day Labels */}
                    <div className="flex flex-col justify-between text-[10px] text-muted font-medium py-1 w-6">
                        <span></span>
                        <span>M</span>
                        <span></span>
                        <span>W</span>
                        <span></span>
                        <span>F</span>
                        <span></span>
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[3px] flex-1 overflow-x-auto pt-8 -mt-8 pb-2 px-6 -ml-6 scrollbar-hide">
                        {gridCols.map((col, colIndex) => (
                            <div key={`col-${colIndex}`} className="flex flex-col gap-[3px]">
                                {col.map((cell, cellIndex) => (
                                    <HeatmapCell key={`cell-${colIndex}-${cellIndex}`} date={cell.dateStr} count={cell.count} colIndex={colIndex} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}

function PlusIcon(props: any) {
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
