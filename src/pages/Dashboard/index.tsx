import { Link } from 'react-router-dom'
import { useObras } from '@/hooks/useObras'
import { useFornecimentos } from '@/hooks/useFornecimentos'
import { useAmostras } from '@/hooks/useAmostras'
import { useCorposDeProva } from '@/hooks/useCorposDeProva'
import { Badge, statusObraBadge } from '@/components/ui/Badge'

export default function Dashboard() {
  const { data: obras = [], isLoading } = useObras()
  const { data: fornecimentos = [] } = useFornecimentos()
  const { data: amostras = [] } = useAmostras()
  const { data: cps = [] } = useCorposDeProva()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const obrasAtivas = obras.filter((o) => o.status === 'ATIVA').length
  const cpsPendentes = cps.filter((cp) => cp.status === 'PENDENTE')
  const cpsHoje = cpsPendentes.filter((cp) => {
    const amostra = amostras.find((a) => a.id === cp.amostraId)
    if (!amostra) return false
    const prevista = new Date(amostra.dataMoldagem)
    prevista.setDate(prevista.getDate() + cp.idadeEnsaioDias)
    prevista.setHours(0, 0, 0, 0)
    return prevista.getTime() <= hoje.getTime()
  })

  const cpsEnsaiados = cps.filter((cp) => cp.status === 'ENSAIADO')
  const cpsRejeitados = cps.filter((cp) => cp.status === 'REJEITADO')
  const totalEnsaiados = cpsEnsaiados.length + cpsRejeitados.length
  const conformidade = totalEnsaiados > 0
    ? Math.round((cpsEnsaiados.length / totalEnsaiados) * 100)
    : null

  const obrasRecentes = [...obras]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const cpsPendentesProximos = cpsPendentes
    .map((cp) => {
      const amostra = amostras.find((a) => a.id === cp.amostraId)
      if (!amostra) return null
      const forn = fornecimentos.find((f) => f.id === amostra.fornecimentoId)
      if (!forn) return null
      const obra = obras.find((o) => o.id === forn.obraId)
      if (!obra) return null
      const prevista = new Date(amostra.dataMoldagem)
      prevista.setDate(prevista.getDate() + cp.idadeEnsaioDias)
      prevista.setHours(0, 0, 0, 0)
      const dias = Math.round((prevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return { cp, amostra, forn, obra, prevista, dias }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.dias <= 7)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5)

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral do controle de qualidade</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Obras ativas" value={String(obrasAtivas)} />
        <StatCard label="Ensaios vencidos/hoje" value={String(cpsHoje.length)} accent={cpsHoje.length > 0} />
        <StatCard label="CPs pendentes" value={String(cpsPendentes.length)} />
        <StatCard
          label="Taxa de conformidade"
          value={conformidade != null ? `${conformidade}%` : '—'}
          accent={conformidade != null && conformidade < 90}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos rompimentos */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Próximos rompimentos (7 dias)</h2>
            <Link to="/ensaios/pendentes" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          {cpsPendentesProximos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum ensaio nos próximos 7 dias.</p>
          ) : (
            <ul className="space-y-2">
              {cpsPendentesProximos.map(({ cp, obra, amostra, prevista, dias }) => (
                <li key={cp.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{cp.identificacao}</p>
                    <p className="text-xs text-gray-400">{obra.nome} · {amostra.localAplicacao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{prevista.toLocaleDateString('pt-BR')}</p>
                    <p className={`text-xs font-medium ${dias <= 0 ? 'text-red-600' : dias <= 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {dias < 0 ? `${Math.abs(dias)}d atrasado` : dias === 0 ? 'Hoje' : `em ${dias}d`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Obras recentes */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Obras recentes</h2>
            <Link to="/obras" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {obrasRecentes.length === 0 ? (
            <div className="text-sm text-gray-400">
              <p>Nenhuma obra cadastrada.</p>
              <Link to="/obras/nova" className="mt-2 inline-block px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                + Nova Obra
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {obrasRecentes.map((obra) => (
                <li key={obra.id} className="flex items-center justify-between text-sm">
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
          <h2 className="text-base font-semibold text-red-800 mb-2">
            ⚠ Não conformidades — {cpsRejeitados.length} CP(s) rejeitado(s)
          </h2>
          <ul className="space-y-1">
            {cpsRejeitados.slice(0, 5).map((cp) => {
              const amostra = amostras.find((a) => a.id === cp.amostraId)
              const forn = amostra ? fornecimentos.find((f) => f.id === amostra.fornecimentoId) : null
              const obra = forn ? obras.find((o) => o.id === forn.obraId) : null
              return (
                <li key={cp.id} className="text-sm text-red-700">
                  <span className="font-medium">{cp.identificacao}</span>
                  {cp.resistenciaMpa && ` — ${cp.resistenciaMpa} MPa`}
                  {obra && (
                    <Link to={`/obras/${obra.id}`} className="ml-1 text-xs hover:underline">
                      ({obra.nome})
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

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 bg-white ${accent ? 'border-orange-300' : ''}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
