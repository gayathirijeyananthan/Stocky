import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { postJson, patchJson, getJson } from '../services/api'
import type { LoginResponse, Role } from '../services/api'

type AuthState = {
  user?: { id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' }
  accessToken?: string
  refreshToken?: string
}

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<{ id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' }>
  register: (
    email: string,
    password: string,
    role: 'COMPANY_ADMIN' | 'SHOP_OWNER',
    shop?: { name?: string; address?: string; contact?: string }
  ) => Promise<{ id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' }>
  logout: () => void
  updateProfile: (payload: { email?: string; password?: string }) => Promise<{ id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' }>
  refreshMe: () => Promise<{ id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : {}
  })

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(state))
  }, [state])

  const value = useMemo<AuthContextValue>(() => ({
    state,
    async login(email, password) {
      const res = await postJson<LoginResponse>('/auth/login', { email, password })
      setState({ user: res.user, accessToken: res.tokens.accessToken, refreshToken: res.tokens.refreshToken })
      return res.user
    },
    async register(email, password, role, shop) {
      const body: any = { email, password, role }
      if (role === 'SHOP_OWNER' && shop) body.shop = shop
      const res = await postJson<LoginResponse>('/auth/register', body)
      setState({ user: res.user, accessToken: res.tokens.accessToken, refreshToken: res.tokens.refreshToken })
      return res.user
    },
    logout() {
      setState({})
      localStorage.removeItem('auth')
    },
    async updateProfile(payload) {
      const res = await patchJson<{ user: { id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' } }>('/auth/me', payload, state.accessToken)
      setState((prev) => ({ ...prev, user: res.user }))
      return res.user
    },
    async refreshMe() {
      const res = await getJson<{ user: { id: string; email: string; role: Role; shopStatus?: 'pending' | 'active' | 'inactive' } }>('/auth/me', state.accessToken)
      setState((prev) => ({ ...prev, user: res.user }))
      return res.user
    },
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


