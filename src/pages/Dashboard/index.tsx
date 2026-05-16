import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do controle de qualidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Obras Ativas" value="—" />
        <StatCard label="CPs Pendentes (hoje)" value="—" accent />
        <StatCard label="Ensaios este mês" value="—" />
        <StatCard label="Conformidade geral" value="—%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-base font-semibold mb-4">Rompimentos pendentes</h2>
          <p className="text-sm text-gray-400">Nenhum CP pendente.</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-base font-semibold mb-4">Não conformidades recentes</h2>
          <p className="text-sm text-gray-400">Nenhuma não conformidade registrada.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/obras/nova"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          Nova Obra
        </Link>
        <Link
          to="/ensaios/pendentes"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
        >
          Ver Ensaios Pendentes
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className={`border rounded-lg p-4 bg-white ${accent ? 'border-orange-300' : ''}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'text-orange-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}
