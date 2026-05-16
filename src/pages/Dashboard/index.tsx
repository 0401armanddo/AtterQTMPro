import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useObras } from '@/hooks/useObras'
import { useFornecimentos } from '@/hooks/useFornecimentos'
import { useAmostras } from '@/hooks/useAmostras'
import { useCorposDeProva } from '@/hooks/useCorposDeProva'
import { Badge, statusObraBadge } from '@/components/ui/Badge'
import ResistenciaLineChart from '@/components/charts/ResistenciaLineChart'
import ShewhartChart from '@/components/charts/ShewhartChart'
import HistogramaChart from '@/components/charts/HistogramaChart'
import ConformidadePie from '@/components/charts/ConformidadePie'
import { useDashboardData } from './useDashboardData'

export default function Dashboard() {
  const { data: obras = [], isLoading } = useObras()
  const { data: fornecimentos = [] } = useFornecimentos()
  const { data: amostras = [] } = useAmostras()
  const { data: cps = [] } = useCorposDeProva()

  const [obraId, setObraId] = useState<string | null>(null)
  const dados = useDashboardData(obras, fornecimentos, amostras, cps, obraId)

  // Agenda: CPs pendentes próximos
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const cpsPendentesProximos = cps
    .filter((cp) => cp.status === 'PENDENTE')
    .map((cp) => {
      const amostra = amostras.find((a) => a.id === cp.amostraId)
      if (!amostra) return null
      const forn = fornecimentos.find((f) => f.id === amostra.fornecimentoId)
      if (!forn) return null
      const obra = obras.find((o) => o.id === forn.obraId)
      if (!obra) return null
      if (obraId && obra.id !== obraId) return null
      const prevista = new Date(amostra.dataMoldagem)
      prevista.setDate(prevista.getDate() + cp.idadeEnsaioDias)
      prevista.setHours(0, 0, 0, 0)
      const dias = Math.round((prevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return { cp, amostra, forn, obra, prevista, dias }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.dias <= 7)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 6)

  const obrasRecentes = [...obras]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const cpsRejeitados = cps.filter((cp) => {
    if (cp.status !== 'REJEITADO') return false
    if (!obraId) return true
    const amostra = amostras.find((a) => a.id === cp.amostraId)
    const forn = amostra ? fornecimentos.find((f) => f.id === amostra.fornecimentoId) : null
    return forn?.obraId === obraId
  })

  const conformidadeStatus = dados?.statusConformidade
  const conformidadeCls = conformidadeStatus
    ? {
        ACEITO: 'bg-green-50 border-green-200 text-green-800',
        ZONA_ANALISE: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        REJEITADO_IMEDIATO: 'bg-red-50 border-red-200 text-red-800',
        REJEITADO_CP_INDIVIDUAL: 'bg-red-50 border-red-200 text-red-800',
      }[conformidadeStatus.status]
    : ''

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header + seletor de obra */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Controle de qualidade do concreto — NBR 12655</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Obra:</label>
          <select
            value={obraId ?? ''}
            onChange={(e) => setObraId(e.target.value || null)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>{o.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Obras ativas"
          value={String(obras.filter((o) => o.status === 'ATIVA').length)}
          sub={`de ${obras.length} total`}
        />
        <KpiCard
          label="Total de CPs"
          value={String(dados?.totalCPs ?? 0)}
          sub={`${dados?.cpsPendentes ?? 0} pendentes`}
        />
        <KpiCard
          label="fck,est (28d)"
          value={dados && dados.fckEst > 0 ? `${dados.fckEst} MPa` : '—'}
          sub={dados && dados.fckEst > 0 ? `fck ${dados.fckProjeto} MPa · ${dados.metodo}` : 'sem dados'}
          accent={dados != null && dados.fckEst > 0 && dados.fckEst < dados.fckProjeto}
        />
        <KpiCard
          label="Desvio padrão"
          value={dados && dados.desvioPadrao > 0 ? `${dados.desvioPadrao} MPa` : '—'}
          sub={dados && dados.cv > 0 ? `CV = ${dados.cv}%` : ''}
          accent={dados != null && dados.cv > 15}
        />
        <KpiCard
          label="CPs ensaiados"
          value={String(dados?.cpsEnsaiados ?? 0)}
          sub={`${dados?.cpsRejeitados ?? 0} rejeitados`}
          accent={(dados?.cpsRejeitados ?? 0) > 0}
        />
      </div>

      {/* Conformidade NBR 12655 */}
      {conformidadeStatus && (
        <div className={`border rounded-lg p-4 ${conformidadeCls}`}>
          <p className="text-sm font-semibold">{conformidadeStatus.mensagem}</p>
          <p className="text-xs mt-0.5 opacity-80">{conformidadeStatus.acao}</p>
        </div>
      )}

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Evolução da Resistência — 28 dias" subtitle="fc vs fck e limite de 0,85·fck (NBR 12655)">
          <ResistenciaLineChart data={dados?.evolucao ?? []} fck={dados?.fckProjeto ?? 25} />
        </ChartCard>

        <ChartCard title="Gráfico de Controle Shewhart" subtitle="Limites ±2σ (alerta) e ±3σ (ação)">
          <ShewhartChart data={dados?.shewhart ?? []} fck={dados?.fckProjeto ?? 25} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Distribuição de Frequências" subtitle="Histograma das resistências a 28 dias">
          <HistogramaChart data={dados?.histograma ?? []} />
        </ChartCard>

        <ChartCard title="Conformidade dos CPs" subtitle="Distribuição por status">
          <ConformidadePie
            ensaiados={dados?.cpsEnsaiados ?? 0}
            rejeitados={dados?.cpsRejeitados ?? 0}
            pendentes={dados?.cpsPendentes ?? 0}
          />
        </ChartCard>
      </div>

      {/* Agenda + obras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Próximos rompimentos</h2>
            <Link to="/ensaios/pendentes" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          {cpsPendentesProximos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum ensaio nos próximos 7 dias.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cpsPendentesProximos.map(({ cp, obra, amostra, prevista, dias }) => (
                <li key={cp.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{cp.identificacao}</p>
                    <p className="text-xs text-gray-400">{obra.nome} · {amostra.localAplicacao}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-gray-500">{prevista.toLocaleDateString('pt-BR')}</p>
                    <p className={`text-xs font-semibold ${dias < 0 ? 'text-red-600' : dias === 0 ? 'text-orange-600' : dias <= 2 ? 'text-yellow-700' : 'text-gray-500'}`}>
                      {dias < 0 ? `${Math.abs(dias)}d atrasado` : dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias}d`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Obras recentes</h2>
            <Link to="/obras" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {obrasRecentes.length === 0 ? (
            <div className="text-sm text-gray-400">
              <p className="mb-2">Nenhuma obra cadastrada.</p>
              <Link to="/obras/nova" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                + Nova Obra
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {obrasRecentes.map((obra) => (
                <li key={obra.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <Link to={`/obras/${obra.id}`} className="font-medium text-blue-600 hover:underline">
                      {obra.nome}
                    </Link>
                    <p className="text-xs text-gray-400">{obra.responsavelTecnico} · fck {obra.fckProjeto} MPa</p>
                  </div>
                  <Badge variant={statusObraBadge(obra.status)}>{obra.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Não conformidades */}
      {cpsRejeitados.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-red-800 mb-2">
            Não conformidades — {cpsRejeitados.length} CP(s) rejeitado(s)
          </h2>
          <ul className="space-y-1">
            {cpsRejeitados.map((cp) => {
              const amostra = amostras.find((a) => a.id === cp.amostraId)
              const forn = amostra ? fornecimentos.find((f) => f.id === amostra.fornecimentoId) : null
              const obra = forn ? obras.find((o) => o.id === forn.obraId) : null
              return (
                <li key={cp.id} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="font-medium">{cp.identificacao}</span>
                  {cp.resistenciaMpa && <span>— {cp.resistenciaMpa} MPa</span>}
                  {obra && forn && amostra && (
                    <Link
                      to={`/obras/${obra.id}/fornecimentos/${forn.id}/amostras/${amostra.id}`}
                      className="text-xs underline opacity-80"
                    >
                      ver amostra
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 bg-white ${accent ? 'border-orange-300 bg-orange-50' : ''}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? 'text-orange-700' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      <p className="text-xs text-gray-400 mb-3">{subtitle}</p>
      {children}
    </div>
  )
}
