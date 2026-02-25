import axios from 'axios'
import { getApiKey, getApiUrl } from './auth'

function getHeaders() {
    return {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json'
    }
}

export async function verifyKey(): Promise<{ valid: boolean, userName?: string }> {
    try {
        const res = await axios.get(`${getApiUrl()}/api/extension/verify`, { headers: getHeaders() })
        return res.data
    } catch {
        return { valid: false }
    }
}

export async function saveEntry(data: {
    errorText: string
    fixText: string
    codeSnippet?: string
    context?: string
}): Promise<{ success: boolean; entryId?: string }> {
    try {
        const res = await axios.post(`${getApiUrl()}/api/extension/save`, data, { headers: getHeaders() })
        return res.data
    } catch {
        return { success: false }
    }
}

export async function checkDejavu(errorText: string): Promise<{ match: any | null, similarity?: number }> {
    try {
        const res = await axios.post(`${getApiUrl()}/api/extension/check`, { errorText }, { headers: getHeaders() })
        return res.data
    } catch {
        return { match: null }
    }
}
