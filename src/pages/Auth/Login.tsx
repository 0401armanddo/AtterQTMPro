import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Tab = 'login' | 'register'

export default function Login() {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, senha)
      } else {
        if (nome.trim().length < 2) { setError('Nome deve ter ao menos 2 caracteres.'); setLoading(false); return }
        await register(nome, email, senha)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border rounded-xl shadow-sm w-full max-w-sm p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Átter QTM Pro</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de Qualidade do Concreto</p>
        </div>

        {/* Tabs */}
        <div className="flex border rounded-lg overflow-hidden text-sm font-medium">
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-2 transition-colors ${tab === 'login' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setError('') }}
            className={`flex-1 py-2 transition-colors ${tab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Eng. João Silva"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="joao@empresa.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {tab === 'login' && (
          <p className="text-xs text-center text-gray-400">
            Conta padrão de desenvolvimento: <br />
            <span className="font-mono">admin@atterqtm.com</span> / <span className="font-mono">admin123</span>
          </p>
        )}
      </div>
    </div>
  )
}
