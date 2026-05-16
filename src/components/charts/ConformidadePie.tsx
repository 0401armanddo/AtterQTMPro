import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface Props {
  ensaiados: number
  rejeitados: number
  pendentes: number
}

const COLORS = { Conformes: '#16a34a', 'Não conformes': '#dc2626', Pendentes: '#d1d5db' }

export default function ConformidadePie({ ensaiados, rejeitados, pendentes }: Props) {
  const data = [
    { name: 'Conformes', value: ensaiados },
    { name: 'Não conformes', value: rejeitados },
    { name: 'Pendentes', value: pendentes },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
        Nenhum CP registrado.
      </div>
    )
  }

  const total = ensaiados + rejeitados + pendentes
  const pct = total > 0 ? Math.round((ensaiados / total) * 100) : 0

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] ?? '#6b7280'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} CPs`]} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centro do donut */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center mt-[-20px]">
          <p className="text-2xl font-bold text-gray-900">{pct}%</p>
          <p className="text-xs text-gray-500">conformes</p>
        </div>
      </div>
    </div>
  )
}
