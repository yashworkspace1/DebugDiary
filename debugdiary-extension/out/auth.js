"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKey = getApiKey;
exports.setApiKey = setApiKey;
exports.getApiUrl = getApiUrl;
exports.isConnected = isConnected;
const vscode = require("vscode");
function getApiKey() {
    const config = vscode.workspace.getConfiguration('debugdiary');
    return config.get('apiKey');
}
async function setApiKey(key) {
    const config = vscode.workspace.getConfiguration('debugdiary');
    await config.update('apiKey', key, vscode.ConfigurationTarget.Global);
}
function getApiUrl() {
    const config = vscode.workspace.getConfiguration('debugdiary');
    return config.get('apiUrl') || 'https://debugdiary-production.vercel.app';
}
function isConnected() {
    const key = getApiKey();
    return !!(key && key.length > 10);
}
//# sourceMappingURL=auth.js.map