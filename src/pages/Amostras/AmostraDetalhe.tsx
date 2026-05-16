import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAmostra, useDeleteAmostra } from '@/hooks/useAmostras'
import { useObra } from '@/hooks/useObras'
import { useFornecimento } from '@/hooks/useFornecimentos'
import { useCorposDeProva, useCreateCorpoDeProva, useDeleteCorpoDeProva } from '@/hooks/useCorposDeProva'
import { Badge, statusCPBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { calcularFckEst } from '@/utils/concreto/estatistica'
import { avaliarConformidadeLote } from '@/utils/concreto/conformidade'
import type { CorpoDeProva } from '@/types'

export default function AmostraDetalhe() {
  const { obraId, fornecimentoId, amostraId } = useParams<{
    obraId: string
    fornecimentoId: string
    amostraId: string
  }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId ?? '')
  const { data: forn } = useFornecimento(fornecimentoId ?? '')
  const { data: amostra, isLoading } = useAmostra(amostraId ?? '')
  const { data: cps = [] } = useCorposDeProva(amostraId)
  const deleteAmostra = useDeleteAmostra()
  const createCP = useCreateCorpoDeProva()
  const deleteCP = useDeleteCorpoDeProva()
  const [deleteAmostraOpen, setDeleteAmostraOpen] = useState(false)
  const [deleteCP2, setDeleteCP2] = useState<CorpoDeProva | null>(null)

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!amostra) return <div className="p-6 text-sm text-red-500">Amostra não encontrada.</div>

  const dataMoldagem = new Date(amostra.dataMoldagem)
  const dataFmtForn = forn ? new Date(forn.dataConcretagem).toLocaleDateString('pt-BR') : '...'

  // Análise estatística dos CPs ensaiados aos 28 dias
  const cps28 = cps.filter((cp) => cp.idadeEnsaioDias === 28 && cp.resistenciaMpa != null && cp.status === 'ENSAIADO')
  const resistencias28 = cps28.map((cp) => cp.resistenciaMpa!)
  const estatistica = resistencias28.length > 0 ? calcularFckEst(resistencias28) : null
  const conformidade = estatistica && forn
    ? avaliarConformidadeLote(estatistica.fckEst, forn.fckProjeto, estatistica.fcMin)
    : null

  const addCP = (idadeDias: number) => {
    const dataEnsaio = new Date(dataMoldagem)
    dataEnsaio.setDate(dataEnsaio.getDate() + idadeDias)
    const count = cps.filter((cp) => cp.idadeEnsaioDias === idadeDias).length + 1
    createCP.mutate({
      amostraId: amostra.id,
      identificacao: `CP-${String(amostra.numeroAmostra).padStart(3, '0')}-${idadeDias}D-${count}`,
      idadeEnsaioDias: idadeDias,
      status: 'PENDENTE',
    })
  }

  const conformidadeCls = {
    ACEITO: 'bg-green-50 border-green-200 text-green-800',
    ZONA_ANALISE: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    REJEITADO_IMEDIATO: 'bg-red-50 border-red-200 text-red-800',
    REJEITADO_CP_INDIVIDUAL: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1 flex-wrap">
          <Link to="/obras" className="hover:text-gray-700">Obras</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}`} className="hover:text-gray-700">{obra?.nome ?? '...'}</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}/fornecimentos/${fornecimentoId}`} className="hover:text-gray-700">
            Forn. {dataFmtForn}
          </Link>
          <span>/</span>
          <span className="text-gray-700">Amostra #{amostra.numeroAmostra}</span>
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Amostra #{amostra.numeroAmostra}</h1>
          <div className="flex gap-2">
            <Link
              to={`/relatorios/laudo/${obraId}/${fornecimentoId}/${amostraId}`}
              className="px-3 py-1.5 border border-blue-300 text-blue-700 text-sm rounded-md hover:bg-blue-50"
            >
              Gerar Laudo PDF
            </Link>
            <button
              onClick={() => setDeleteAmostraOpen(true)}
              className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-md hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <InfoCard label="Moldagem" value={dataMoldagem.toLocaleDateString('pt-BR')} />
        <InfoCard label="Local de aplicação" value={amostra.localAplicacao} />
        <InfoCard label="Responsável pela coleta" value={amostra.responsavelColeta} />
      </div>

      {/* Resultado estatístico (28 dias) */}
      {estatistica && conformidade && (
        <div className={`border rounded-lg p-4 ${conformidadeCls[conformidade.status]}`}>
          <h2 className="text-sm font-semibold mb-2">Análise estatística — 28 dias (NBR 12655)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs opacity-70">n</p><p className="font-medium">{estatistica.n}</p></div>
            <div><p className="text-xs opacity-70">fcm</p><p className="font-medium">{estatistica.fcm} MPa</p></div>
            <div><p className="text-xs opacity-70">s</p><p className="font-medium">{estatistica.desvioPadrao} MPa</p></div>
            <div><p className="text-xs opacity-70">CV</p><p className="font-medium">{estatistica.cv}%</p></div>
            <div><p className="text-xs opacity-70">fck,est ({estatistica.metodo})</p><p className="font-bold">{estatistica.fckEst} MPa</p></div>
            <div><p className="text-xs opacity-70">fck projeto</p><p className="font-medium">{forn?.fckProjeto} MPa</p></div>
          </div>
          <p className="mt-3 text-sm font-medium">{conformidade.mensagem}</p>
          <p className="text-xs mt-1 opacity-80">{conformidade.acao}</p>
        </div>
      )}

      {/* CPs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Corpos de Prova</h2>
          <div className="flex gap-2">
            {[7, 14, 28, 56].map((idade) => (
              <button
                key={idade}
                onClick={() => addCP(idade)}
                disabled={createCP.isPending}
                className="px-3 py-1.5 border text-xs font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                + CP {idade}d
              </button>
            ))}
          </div>
        </div>

        {cps.length === 0 ? (
          <div className="border rounded-lg bg-white p-6 text-center text-gray-400 text-sm">
            Nenhum CP criado. Clique em "+ CP Xd" para adicionar.
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Identificação</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Idade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data ensaio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Resistência</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cps.map((cp) => (
                  <tr key={cp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cp.identificacao}</td>
                    <td className="px-4 py-3 text-gray-600">{cp.idadeEnsaioDias}d</td>
                    <td className="px-4 py-3 text-gray-600">
                      {cp.dataEnsaio
                        ? new Date(cp.dataEnsaio).toLocaleDateString('pt-BR')
                        : <span className="text-gray-400">pendente</span>}
                    </td>
                    <td className="px-4 py-3">
                      {cp.resistenciaMpa != null ? (
                        <span className={cp.resistenciaMpa < (forn?.fckProjeto ?? 0) * 0.85 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                          {cp.resistenciaMpa} MPa
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCPBadge(cp.status)}>{cp.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {cp.status === 'PENDENTE' && (
                        <Link
                          to={`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${amostraId}/ensaios/${cp.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Registrar ensaio
                        </Link>
                      )}
                      <button
                        onClick={() => setDeleteCP2(cp)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteAmostraOpen}
        title="Excluir amostra"
        description={`Excluir a amostra #${amostra.numeroAmostra} e todos os seus CPs?`}
        onConfirm={() =>
          deleteAmostra.mutate(amostra.id, {
            onSuccess: () => navigate(`/obras/${obraId}/fornecimentos/${fornecimentoId}`),
          })
        }
        onCancel={() => setDeleteAmostraOpen(false)}
      />
      <ConfirmDialog
        open={!!deleteCP2}
        title="Excluir CP"
        description={`Excluir o corpo de prova "${deleteCP2?.identificacao}"?`}
        onConfirm={() =>
          deleteCP2 &&
          deleteCP.mutate(deleteCP2.id, { onSuccess: () => setDeleteCP2(null) })
        }
        onCancel={() => setDeleteCP2(null)}
      />
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}
