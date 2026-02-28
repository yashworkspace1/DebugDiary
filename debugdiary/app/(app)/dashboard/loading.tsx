"use client"

export default function Loading() {
    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
            {/* HEADER SKELETON */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-64 bg-white/5 rounded animate-pulse"></div>
                </div>
                <div className="h-11 w-32 bg-white/5 rounded-lg animate-pulse"></div>
            </div>

            {/* STATS SKELETON */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#0c0f14] border border-white/5 rounded-2xl p-5 h-[120px] flex flex-col justify-end space-y-3">
                        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
                        <div className="h-3 w-32 bg-white/5 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            {/* CHARTS SKELETON */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 xl:col-span-7 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 h-[350px]">
                    <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-4"></div>
                    <div className="h-[250px] w-full bg-white/5 rounded-xl animate-pulse"></div>
                </div>
                <div className="lg:col-span-6 xl:col-span-5 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 h-[350px]">
                    <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-4"></div>
                    <div className="h-[250px] w-full bg-white/5 rounded-xl animate-pulse"></div>
                </div>
            </div>

            {/* RECENT & INSIGHT SKELETON */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 h-[400px]">
                    <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 w-full bg-white/5 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-5 bg-[#0c0f14] border border-white/5 rounded-2xl p-6 h-[400px]">
                    <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-8"></div>
                    <div className="h-full w-full bg-white/5 rounded-xl animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
