import * as vscode from 'vscode'
import { getApiKey, setApiKey, isConnected, getApiUrl } from './auth'
import { verifyKey, saveEntry, checkDejavu } from './api'

export function activate(context: vscode.ExtensionContext) {

    // Show status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)

    function updateStatusBar() {
        if (isConnected()) {
            statusBar.text = '$(book) DebugDiary'
            statusBar.tooltip = 'DebugDiary connected - right-click to save errors'
            statusBar.backgroundColor = undefined
        } else {
            statusBar.text = '$(book) DebugDiary ⚠'
            statusBar.tooltip = 'DebugDiary not connected - click to connect'
            statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
        }
        statusBar.command = isConnected() ? 'debugdiary.openDashboard' : 'debugdiary.connect'
        statusBar.show()
    }

    updateStatusBar()

    // COMMAND 1: Connect Account
    const connectCmd = vscode.commands.registerCommand('debugdiary.connect', async () => {
        const key = await vscode.window.showInputBox({
            title: 'Connect DebugDiary',
            prompt: `Paste your API key from ${getApiUrl()}/settings/api-keys`,
            password: true,
            placeHolder: 'dd_xxxxxxxxxxxxxxxx...',
            ignoreFocusOut: true
        })

        if (!key) return

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Verifying API key...',
            cancellable: false
        }, async () => {
            await setApiKey(key)
            const result = await verifyKey()

            if (result.valid) {
                updateStatusBar()
                vscode.window.showInformationMessage(`✓ DebugDiary connected! Welcome ${result.userName}. Right-click any error to save it.`)
            } else {
                await setApiKey('')
                vscode.window.showErrorMessage(`Invalid API key. Check your key at ${getApiUrl()}`)
            }
        })
    })

    // COMMAND 2: Save Error
    const saveCmd = vscode.commands.registerCommand('debugdiary.saveError', async () => {
        if (!isConnected()) {
            const connect = await vscode.window.showErrorMessage('DebugDiary not connected.', 'Connect Now')
            if (connect) {
                vscode.commands.executeCommand('debugdiary.connect')
            }
            return
        }

        const editor = vscode.window.activeTextEditor
        const selectedText = editor?.document.getText(editor.selection) || ''

        const errorText = await vscode.window.showInputBox({
            title: 'Save to DebugDiary (1/2)',
            prompt: 'Error message',
            value: selectedText,
            placeHolder: 'TypeError: Cannot read...',
            ignoreFocusOut: true
        })

        if (!errorText) return

        const dejavu = await checkDejavu(errorText)

        if (dejavu.match) {
            const similarity = Math.round((dejavu.similarity || 0) * 100)
            const action = await vscode.window.showWarningMessage(
                `⚡ Déjà Vu! You hit something similar before (${similarity}% match): "${dejavu.match.summary || dejavu.match.errorText}"`,
                'View Fix',
                'Continue Anyway',
                'Cancel'
            )

            if (action === 'View Fix') {
                vscode.env.openExternal(vscode.Uri.parse(`${getApiUrl()}/entries/${dejavu.match.id}`))
                return
            }
            if (action === 'Cancel') return
        }

        const fixText = await vscode.window.showInputBox({
            title: 'Save to DebugDiary (2/2)',
            prompt: 'What fixed it?',
            placeHolder: 'Added || [] fallback...',
            ignoreFocusOut: true
        })

        if (!fixText) return

        const codeSnippet = selectedText && selectedText !== errorText ? selectedText : undefined
        const contextStr = vscode.workspace.workspaceFolders?.[0]?.name

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Saving to DebugDiary...',
            cancellable: false
        }, async () => {
            const result = await saveEntry({
                errorText,
                fixText,
                codeSnippet,
                context: contextStr
            })

            if (result.success) {
                const action = await vscode.window.showInformationMessage('✓ Saved to DebugDiary! AI is enriching your entry.', 'View Entry')
                if (action === 'View Entry') {
                    vscode.env.openExternal(vscode.Uri.parse(`${getApiUrl()}/entries/${result.entryId}`))
                }
            } else {
                vscode.window.showErrorMessage('Failed to save. Check your connection and try again.')
            }
        })
    })

    // COMMAND 3: Check Déjà Vu
    const dejavuCmd = vscode.commands.registerCommand('debugdiary.checkDejavu', async () => {
        if (!isConnected()) {
            vscode.window.showErrorMessage('Connect DebugDiary first.')
            return
        }

        const editor = vscode.window.activeTextEditor
        const selectedText = editor?.document.getText(editor.selection)

        if (!selectedText) {
            vscode.window.showWarningMessage('Select an error message first.')
            return
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Checking your history...',
            cancellable: false
        }, async () => {
            const result = await checkDejavu(selectedText)

            if (result.match) {
                const similarity = Math.round((result.similarity || 0) * 100)
                const action = await vscode.window.showWarningMessage(
                    `⚡ Déjà Vu! ${similarity}% match: "${result.match.summary || result.match.errorText}"\nFix: "${result.match.fixText.substring(0, 80)}..."`,
                    'View Full Entry',
                    'Dismiss'
                )

                if (action === 'View Full Entry') {
                    vscode.env.openExternal(vscode.Uri.parse(`${getApiUrl()}/entries/${result.match.id}`))
                }
            } else {
                vscode.window.showInformationMessage('✓ No similar errors in your DebugDiary.')
            }
        })
    })

    // COMMAND 4: Open Dashboard
    const dashboardCmd = vscode.commands.registerCommand('debugdiary.openDashboard', () => {
        vscode.env.openExternal(vscode.Uri.parse(getApiUrl()))
    })

    context.subscriptions.push(connectCmd, saveCmd, dejavuCmd, dashboardCmd, statusBar)
}

export function deactivate() { }
