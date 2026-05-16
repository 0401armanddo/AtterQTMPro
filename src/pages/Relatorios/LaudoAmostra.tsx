import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useObra } from '@/hooks/useObras'
import { useFornecimento } from '@/hooks/useFornecimentos'
import { useAmostra } from '@/hooks/useAmostras'
import { useCorposDeProva } from '@/hooks/useCorposDeProva'
import LaudoTemplate from '@/components/pdf/LaudoTemplate'
import { elementToPDF } from '@/utils/pdf'

export default function LaudoAmostra() {
  const { obraId, fornecimentoId, amostraId } = useParams<{
    obraId: string
    fornecimentoId: string
    amostraId: string
  }>()

  const { data: obra, isLoading: l1 } = useObra(obraId ?? '')
  const { data: forn, isLoading: l2 } = useFornecimento(fornecimentoId ?? '')
  const { data: amostra, isLoading: l3 } = useAmostra(amostraId ?? '')
  const { data: cps = [], isLoading: l4 } = useCorposDeProva(amostraId)

  const templateRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  if (l1 || l2 || l3 || l4) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!obra || !forn || !amostra) return <div className="p-6 text-sm text-red-500">Dados não encontrados.</div>

  const numeroLaudo = `${new Date().getFullYear()}-${String(amostra.numeroAmostra).padStart(4, '0')}`
  const dataEmissao = new Date().toISOString()

  const handleDownload = async () => {
    if (!templateRef.current) return
    setGenerating(true)
    try {
      const filename = `laudo-${obra.nome.replace(/\s+/g, '-').toLowerCase()}-amostra-${amostra.numeroAmostra}.pdf`
      await elementToPDF(templateRef.current, filename)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Barra de ação */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link to="/relatorios" className="hover:text-gray-700">Relatórios</Link>
            <span>/</span>
            <span className="text-gray-700">Laudo Amostra #{amostra.numeroAmostra}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Laudo — {obra.nome} · Amostra #{amostra.numeroAmostra}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${amostraId}`}
            className="px-4 py-2 border text-sm rounded-md hover:bg-gray-50"
          >
            ← Voltar
          </Link>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando PDF...
              </>
            ) : (
              '⬇ Baixar PDF'
            )}
          </button>
        </div>
      </div>

      {/* Preview do laudo */}
      <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
        <div className="mx-auto shadow-lg" style={{ width: 794 }}>
          <div ref={templateRef}>
            <LaudoTemplate
              obra={obra}
              fornecimento={forn}
              amostra={amostra}
              cps={cps}
              numeroLaudo={numeroLaudo}
              dataEmissao={dataEmissao}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
