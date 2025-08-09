import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { postJson } from '../services/api'
import type { LoginResponse, Role } from '../services/api'

type AuthState = {
  user?: { id: string; email: string; role: Role }
  accessToken?: string
  refreshToken?: string
}

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<{ id: string; email: string; role: Role }>
  register: (email: string, password: string, role: 'COMPANY_ADMIN' | 'SHOP_OWNER') => Promise<{ id: string; email: string; role: Role }>
  logout: () => void
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
    async register(email, password, role) {
      const res = await postJson<LoginResponse>('/auth/register', { email, password, role })
      setState({ user: res.user, accessToken: res.tokens.accessToken, refreshToken: res.tokens.refreshToken })
      return res.user
    },
    logout() {
      setState({})
      localStorage.removeItem('auth')
    },
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


