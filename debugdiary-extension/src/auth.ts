import * as vscode from 'vscode'

export function getApiKey(): string | undefined {
    const config = vscode.workspace.getConfiguration('debugdiary')
    return config.get<string>('apiKey')
}

export async function setApiKey(key: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('debugdiary')
    await config.update('apiKey', key, vscode.ConfigurationTarget.Global)
}

export function getApiUrl(): string {
    const config = vscode.workspace.getConfiguration('debugdiary')
    return config.get<string>('apiUrl') || 'https://debugdiary-production.vercel.app'
}

export function isConnected(): boolean {
    const key = getApiKey()
    return !!(key && key.length > 10)
}
