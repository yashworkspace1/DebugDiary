export const languageColors: Record<string, { bg: string, color: string, border: string }> = {
    javascript: { bg: 'rgba(247,208,62,0.12)', color: '#f7d03e', border: 'rgba(247,208,62,0.25)' },
    typescript: { bg: 'rgba(49,120,198,0.12)', color: '#3178c6', border: 'rgba(49,120,198,0.25)' },
    python: { bg: 'rgba(55,118,171,0.12)', color: '#3776ab', border: 'rgba(55,118,171,0.25)' },
    react: { bg: 'rgba(97,218,251,0.12)', color: '#61dafb', border: 'rgba(97,218,251,0.25)' },
    nextjs: { bg: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'rgba(255,255,255,0.15)' },
    express: { bg: 'rgba(255,255,255,0.06)', color: '#cccccc', border: 'rgba(255,255,255,0.12)' },
    go: { bg: 'rgba(0,173,216,0.12)', color: '#00add8', border: 'rgba(0,173,216,0.25)' },
    rust: { bg: 'rgba(222,165,132,0.12)', color: '#dea584', border: 'rgba(222,165,132,0.25)' },
    default: { bg: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'rgba(255,255,255,0.15)' }
}

export const errorTypeColors: Record<string, string> = {
    TypeError: '#ef4444',
    CORS: '#f59e0b',
    Auth: '#8b5cf6',
    Database: '#3b82f6',
    Config: '#6b7a99',
    SyntaxError: '#ec4899',
    Other: '#6b7a99',
}

export const difficultyConfig: Record<string, { color: string, label: string }> = {
    easy: { color: '#22c55e', label: 'Easy' },
    medium: { color: '#f59e0b', label: 'Medium' },
    hard: { color: '#ef4444', label: 'Hard' },
}
