import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function AppLayout() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Carregando...</div>
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <header className="h-12 border-b bg-white flex items-center justify-end px-4 gap-3 shrink-0">
          <span className="text-sm text-gray-600">{user.nome}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{user.papel}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-800 border px-2 py-1 rounded-md hover:bg-gray-50"
          >
            Sair
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
