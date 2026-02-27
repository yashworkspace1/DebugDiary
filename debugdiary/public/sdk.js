(function () {
    'use strict';

    var script = document.currentScript;
    if (!script) return;

    var apiKey = script.getAttribute('data-key');
    var apiUrl = script.getAttribute('data-url') || 'https://debugdiary.vercel.app';
    var appName = script.getAttribute('data-app') || document.title || 'Unknown App';

    if (!apiKey) {
        console.warn('[DebugDiary] Missing data-key attribute. SDK disabled.');
        return;
    }

    // Deduplication: don't send the same error twice within 5 seconds
    var recentErrors = {};

    function captureError(errorData) {
        var dedupKey = errorData.message + ':' + errorData.line + ':' + errorData.col;
        var now = Date.now();
        if (recentErrors[dedupKey] && now - recentErrors[dedupKey] < 5000) return;
        recentErrors[dedupKey] = now;

        var payload = {
            apiKey: apiKey,
            error: errorData.message,
            stack: errorData.stack,
            source: errorData.source,
            line: errorData.line,
            col: errorData.col,
            errorType: errorData.type,
            pageUrl: window.location.href,
            pageTitle: document.title,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            appName: appName
        };

        try {
            fetch(apiUrl + '/api/sdk/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(function () { });
        } catch (e) {
            // Silent fail — never break the host app
        }
    }

    // 1. Capture uncaught errors
    window.addEventListener('error', function (event) {
        captureError({
            message: event.message,
            stack: event.error ? event.error.stack || '' : '',
            source: event.filename,
            line: event.lineno,
            col: event.colno,
            type: 'uncaught_error'
        });
    });

    // 2. Capture unhandled Promise rejections
    window.addEventListener('unhandledrejection', function (event) {
        captureError({
            message: String(event.reason),
            stack: event.reason && event.reason.stack ? event.reason.stack : '',
            source: window.location.href,
            line: 0,
            col: 0,
            type: 'unhandled_promise'
        });
    });

    // 3. Capture console.error calls that look like errors
    var originalConsoleError = console.error;
    console.error = function () {
        originalConsoleError.apply(console, arguments);
        var args = Array.prototype.slice.call(arguments);
        var message = args.map(function (a) { return String(a); }).join(' ');
        if (message.includes('Error') || message.includes('error')) {
            captureError({
                message: message.substring(0, 500),
                stack: new Error().stack || '',
                source: window.location.href,
                line: 0,
                col: 0,
                type: 'console_error'
            });
        }
    };

    // SDK ready
    console.log(
        '%c DebugDiary SDK Active ',
        'background: #00ff88; color: black; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
    );
})();
