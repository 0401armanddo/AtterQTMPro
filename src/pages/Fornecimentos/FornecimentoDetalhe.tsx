import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useFornecimento, useDeleteFornecimento } from '@/hooks/useFornecimentos'
import { useObra } from '@/hooks/useObras'
import { useAmostras, useDeleteAmostra } from '@/hooks/useAmostras'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Amostra } from '@/types'

export default function FornecimentoDetalhe() {
  const { obraId, fornecimentoId } = useParams<{ obraId: string; fornecimentoId: string }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId ?? '')
  const { data: forn, isLoading } = useFornecimento(fornecimentoId ?? '')
  const { data: amostras = [] } = useAmostras(fornecimentoId)
  const deleteForn = useDeleteFornecimento()
  const deleteAmostra = useDeleteAmostra()
  const [deleteFornOpen, setDeleteFornOpen] = useState(false)
  const [deleteAm, setDeleteAm] = useState<Amostra | null>(null)

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!forn) return <div className="p-6 text-sm text-red-500">Fornecimento não encontrado.</div>

  const dataFmt = new Date(forn.dataConcretagem).toLocaleDateString('pt-BR')
  const slumpOk = forn.slumpMedidoMm != null && forn.slumpEspecificadoMm != null
    ? Math.abs(forn.slumpMedidoMm - forn.slumpEspecificadoMm) <= 20
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/obras" className="hover:text-gray-700">Obras</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}`} className="hover:text-gray-700">{obra?.nome ?? '...'}</Link>
          <span>/</span>
          <span className="text-gray-700">Fornecimento {dataFmt}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Fornecimento — {dataFmt}</h1>
          <button
            onClick={() => setDeleteFornOpen(true)}
            className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-md hover:bg-red-50"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Dados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Volume" value={`${forn.volumeM3} m³`} />
        <InfoCard label="fck projeto" value={`${forn.fckProjeto} MPa`} />
        <InfoCard label="Nota Fiscal" value={forn.notaFiscal ?? '—'} />
        <InfoCard label="Central" value={forn.centraConcretagem ?? '—'} />
      </div>

      {/* Concreto fresco */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Concreto fresco</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Slump medido</p>
            <p className={`font-medium ${slumpOk === false ? 'text-red-600' : 'text-gray-900'}`}>
              {forn.slumpMedidoMm != null ? `${forn.slumpMedidoMm} mm` : '—'}
              {slumpOk === false && ' ⚠'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Slump especificado</p>
            <p className="font-medium text-gray-900">{forn.slumpEspecificadoMm != null ? `${forn.slumpEspecificadoMm} mm` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">T. concreto</p>
            <p className="font-medium text-gray-900">{forn.temperaturaConcC != null ? `${forn.temperaturaConcC}°C` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">T. ambiente</p>
            <p className="font-medium text-gray-900">{forn.temperaturaAmbC != null ? `${forn.temperaturaAmbC}°C` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Brita</p>
            <p className="font-medium text-gray-900">{forn.brita ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Cimento</p>
            <p className="font-medium text-gray-900">{forn.cimento ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Massa específica</p>
            <p className="font-medium text-gray-900">{forn.massaEspecifica != null ? `${forn.massaEspecifica} kg/m³` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Teor de ar</p>
            <p className="font-medium text-gray-900">{forn.teorAr != null ? `${forn.teorAr}%` : '—'}</p>
          </div>
        </div>
        {forn.observacoes && (
          <p className="mt-3 text-sm text-gray-600 border-t pt-3">{forn.observacoes}</p>
        )}
      </div>

      {/* Amostras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Amostras</h2>
          <Link
            to={`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/nova`}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Nova Amostra
          </Link>
        </div>
        {amostras.length === 0 ? (
          <div className="border rounded-lg bg-white p-6 text-center text-gray-400 text-sm">
            Nenhuma amostra registrada neste fornecimento.
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nº</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Moldagem</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Local de aplicação</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Responsável</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {amostras.map((am) => (
                  <tr key={am.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${am.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        #{am.numeroAmostra}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(am.dataMoldagem).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{am.localAplicacao}</td>
                    <td className="px-4 py-3 text-gray-600">{am.responsavelColeta}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteAm(am)}
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
        open={deleteFornOpen}
        title="Excluir fornecimento"
        description="Excluir este fornecimento e todas as suas amostras?"
        onConfirm={() =>
          deleteForn.mutate(forn.id, { onSuccess: () => navigate(`/obras/${obraId}`) })
        }
        onCancel={() => setDeleteFornOpen(false)}
      />
      <ConfirmDialog
        open={!!deleteAm}
        title="Excluir amostra"
        description={`Excluir a amostra #${deleteAm?.numeroAmostra}?`}
        onConfirm={() =>
          deleteAm &&
          deleteAmostra.mutate(deleteAm.id, { onSuccess: () => setDeleteAm(null) })
        }
        onCancel={() => setDeleteAm(null)}
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
