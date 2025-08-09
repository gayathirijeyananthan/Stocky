export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_OWNER'

const envBase: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL
const inferredDevBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/v1'
  : '/api/v1'
const API_BASE = envBase || inferredDevBase

export interface AuthUser {
  id: string
  email: string
  role: Role
  shopStatus?: 'pending' | 'active' | 'inactive'
}

export interface LoginResponse {
  user: AuthUser
  tokens: { accessToken: string; refreshToken: string }
}

type Tokens = { accessToken?: string; refreshToken?: string }

function readTokens(): Tokens {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return { accessToken: parsed?.accessToken, refreshToken: parsed?.refreshToken }
  } catch {
    return {}
  }
}

function writeAccessToken(newAccessToken: string) {
  try {
    const raw = localStorage.getItem('auth')
    const parsed = raw ? JSON.parse(raw) : {}
    const next = { ...parsed, accessToken: newAccessToken }
    localStorage.setItem('auth', JSON.stringify(next))
  } catch {
    // ignore
  }
}

async function requestWithAutoRefresh<T>(init: {
  method: 'GET' | 'POST' | 'PATCH'
  path: string
  body?: unknown
  tokenOverride?: string
}): Promise<T> {
  const { method, path, body, tokenOverride } = init
  const url = `${API_BASE}${path}`
  const tokens = readTokens()
  const pickAccess = tokenOverride || tokens.accessToken

  async function doFetch(bearer?: string): Promise<Response> {
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
  }

  let res = await doFetch(pickAccess)
  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    // try refresh
    const refreshToken = tokens.refreshToken
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { accessToken: string }
        writeAccessToken(data.accessToken)
        res = await doFetch(data.accessToken)
      }
    }
  }

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return requestWithAutoRefresh<T>({ method: 'POST', path, body, tokenOverride: token })
}

export async function getJson<T>(path: string, token?: string): Promise<T> {
  return requestWithAutoRefresh<T>({ method: 'GET', path, tokenOverride: token })
}

export async function patchJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return requestWithAutoRefresh<T>({ method: 'PATCH', path, body, tokenOverride: token })
}


