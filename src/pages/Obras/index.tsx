import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useObras, useDeleteObra } from '@/hooks/useObras'
import { Badge, statusObraBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Obra } from '@/types'

export default function Obras() {
  const { data: obras = [], isLoading } = useObras()
  const deleteMutation = useDeleteObra()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Obra | null>(null)

  const filtered = obras.filter((o) =>
    o.nome.toLowerCase().includes(search.toLowerCase()) ||
    o.responsavelTecnico.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
        <Link
          to="/obras/nova"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + Nova Obra
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou responsável..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="border rounded-lg bg-white p-8 text-center text-gray-400 text-sm">
          {search ? 'Nenhuma obra encontrada.' : 'Nenhuma obra cadastrada. Clique em "+ Nova Obra" para começar.'}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Obra</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsável</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">fck</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((obra) => (
                <tr key={obra.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/obras/${obra.id}`} className="font-medium text-blue-600 hover:underline">
                      {obra.nome}
                    </Link>
                    {obra.cno && <p className="text-xs text-gray-400">CNO {obra.cno}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{obra.responsavelTecnico}</td>
                  <td className="px-4 py-3 text-gray-700">{obra.fckProjeto} MPa</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusObraBadge(obra.status)}>
                      {obra.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/obras/${obra.id}/editar`}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(obra)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir obra"
        description={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
