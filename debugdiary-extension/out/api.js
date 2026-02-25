"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKey = verifyKey;
exports.saveEntry = saveEntry;
exports.checkDejavu = checkDejavu;
const axios_1 = require("axios");
const auth_1 = require("./auth");
function getHeaders() {
    return {
        'Authorization': `Bearer ${(0, auth_1.getApiKey)()}`,
        'Content-Type': 'application/json'
    };
}
async function verifyKey() {
    try {
        const res = await axios_1.default.get(`${(0, auth_1.getApiUrl)()}/api/extension/verify`, { headers: getHeaders() });
        return res.data;
    }
    catch {
        return { valid: false };
    }
}
async function saveEntry(data) {
    try {
        const res = await axios_1.default.post(`${(0, auth_1.getApiUrl)()}/api/extension/save`, data, { headers: getHeaders() });
        return res.data;
    }
    catch {
        return { success: false };
    }
}
async function checkDejavu(errorText) {
    try {
        const res = await axios_1.default.post(`${(0, auth_1.getApiUrl)()}/api/extension/check`, { errorText }, { headers: getHeaders() });
        return res.data;
    }
    catch {
        return { match: null };
    }
}
//# sourceMappingURL=api.js.map