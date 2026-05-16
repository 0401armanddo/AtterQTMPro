import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { PontoResistencia } from '@/pages/Dashboard/useDashboardData'

interface Props {
  data: PontoResistencia[]
  fck: number
}

export default function ResistenciaLineChart({ data, fck }: Props) {
  if (data.length === 0) {
    return <EmptyChart />
  }

  const limite085 = Math.round(fck * 0.85 * 10) / 10
  const yMin = Math.floor(Math.min(...data.map((d) => d.resistencia), limite085) - 5)
  const yMax = Math.ceil(Math.max(...data.map((d) => d.resistencia), fck) + 5)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="data" tick={{ fontSize: 11 }} />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}`}
          label={{ value: 'MPa', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
        />
        <Tooltip
          formatter={(value, name) => [`${value} MPa`, name]}
          labelFormatter={(label) => `Data: ${label}`}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        <ReferenceLine y={fck} stroke="#2563eb" strokeDasharray="6 3" label={{ value: `fck ${fck}`, fontSize: 11, fill: '#2563eb', position: 'right' }} />
        <ReferenceLine y={limite085} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `0,85·fck ${limite085}`, fontSize: 11, fill: '#dc2626', position: 'right' }} />

        <Line
          type="monotone"
          dataKey="resistencia"
          name="fc (MPa)"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 4, fill: '#16a34a' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function EmptyChart() {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
      Sem resultados de 28 dias para exibir.
    </div>
  )
}
