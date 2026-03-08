import { decrypt } from '@/lib/encryption'

export interface GitHubFile {
  path: string
  content: string
  url: string
}

export async function fetchFileFromGitHub(
  repoUrl: string,
  filePath: string,
  encryptedPAT?: string | null
): Promise<GitHubFile | null> {
  try {
    const url = new URL(repoUrl)
    const parts = url.pathname
      .split('/')
      .filter(Boolean)

    if (parts.length < 2) return null

    const owner = parts[0]
    const repo = parts[1]
    
    // Support monorepo paths like /yashworkspace1/DebugDiary/tree/main/debugdiary
    let baseDir = ''
    if (parts.length >= 4 && parts[2] === 'tree') {
      baseDir = parts.slice(4).join('/') + '/'
    }

    const cleanPath = filePath
      .replace(
        /^.*?(?=\b(src|app|pages|lib|components)\/)/,
        ''
      )
      .replace(/:\d+:\d+.*$/, '')
      .replace(/^\//, '')
      .split('?')[0]

    if (!cleanPath) return null

    const fullPath = baseDir + cleanPath

    const apiUrl =
      `https://api.github.com/repos/` +
      `${owner}/${repo}/contents/${fullPath}`

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DebugDiary'
    }

    // Decrypt PAT only when needed
    if (encryptedPAT) {
      const plainPAT = decrypt(encryptedPAT)
      if (plainPAT) {
        headers['Authorization'] = `token ${plainPAT}`
      }
    }

    const response = await fetch(apiUrl, { headers })

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    const content = Buffer.from(
      data.content,
      'base64'
    ).toString('utf-8')

    return {
      path: cleanPath,
      content,
      url: data.html_url
    }

  } catch (err) {
    console.error('[DebugDiary] GitHub fetch failed:', err)
    return null
  }
}

export function extractFilePathFromStack(
  stack: string
): string | null {
  if (!stack) return null

  const patterns = [
    /\(([^)]+\.(tsx?|jsx?|js|ts)):\d+:\d+\)/,
    /at\s+([^\s]+\.(tsx?|jsx?|js|ts)):\d+:\d+/,
    /([./][^\s]+\.(tsx?|jsx?|js|ts)):\d+/
  ]

  for (const pattern of patterns) {
    const match = stack.match(pattern)
    if (match) return match[1]
  }

  return null
}
