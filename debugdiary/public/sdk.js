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

    // --- BREADCRUMBS ---
    var breadcrumbs = [];
    var MAX_BREADCRUMBS = 20;

    function addBreadcrumb(crumb) {
        var newCrumb = {};
        for (var key in crumb) { newCrumb[key] = crumb[key]; }
        newCrumb.timestamp = Date.now();
        breadcrumbs.push(newCrumb);
        if (breadcrumbs.length > MAX_BREADCRUMBS) {
            breadcrumbs.shift();
        }
    }

    // Track navigation (PushState)
    var originalPushState = history.pushState;
    history.pushState = function () {
        originalPushState.apply(history, arguments);
        addBreadcrumb({
            type: 'navigation',
            url: window.location.href,
            title: document.title
        });
    };

    window.addEventListener('popstate', function () {
        addBreadcrumb({
            type: 'navigation',
            url: window.location.href,
            title: document.title
        });
    });

    // Track clicks
    document.addEventListener('click', function (e) {
        var target = e.target;
        var text = (
            target.innerText ||
            target.value ||
            target.getAttribute('aria-label') ||
            target.getAttribute('placeholder') ||
            target.tagName
        ).substring(0, 60);

        addBreadcrumb({
            type: 'click',
            element: text,
            tag: target.tagName.toLowerCase(),
            id: target.id || null,
            className: target.className && typeof target.className === 'string'
                ? target.className.split(' ')[0]
                : null
        });
    }, true);

    // Track fetch requests
    var originalFetch = window.fetch;
    window.fetch = async function () {
        var args = arguments;
        var url = typeof args[0] === 'string'
            ? args[0]
            : args[0] && args[0].url ? args[0].url : 'unknown';

        var startTime = Date.now();

        try {
            var response = await originalFetch.apply(window, args);
            addBreadcrumb({
                type: 'fetch',
                url: url.substring(0, 100),
                method: args[1] && args[1].method ? args[1].method : 'GET',
                status: response.status,
                duration: Date.now() - startTime
            });
            return response;
        } catch (err) {
            addBreadcrumb({
                type: 'fetch_error',
                url: url.substring(0, 100),
                method: args[1] && args[1].method ? args[1].method : 'GET',
                error: err.message,
                duration: Date.now() - startTime
            });
            throw err;
        }
    };

    // Track console warnings
    var originalConsoleWarn = console.warn;
    console.warn = function () {
        originalConsoleWarn.apply(console, arguments);
        var args = Array.prototype.slice.call(arguments);
        addBreadcrumb({
            type: 'console_warn',
            message: args.map(function (a) { return String(a); }).join(' ').substring(0, 100)
        });
    };

    // Initial page load
    addBreadcrumb({
        type: 'page_load',
        url: window.location.href,
        title: document.title,
        referrer: document.referrer || null
    });

    // Deduplication: don't send the same error twice within 5 seconds
    var recentErrors = {};

    function captureError(errorData) {
        var dedupKey = errorData.message + ':' + errorData.line + ':' + errorData.col;
        var now = Date.now();
        if (recentErrors[dedupKey] && now - recentErrors[dedupKey] < 5000) return;
        recentErrors[dedupKey] = now;

        // Add error as final breadcrumb
        addBreadcrumb({
            type: 'error',
            message: errorData.message.substring(0, 100)
        });

        var breadcrumbsWithRelativeTime = breadcrumbs.map(function (crumb) {
            var c = {};
            for (var key in crumb) { c[key] = crumb[key]; }
            c.secondsAgo = Math.round((now - crumb.timestamp) / 1000);
            return c;
        });

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
            appName: appName,
            clientSource: 'sdk_js',
            breadcrumbs: breadcrumbsWithRelativeTime
        };

        try {
            fetch(apiUrl + '/api/sdk/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).then(function (res) {
                if (res.ok) console.log('[DebugDiary] Error captured successfully');
                else console.warn('[DebugDiary] Failed to send error:', res.status);
            }).catch(function (err) {
                console.error('[DebugDiary] Network error sending report:', err);
            });
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

        addBreadcrumb({
            type: 'console_error',
            message: message.substring(0, 100)
        });

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
