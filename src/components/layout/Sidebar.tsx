import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', icon: '⬛' },
  { to: '/obras', label: 'Obras', icon: '🏗' },
  { to: '/ensaios/pendentes', label: 'Ensaios Pendentes', icon: '⏱' },
  { to: '/relatorios', label: 'Relatórios', icon: '📄' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-white flex flex-col min-h-screen">
      <div className="px-5 py-4 border-b">
        <span className="font-bold text-blue-700 text-lg tracking-tight">Átter QTM Pro</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-3 border-t text-xs text-gray-400">v0.1.0-MVP</div>
    </aside>
  )
}
