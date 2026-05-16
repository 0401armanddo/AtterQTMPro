import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useObra, useDeleteObra } from '@/hooks/useObras'
import { useFornecimentos, useDeleteFornecimento } from '@/hooks/useFornecimentos'
import { Badge, statusObraBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Fornecimento } from '@/types'

export default function ObraDetalhe() {
  const { obraId } = useParams<{ obraId: string }>()
  const navigate = useNavigate()
  const { data: obra, isLoading } = useObra(obraId ?? '')
  const { data: fornecimentos = [] } = useFornecimentos(obraId)
  const deleteObra = useDeleteObra()
  const deleteFornecimento = useDeleteFornecimento()
  const [deleteObraOpen, setDeleteObraOpen] = useState(false)
  const [deleteForn, setDeleteForn] = useState<Fornecimento | null>(null)

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!obra) return <div className="p-6 text-sm text-red-500">Obra não encontrada.</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link to="/obras" className="hover:text-gray-700">Obras</Link>
            <span>/</span>
            <span className="text-gray-700">{obra.nome}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{obra.nome}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{obra.endereco}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusObraBadge(obra.status)}>{obra.status}</Badge>
          <Link to={`/obras/${obra.id}/editar`} className="px-3 py-1.5 border text-sm rounded-md hover:bg-gray-50">
            Editar
          </Link>
          <button
            onClick={() => setDeleteObraOpen(true)}
            className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-md hover:bg-red-50"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Responsável Técnico" value={obra.responsavelTecnico} />
        <InfoCard label="CREA / CAU" value={obra.crea ?? '—'} />
        <InfoCard label="fck de projeto" value={`${obra.fckProjeto} MPa`} />
        <InfoCard label="CNO" value={obra.cno ?? '—'} />
      </div>

      {/* Fornecimentos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Fornecimentos</h2>
          <Link
            to={`/obras/${obra.id}/fornecimentos/novo`}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Novo Fornecimento
          </Link>
        </div>

        {fornecimentos.length === 0 ? (
          <div className="border rounded-lg bg-white p-6 text-center text-gray-400 text-sm">
            Nenhum fornecimento registrado nesta obra.
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">NF</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Volume</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">fck</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Slump (mm)</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fornecimentos.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/obras/${obra.id}/fornecimentos/${f.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {new Date(f.dataConcretagem).toLocaleDateString('pt-BR')}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.notaFiscal ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{f.volumeM3} m³</td>
                    <td className="px-4 py-3 text-gray-600">{f.fckProjeto} MPa</td>
                    <td className="px-4 py-3 text-gray-600">{f.slumpMedidoMm ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteForn(f)}
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
        open={deleteObraOpen}
        title="Excluir obra"
        description={`Excluir "${obra.nome}" e todos os seus dados? Esta ação não pode ser desfeita.`}
        onConfirm={() =>
          deleteObra.mutate(obra.id, { onSuccess: () => navigate('/obras') })
        }
        onCancel={() => setDeleteObraOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteForn}
        title="Excluir fornecimento"
        description={`Excluir o fornecimento de ${deleteForn ? new Date(deleteForn.dataConcretagem).toLocaleDateString('pt-BR') : ''}?`}
        onConfirm={() =>
          deleteForn &&
          deleteFornecimento.mutate(deleteForn.id, { onSuccess: () => setDeleteForn(null) })
        }
        onCancel={() => setDeleteForn(null)}
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
