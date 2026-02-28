'use strict'

const https = require('https')

let config = {
    apiKey: null,
    appName: 'Node App',
    apiUrl: 'debugdiary.vercel.app',
    enabled: true
}

function captureError(error, context) {
    context = context || {}
    if (!config.apiKey || !config.enabled) return

    var errorObj = error instanceof Error
        ? error
        : new Error(String(error))

    var payload = JSON.stringify({
        apiKey: config.apiKey,
        error: errorObj.message || String(errorObj),
        stack: errorObj.stack || '',
        errorType: (errorObj.constructor && errorObj.constructor.name) || 'Error',
        source: 'sdk',
        pageUrl: context.url || 'server',
        pageTitle: context.route || 'Node.js',
        appName: config.appName,
        userAgent: 'Node.js/' + process.version,
        timestamp: new Date().toISOString(),
        context: JSON.stringify({
            appName: config.appName,
            nodeVersion: process.version,
            platform: process.platform,
            route: context.route || null,
            method: context.method || null,
            statusCode: context.statusCode || null,
            type: context.type || null
        }),
        breadcrumbs: context.breadcrumbs || []
    })

    var options = {
        hostname: config.apiUrl,
        path: '/api/sdk/capture',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }

    try {
        var req = https.request(options, function () { })
        req.on('error', function () { })
        req.write(payload)
        req.end()
    } catch (e) {
        // Silent fail - never crash the host app
    }
}

function init(options) {
    options = options || {}
    config = Object.assign({}, config, options)

    if (!config.apiKey) {
        console.warn('[DebugDiary] No API key provided. SDK disabled.')
        return
    }

    // Capture uncaught exceptions
    process.on('uncaughtException', function (error) {
        console.error('[DebugDiary] Uncaught Exception:', error.message)
        captureError(error, { type: 'uncaughtException' })
        // Give time to send before exit
        setTimeout(function () { process.exit(1) }, 1000)
    })

    // Capture unhandled promise rejections
    process.on('unhandledRejection', function (reason) {
        var error = reason instanceof Error
            ? reason
            : new Error(String(reason))
        captureError(error, { type: 'unhandledRejection' })
    })

    console.log('[DebugDiary] SDK initialized for:', config.appName)
}

// Express error middleware
function expressMiddleware() {
    return function (err, req, res, next) {
        captureError(err, {
            route: req.path,
            method: req.method,
            statusCode: res.statusCode,
            type: 'express_error'
        })
        next(err)
    }
}

module.exports = {
    init: init,
    captureError: captureError,
    expressMiddleware: expressMiddleware
}
