import { Link } from 'react-router-dom'
import { useObras } from '@/hooks/useObras'
import { useFornecimentos } from '@/hooks/useFornecimentos'
import { useAmostras } from '@/hooks/useAmostras'
import { useCorposDeProva } from '@/hooks/useCorposDeProva'

interface CPPendente {
  cpId: string
  identificacao: string
  idadeEnsaioDias: number
  dataEnsaioPrevista: Date
  diasRestantes: number
  amostraId: string
  amostraNum: number
  fornecimentoId: string
  obraId: string
  obraNome: string
  localAplicacao: string
}

function usePendentes() {
  const { data: obras = [] } = useObras()
  const { data: fornecimentos = [] } = useFornecimentos()
  const { data: amostras = [] } = useAmostras()
  const { data: cps = [] } = useCorposDeProva()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const pendentes: CPPendente[] = cps
    .filter((cp) => cp.status === 'PENDENTE')
    .map((cp) => {
      const amostra = amostras.find((a) => a.id === cp.amostraId)
      if (!amostra) return null
      const forn = fornecimentos.find((f) => f.id === amostra.fornecimentoId)
      if (!forn) return null
      const obra = obras.find((o) => o.id === forn.obraId)
      if (!obra) return null

      const dataMoldagem = new Date(amostra.dataMoldagem)
      const dataEnsaioPrevista = new Date(dataMoldagem)
      dataEnsaioPrevista.setDate(dataEnsaioPrevista.getDate() + cp.idadeEnsaioDias)
      dataEnsaioPrevista.setHours(0, 0, 0, 0)

      const diasRestantes = Math.round(
        (dataEnsaioPrevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        cpId: cp.id,
        identificacao: cp.identificacao,
        idadeEnsaioDias: cp.idadeEnsaioDias,
        dataEnsaioPrevista,
        diasRestantes,
        amostraId: amostra.id,
        amostraNum: amostra.numeroAmostra,
        fornecimentoId: forn.id,
        obraId: obra.id,
        obraNome: obra.nome,
        localAplicacao: amostra.localAplicacao,
      } satisfies CPPendente
    })
    .filter((x): x is CPPendente => x !== null)
    .sort((a, b) => a.dataEnsaioPrevista.getTime() - b.dataEnsaioPrevista.getTime())

  return pendentes
}

export default function EnsaiosPendentes() {
  const pendentes = usePendentes()

  const urgencyClass = (dias: number) => {
    if (dias < 0) return 'bg-red-50 border-red-200'
    if (dias === 0) return 'bg-orange-50 border-orange-200'
    if (dias <= 3) return 'bg-yellow-50 border-yellow-200'
    return 'bg-white'
  }

  const urgencyLabel = (dias: number) => {
    if (dias < 0) return { text: `${Math.abs(dias)}d atrasado`, cls: 'text-red-600 font-semibold' }
    if (dias === 0) return { text: 'Hoje', cls: 'text-orange-600 font-semibold' }
    if (dias === 1) return { text: 'Amanhã', cls: 'text-yellow-700 font-semibold' }
    return { text: `em ${dias} dias`, cls: 'text-gray-500' }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ensaios Pendentes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Agenda de rompimentos — {pendentes.length} CP(s) aguardando ensaio
        </p>
      </div>

      {pendentes.length === 0 ? (
        <div className="border rounded-lg bg-white p-8 text-center text-gray-400 text-sm">
          Nenhum CP pendente. Crie amostras nas obras para visualizar os ensaios aqui.
        </div>
      ) : (
        <div className="space-y-2">
          {pendentes.map((p) => {
            const label = urgencyLabel(p.diasRestantes)
            return (
              <div key={p.cpId} className={`border rounded-lg p-4 ${urgencyClass(p.diasRestantes)}`}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900">{p.identificacao}</p>
                    <p className="text-xs text-gray-500">{p.obraNome} · {p.localAplicacao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {p.dataEnsaioPrevista.toLocaleDateString('pt-BR')} · {p.idadeEnsaioDias}d
                    </p>
                    <p className={`text-xs ${label.cls}`}>{label.text}</p>
                  </div>
                  <Link
                    to={`/obras/${p.obraId}/fornecimentos/${p.fornecimentoId}/amostras/${p.amostraId}/ensaios/${p.cpId}`}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 shrink-0"
                  >
                    Registrar
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
