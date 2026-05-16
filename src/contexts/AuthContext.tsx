import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { api, setToken, clearToken } from '@/services/apiClient'
import type { Usuario } from '@/types'

interface AuthContextValue {
  user: Usuario | null
  isLoading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaura sessão ao carregar
  useEffect(() => {
    const raw = localStorage.getItem('atterqtm:user')
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch { /* ignorar */ }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const { token, usuario } = await api.post<{ token: string; usuario: Usuario }>(
      '/auth/login',
      { email, senha }
    )
    setToken(token)
    localStorage.setItem('atterqtm:user', JSON.stringify(usuario))
    setUser(usuario)
  }, [])

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    const { token, usuario } = await api.post<{ token: string; usuario: Usuario }>(
      '/auth/register',
      { nome, email, senha }
    )
    setToken(token)
    localStorage.setItem('atterqtm:user', JSON.stringify(usuario))
    setUser(usuario)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
