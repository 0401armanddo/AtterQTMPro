import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import type { BinHistograma } from '@/pages/Dashboard/useDashboardData'

interface Props {
  data: BinHistograma[]
}

export default function HistogramaChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
        Sem dados suficientes para o histograma.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="faixa" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false}
          label={{ value: 'CPs', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Bar dataKey="conformes" name="Conformes" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.conformes > 0 ? '#16a34a' : '#e5e7eb'} />
          ))}
        </Bar>
        <Bar dataKey="naoCf" name="Não conformes" stackId="a" fill="#dc2626" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.naoCf > 0 ? '#dc2626' : 'transparent'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
