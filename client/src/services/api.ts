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
}

export interface LoginResponse {
  user: AuthUser
  tokens: { accessToken: string; refreshToken: string }
}

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function getJson<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function patchJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}


