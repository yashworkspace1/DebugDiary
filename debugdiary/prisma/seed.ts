import { PrismaClient } from '@prisma/client'
import { generateEmbedding } from '../lib/gemini'

const prisma = new PrismaClient()

async function main() {
    // Create Demo User
    const user = await prisma.user.create({
        data: {
            name: "Dev Demo",
            email: "dev@debugdiary.com",
            password: "demo2026",
        }
    })

    // Removed fakeEmbedding
    const entriesData = [
        {
            errorText: "Cannot read properties of undefined (reading 'map')",
            fixText: "API was returning null instead of empty array. Added || [] fallback on the response",
            language: "javascript",
            framework: "react",
            errorType: "TypeError",
            summary: "Undefined map error from null API response",
            whyItHappens: "Array.map() requires the caller to be an array. When APIs return null instead of [], accessing .map() throws TypeError. Always use fallback: data?.items || []",
            tags: ["undefined", "null", "array", "api", "react"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Access to fetch at 'http://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy",
            fixText: "Added cors() middleware to Express server with origin whitelist. Also added credentials: true",
            language: "javascript",
            framework: "express",
            errorType: "CORS",
            summary: "CORS blocked localhost from accessing Express API",
            whyItHappens: "Browsers enforce Same-Origin Policy. Express needs explicit CORS headers to allow cross-origin requests. The cors() middleware handles this automatically.",
            tags: ["cors", "express", "fetch", "headers", "middleware"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "prisma:error Invalid `prisma.user.findUnique()` invocation: Unique constraint failed on the fields: (`email`)",
            fixText: "Added try-catch and check if user exists before creating. Was creating duplicate users on retry",
            language: "typescript",
            framework: "nextjs",
            errorType: "Database",
            summary: "Prisma unique constraint violated on user email field",
            whyItHappens: "PostgreSQL enforces unique constraints at the DB level. Prisma throws P2002 error when inserting duplicate unique values. Always check existence before insert.",
            tags: ["prisma", "postgresql", "unique", "constraint", "p2002"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "ModuleNotFoundError: No module named 'requests'",
            fixText: "Was running script with wrong Python environment. pip install requests in the correct venv fixed it",
            language: "python",
            framework: "none",
            errorType: "Config",
            summary: "Python requests module missing from active virtualenv",
            whyItHappens: "Python virtualenvs are isolated. Installing packages globally doesn't make them available inside a venv and vice versa. Always activate the correct env before installing.",
            tags: ["python", "venv", "pip", "import", "module"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "JWT expired: JsonWebTokenError: jwt expired",
            fixText: "Refresh token logic wasn't implemented. Added auto-refresh on 401 response in axios interceptor",
            language: "javascript",
            framework: "express",
            errorType: "Auth",
            summary: "JWT expiry not handled — missing refresh token interceptor",
            whyItHappens: "JWTs have a configurable expiry (exp claim). Once expired, the server rejects them with 401. Client must detect 401, use refresh token to get new JWT, retry original request.",
            tags: ["jwt", "auth", "token", "axios", "interceptor", "401"],
            difficulty: "hard",
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Error: ENOENT: no such file or directory, open './config.json'",
            fixText: "Path was relative to where node was run from, not the file. Changed to path.join(__dirname, 'config.json')",
            language: "javascript",
            framework: "none",
            errorType: "Config",
            summary: "Relative file path breaks when Node run from different directory",
            whyItHappens: "Relative paths in Node.js resolve from process.cwd() (where you ran node), not from the file's location. __dirname gives the file's directory. Always use path.join(__dirname, ...)",
            tags: ["node", "path", "dirname", "file", "enoent"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "react hook \"useState\" cannot be called inside a callback",
            fixText: "Was calling useState inside useEffect callback. Moved state declaration to top of component",
            language: "typescript",
            framework: "react",
            errorType: "SyntaxError",
            summary: "React hook called inside callback violating Rules of Hooks",
            whyItHappens: "React requires hooks to always be called at the top level of a component, never inside loops, conditions, or nested functions. This ensures hook call order is consistent across renders.",
            tags: ["react", "hooks", "useState", "rules-of-hooks", "useEffect"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "PG: password authentication failed for user postgres",
            fixText: "DATABASE_URL had wrong password after Supabase reset. Updated .env and restarted server",
            language: "typescript",
            framework: "nextjs",
            errorType: "Database",
            summary: "PostgreSQL auth failed due to outdated DATABASE_URL in .env",
            whyItHappens: "Database credentials in connection strings must exactly match current DB credentials. After password resets or project recreation, .env must be updated and server restarted.",
            tags: ["postgres", "supabase", "env", "connection", "password"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Hydration failed because the initial UI does not match what was rendered on the server",
            fixText: "Was using window.localStorage in component that ran during SSR. Wrapped in useEffect to run client-side only",
            language: "typescript",
            framework: "nextjs",
            errorType: "TypeError",
            summary: "Next.js hydration mismatch from browser-only API in SSR component",
            whyItHappens: "Next.js renders components on the server where browser APIs like localStorage don't exist. This causes a mismatch between server HTML and client HTML. Always wrap browser APIs in useEffect.",
            tags: ["nextjs", "hydration", "ssr", "localStorage", "useEffect"],
            difficulty: "hard",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "SyntaxError: Unexpected token '<' — usually means server returned HTML instead of JSON",
            fixText: "API route was throwing unhandled error and returning HTML error page. Added try/catch and proper JSON error response",
            language: "javascript",
            framework: "nextjs",
            errorType: "SyntaxError",
            summary: "fetch() received HTML error page instead of expected JSON",
            whyItHappens: "When a server throws an unhandled error, it often returns a 500 HTML page. fetch() tries to parse it as JSON causing this error. Fix: always wrap API handlers in try/catch and return JSON errors.",
            tags: ["fetch", "json", "parse", "api", "500", "try-catch"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "django.db.utils.OperationalError: no such table: main_user",
            fixText: "Forgot to run migrations after adding new model. Fixed with python manage.py makemigrations and migrate",
            language: "python",
            framework: "django",
            errorType: "Database",
            summary: "Missing database table due to unapplied Django migrations",
            whyItHappens: "When creating new models in Django, you have to run `makemigrations` and `migrate` so the database tables are created accordingly. Otherwise, the app errors when trying to query them.",
            tags: ["django", "python", "database", "migrations"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Items not aligning inline despite display: flex",
            fixText: "Parent container didn't have enough width, causing flex items to wrap. Added flex-wrap: nowrap and min-width padding.",
            language: "css",
            framework: "none",
            errorType: "Layout",
            summary: "Flexbox items wrapping unexpectedly",
            whyItHappens: "Flex items shrink and wrap by default if the parent doesn't have sufficient width and wrap is enabled. Adjusting flex properties fixes alignment issues.",
            tags: ["css", "frontend", "flexbox", "layout"],
            difficulty: "easy",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "CONFLICT (content): Merge conflict in src/app.js",
            fixText: "Manually resolved merge conflict, keeping both changes carefully inside the VS Code merge editor.",
            language: "none",
            framework: "none",
            errorType: "Git",
            summary: "Git merge conflict in shared file during PR merge",
            whyItHappens: "If two branches edit the exact same lines of code, Git can't figure out which version to keep automatically and requires a human to resolve the conflict before proceeding.",
            tags: ["git", "merge", "conflict", "version-control"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Connection refused from localhost:5432 to web_container",
            fixText: "Changed host from localhost to db in docker-compose, since Docker containers can't use localhost to communicate with each other.",
            language: "none",
            framework: "docker",
            errorType: "Network",
            summary: "Docker container localhost connection refused",
            whyItHappens: "Inside a Docker container, `localhost` refers to the container itself, not the host machine or other containers. You must use the compose service name as the hostname.",
            tags: ["docker", "network", "compose", "localhost"],
            difficulty: "hard",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            errorText: "Type 'string | undefined' is not assignable to type 'string'",
            fixText: "Added a runtime undefined check and typescript non-null assertion before assigning the value.",
            language: "typescript",
            framework: "none",
            errorType: "TypeError",
            summary: "TypeScript strict null checks failing on optional property",
            whyItHappens: "TypeScript correctly warns you when a value that might be null/undefined is passed to a function that strictly expects a value. Always handle undefined cases explicitly.",
            tags: ["typescript", "null", "undefined", "type-error"],
            difficulty: "medium",
            createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000)
        }
    ]

    for (const item of entriesData) {
        await prisma.entry.create({
            data: {
                userId: user.id,
                ...item,
                aiEnriched: true,
                source: 'web',
                embedding: await generateEmbedding(item.errorText)
            }
        })
    }

    console.log("Seed data created successfully.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
