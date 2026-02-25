export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return Response.json({ error: "Missing API Key" })

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const data = await res.json()

        let embedModels = []
        if (data.models) {
            embedModels = data.models.filter((m: any) => m.supportedGenerationMethods.includes('embedContent')).map((m: any) => m.name)
        }

        return Response.json({ success: true, models: embedModels })
    } catch (e: any) {
        console.error("API Error:", e)
        return Response.json({ success: false, error: e.message || String(e) }, { status: 500 })
    }
}
