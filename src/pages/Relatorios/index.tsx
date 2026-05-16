import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useObras } from '@/hooks/useObras'
import { useFornecimentos } from '@/hooks/useFornecimentos'
import { useAmostras } from '@/hooks/useAmostras'
import { useCorposDeProva } from '@/hooks/useCorposDeProva'

export default function Relatorios() {
  const { data: obras = [] } = useObras()
  const { data: fornecimentos = [] } = useFornecimentos()
  const { data: amostras = [] } = useAmostras()
  const { data: cps = [] } = useCorposDeProva()

  const [obraFiltro, setObraFiltro] = useState<string>('')

  const fornFiltradas = obraFiltro
    ? fornecimentos.filter((f) => f.obraId === obraFiltro)
    : fornecimentos
  const fornIds = new Set(fornFiltradas.map((f) => f.id))
  const amostrasFiltradas = amostras.filter((a) => fornIds.has(a.fornecimentoId))

  const handleExportCSV = () => {
    const amIds = new Set(amostrasFiltradas.map((a) => a.id))
    const cpsFiltrados = cps.filter((cp) => amIds.has(cp.amostraId))

    const rows: string[][] = [
      ['Obra', 'Fornecimento (data)', 'NF', 'Volume (m³)', 'fck proj (MPa)',
        'Amostra #', 'Local aplicação', 'Moldagem',
        'CP', 'Idade (d)', 'Data ensaio', 'Diâmetro (mm)', 'Altura (mm)', 'h/d',
        'Carga (kN)', 'fc (MPa)', 'Fratura', 'Status'],
    ]

    for (const cp of cpsFiltrados) {
      const amostra = amostras.find((a) => a.id === cp.amostraId)
      if (!amostra) continue
      const forn = fornecimentos.find((f) => f.id === amostra.fornecimentoId)
      if (!forn) continue
      const obra = obras.find((o) => o.id === forn.obraId)
      if (!obra) continue

      const hd = cp.diametroMm && cp.alturaMm
        ? (cp.alturaMm / cp.diametroMm).toFixed(3)
        : ''

      rows.push([
        obra.nome,
        new Date(forn.dataConcretagem).toLocaleDateString('pt-BR'),
        forn.notaFiscal ?? '',
        String(forn.volumeM3),
        String(forn.fckProjeto),
        String(amostra.numeroAmostra),
        amostra.localAplicacao,
        new Date(amostra.dataMoldagem).toLocaleDateString('pt-BR'),
        cp.identificacao,
        String(cp.idadeEnsaioDias),
        cp.dataEnsaio ? new Date(cp.dataEnsaio).toLocaleDateString('pt-BR') : '',
        cp.diametroMm != null ? String(cp.diametroMm) : '',
        cp.alturaMm != null ? String(cp.alturaMm) : '',
        hd,
        cp.cargaRupturaKn != null ? String(cp.cargaRupturaKn) : '',
        cp.resistenciaMpa != null ? String(cp.resistenciaMpa) : '',
        cp.tipoFratura ?? '',
        cp.status,
      ])
    }

    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atterqtm-ensaios-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500">Laudos PDF e exportações</p>
      </div>

      {/* Filtro de obra */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-gray-600 font-medium">Filtrar por obra:</label>
        <select
          value={obraFiltro}
          onChange={(e) => setObraFiltro(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as obras</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
        <button
          onClick={handleExportCSV}
          className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          ⬇ Exportar CSV
        </button>
      </div>

      {/* Lista de amostras com link para laudo */}
      {amostrasFiltradas.length === 0 ? (
        <div className="border rounded-lg bg-white p-8 text-center text-gray-400 text-sm">
          {amostras.length === 0
            ? 'Nenhuma amostra cadastrada. Registre fornecimentos e amostras nas obras.'
            : 'Nenhuma amostra para a obra selecionada.'}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Obra</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fornecimento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Amostra</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Local aplicação</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">CPs</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {amostrasFiltradas.map((am) => {
                const forn = fornecimentos.find((f) => f.id === am.fornecimentoId)
                const obra = forn ? obras.find((o) => o.id === forn.obraId) : null
                if (!forn || !obra) return null
                const amCps = cps.filter((cp) => cp.amostraId === am.id)
                const ensaiados = amCps.filter((cp) => cp.status !== 'PENDENTE').length
                return (
                  <tr key={am.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{obra.nome}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(forn.dataConcretagem).toLocaleDateString('pt-BR')}
                      {forn.notaFiscal && <span className="text-xs ml-1 text-gray-400">NF {forn.notaFiscal}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #{am.numeroAmostra}
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(am.dataMoldagem).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{am.localAplicacao}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {ensaiados}/{amCps.length} ensaiados
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/relatorios/laudo/${obra.id}/${forn.id}/${am.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
                      >
                        Gerar Laudo PDF
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
