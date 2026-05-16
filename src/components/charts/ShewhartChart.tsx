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
import type { PontoShewhart } from '@/pages/Dashboard/useDashboardData'

interface Props {
  data: PontoShewhart[]
  fck: number
}

export default function ShewhartChart({ data, fck }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
        Sem dados suficientes para o gráfico de controle.
      </div>
    )
  }

  const media = data[0]?.media ?? 0
  const alertaSup = data[0]?.alertaSup ?? 0
  const alertaInf = data[0]?.alertaInf ?? 0
  const acaoSup = data[0]?.acaoSup ?? 0
  const acaoInf = data[0]?.acaoInf ?? 0

  const allValues = data.map((d) => d.resistencia)
  const yMin = Math.floor(Math.min(...allValues, acaoInf, fck * 0.85) - 3)
  const yMax = Math.ceil(Math.max(...allValues, acaoSup) + 3)

  const dotColor = (entry: PontoShewhart) => {
    if (entry.resistencia > entry.acaoSup || entry.resistencia < entry.acaoInf) return '#dc2626'
    if (entry.resistencia > entry.alertaSup || entry.resistencia < entry.alertaInf) return '#f59e0b'
    return '#2563eb'
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 40, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="seq" tick={{ fontSize: 11 }} label={{ value: 'Ensaio', position: 'insideBottom', offset: -2, style: { fontSize: 11 } }} />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11 }}
          label={{ value: 'MPa', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as PontoShewhart
            return (
              <div className="bg-white border rounded shadow p-2 text-xs space-y-0.5">
                <p className="font-semibold">{d.label}</p>
                <p>fc = <strong>{d.resistencia} MPa</strong></p>
                <p>Média = {d.media} MPa</p>
              </div>
            )
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />

        {/* Limites de ação ±3σ */}
        <ReferenceLine y={acaoSup} stroke="#dc2626" strokeDasharray="3 3"
          label={{ value: `+3σ ${acaoSup}`, fontSize: 10, fill: '#dc2626', position: 'right' }} />
        <ReferenceLine y={acaoInf} stroke="#dc2626" strokeDasharray="3 3"
          label={{ value: `-3σ ${acaoInf}`, fontSize: 10, fill: '#dc2626', position: 'right' }} />

        {/* Limites de alerta ±2σ */}
        <ReferenceLine y={alertaSup} stroke="#f59e0b" strokeDasharray="4 2"
          label={{ value: `+2σ ${alertaSup}`, fontSize: 10, fill: '#f59e0b', position: 'right' }} />
        <ReferenceLine y={alertaInf} stroke="#f59e0b" strokeDasharray="4 2"
          label={{ value: `-2σ ${alertaInf}`, fontSize: 10, fill: '#f59e0b', position: 'right' }} />

        {/* Média */}
        <ReferenceLine y={media} stroke="#6b7280"
          label={{ value: `μ ${media}`, fontSize: 10, fill: '#6b7280', position: 'right' }} />

        {/* fck */}
        <ReferenceLine y={fck} stroke="#2563eb" strokeDasharray="5 3"
          label={{ value: `fck ${fck}`, fontSize: 10, fill: '#2563eb', position: 'right' }} />

        <Line
          type="linear"
          dataKey="resistencia"
          name="fc (MPa)"
          stroke="#2563eb"
          strokeWidth={1.5}
          dot={(props) => {
            const entry = props.payload as PontoShewhart
            return (
              <circle
                key={props.key}
                cx={props.cx}
                cy={props.cy}
                r={5}
                fill={dotColor(entry)}
                stroke="white"
                strokeWidth={1}
              />
            )
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
