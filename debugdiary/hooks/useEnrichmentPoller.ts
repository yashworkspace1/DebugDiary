"use client"

import { useState, useEffect } from "react"

export const useEnrichmentPoller = (entryId: string, initiallyEnriched: boolean) => {
    const [enriched, setEnriched] = useState(initiallyEnriched)
    const [entry, setEntry] = useState<any>(null)

    useEffect(() => {
        if (enriched || !entryId) return

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
