"use client"

import { useState, useEffect, useRef } from "react"

export const useEnrichmentPoller = (entryId: string, initiallyEnriched: boolean) => {
    const [enriched, setEnriched] = useState(initiallyEnriched)
    const [entry, setEntry] = useState<any>(null)
    const triggered = useRef(false)

    useEffect(() => {
        if (enriched || !entryId) return

        // Actively trigger enrichment on the server (handles the case where
        // the background task in the capture endpoint was killed by Vercel's
        // serverless function timeout before AI enrichment could complete).
        if (!triggered.current) {
            triggered.current = true
            fetch(`/api/entries/${entryId}/enrich`, { method: 'POST' })
                .catch(() => { /* silent — polling will still catch completion */ })
        }

        // Poll every 2.5s until the entry is enriched
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/entries/${entryId}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data?.aiEnriched) {
                        setEnriched(true)
                        setEntry(data)
                        clearInterval(interval)
                    }
                }
            } catch (err) {
                console.error("Failed to poll entry:", err)
            }
        }, 2500)

        return () => clearInterval(interval)
    }, [entryId, enriched])

    return { enriched, entry }
}
