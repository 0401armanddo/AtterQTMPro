import { useMemo } from 'react'
import type { Obra, Fornecimento, Amostra, CorpoDeProva } from '@/types'
import { calcularFckEst, calcularLimitesShewhart } from '@/utils/concreto/estatistica'
import { avaliarConformidadeLote } from '@/utils/concreto/conformidade'

export interface PontoResistencia {
  label: string       // "CP-001-28D"
  data: string        // "12/06"
  resistencia: number
  fck: number
  limite085: number
}

export interface PontoShewhart {
  seq: number
  label: string
  resistencia: number
  media: number
  alertaSup: number
  alertaInf: number
  acaoSup: number
  acaoInf: number
  fck: number
}

export interface BinHistograma {
  faixa: string
  quantidade: number
  conformes: number
  naoCf: number
}

export interface DadosDashboard {
  fckProjeto: number
  evolucao: PontoResistencia[]
  shewhart: PontoShewhart[]
  histograma: BinHistograma[]
  media: number
  desvioPadrao: number
  cv: number
  fckEst: number
  metodo: 'M1' | 'M2'
  statusConformidade: ReturnType<typeof avaliarConformidadeLote> | null
  totalCPs: number
  cpsPendentes: number
  cpsEnsaiados: number
  cpsRejeitados: number
}

function buildHistograma(resistencias: number[], fck: number, bins = 8): BinHistograma[] {
  if (resistencias.length === 0) return []
  const min = Math.floor(Math.min(...resistencias))
  const max = Math.ceil(Math.max(...resistencias))
  const step = Math.ceil((max - min) / bins) || 1
  const result: BinHistograma[] = []
  for (let lo = min; lo < max; lo += step) {
    const hi = lo + step
    const vals = resistencias.filter((r) => r >= lo && r < hi)
    result.push({
      faixa: `${lo}–${hi}`,
      quantidade: vals.length,
      conformes: vals.filter((r) => r >= fck).length,
      naoCf: vals.filter((r) => r < fck).length,
    })
  }
  return result
}

export function buildDadosDashboard(
  obras: Obra[],
  fornecimentos: Fornecimento[],
  amostras: Amostra[],
  cps: CorpoDeProva[],
  obraId: string | null
): DadosDashboard | null {
  const forn = obraId
    ? fornecimentos.filter((f) => f.obraId === obraId)
    : fornecimentos
  const forkIds = new Set(forn.map((f) => f.id))
  const am = amostras.filter((a) => forkIds.has(a.fornecimentoId))
  const amIds = new Set(am.map((a) => a.id))
  const allCps = cps.filter((cp) => amIds.has(cp.amostraId))

  const obra = obraId ? obras.find((o) => o.id === obraId) : null
  const fckProjeto = obra?.fckProjeto ?? (forn[0]?.fckProjeto ?? 25)

  const totalCPs = allCps.length
  const cpsPendentes = allCps.filter((cp) => cp.status === 'PENDENTE').length
  const cpsEnsaiados = allCps.filter((cp) => cp.status === 'ENSAIADO').length
  const cpsRejeitados = allCps.filter((cp) => cp.status === 'REJEITADO').length

  // Only 28d results for statistical analysis
  const cps28 = allCps
    .filter((cp) => cp.idadeEnsaioDias === 28 && cp.resistenciaMpa != null && cp.status !== 'PENDENTE')
    .map((cp) => {
      const amostra = amostras.find((a) => a.id === cp.amostraId)
      return { cp, amostra }
    })
    .filter((x): x is { cp: CorpoDeProva & { resistenciaMpa: number }; amostra: Amostra | undefined } =>
      x.amostra !== undefined
    )
    .sort((a, b) => {
      const da = a.cp.dataEnsaio ? new Date(a.cp.dataEnsaio).getTime() : 0
      const db = b.cp.dataEnsaio ? new Date(b.cp.dataEnsaio).getTime() : 0
      return da - db
    })

  if (cps28.length === 0) {
    return {
      fckProjeto,
      evolucao: [],
      shewhart: [],
      histograma: [],
      media: 0,
      desvioPadrao: 0,
      cv: 0,
      fckEst: 0,
      metodo: 'M1',
      statusConformidade: null,
      totalCPs,
      cpsPendentes,
      cpsEnsaiados,
      cpsRejeitados,
    }
  }

  const resistencias = cps28.map((x) => x.cp.resistenciaMpa)
  const stat = calcularFckEst(resistencias)
  const limites = calcularLimitesShewhart(stat.fcm, stat.desvioPadrao)
  const conformidade = avaliarConformidadeLote(stat.fckEst, fckProjeto, stat.fcMin)

  const evolucao: PontoResistencia[] = cps28.map(({ cp }) => ({
    label: cp.identificacao,
    data: cp.dataEnsaio
      ? new Date(cp.dataEnsaio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : '',
    resistencia: cp.resistenciaMpa,
    fck: fckProjeto,
    limite085: Math.round(fckProjeto * 0.85 * 10) / 10,
  }))

  const shewhart: PontoShewhart[] = cps28.map(({ cp }, i) => ({
    seq: i + 1,
    label: cp.identificacao,
    resistencia: cp.resistenciaMpa,
    media: limites.media,
    alertaSup: limites.limiteAlertaSup,
    alertaInf: limites.limiteAlertaInf,
    acaoSup: limites.limiteAcaoSup,
    acaoInf: limites.limiteAcaoInf,
    fck: fckProjeto,
  }))

  const histograma = buildHistograma(resistencias, fckProjeto)

  return {
    fckProjeto,
    evolucao,
    shewhart,
    histograma,
    media: stat.fcm,
    desvioPadrao: stat.desvioPadrao,
    cv: stat.cv,
    fckEst: stat.fckEst,
    metodo: stat.metodo,
    statusConformidade: conformidade,
    totalCPs,
    cpsPendentes,
    cpsEnsaiados,
    cpsRejeitados,
  }
}

export function useDashboardData(
  obras: Obra[],
  fornecimentos: Fornecimento[],
  amostras: Amostra[],
  cps: CorpoDeProva[],
  obraId: string | null
) {
  return useMemo(
    () => buildDadosDashboard(obras, fornecimentos, amostras, cps, obraId),
    [obras, fornecimentos, amostras, cps, obraId]
  )
}
