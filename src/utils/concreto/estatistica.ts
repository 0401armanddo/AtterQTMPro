/**
 * Controle estatístico do concreto — NBR 12655:2022
 */

export interface ResultadoEstatistico {
  n: number
  fcm: number           // Resistência média
  fcMin: number         // Resistência mínima
  fcMax: number         // Resistência máxima
  desvioPadrao: number  // s
  cv: number            // Coeficiente de variação (%)
  fckEst: number        // Resistência característica estimada
  metodo: 'M1' | 'M2'  // M1: n < 6 | M2: n >= 6
}

/**
 * Calcula o desvio padrão amostral
 */
export function calcularDesvioPadrao(valores: number[]): number {
  if (valores.length < 2) return 0
  const media = valores.reduce((a, b) => a + b, 0) / valores.length
  const somaQuadrados = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0)
  return Math.sqrt(somaQuadrados / (valores.length - 1))
}

/**
 * Calcula o fck,est conforme NBR 12655:2022
 *
 * Método 1 (n < 6): fck,est = 2 × fcm - fcmax  (conservador)
 * Método 2 (n >= 6): fck,est = fcm - 1,65 × s  (estatístico)
 */
export function calcularFckEst(resistencias: number[]): ResultadoEstatistico {
  if (resistencias.length === 0) {
    throw new Error('Nenhuma resistência fornecida para cálculo')
  }

  const n = resistencias.length
  const fcm = resistencias.reduce((a, b) => a + b, 0) / n
  const fcMin = Math.min(...resistencias)
  const fcMax = Math.max(...resistencias)
  const desvioPadrao = calcularDesvioPadrao(resistencias)
  const cv = fcm > 0 ? (desvioPadrao / fcm) * 100 : 0

  let fckEst: number
  let metodo: 'M1' | 'M2'

  if (n < 6) {
    // Método 1 — NBR 12655:2022, item 8.3.1
    fckEst = 2 * fcm - fcMax
    metodo = 'M1'
  } else {
    // Método 2 — NBR 12655:2022, item 8.3.2
    fckEst = fcm - 1.65 * desvioPadrao
    metodo = 'M2'
  }

  return {
    n,
    fcm: Math.round(fcm * 100) / 100,
    fcMin,
    fcMax,
    desvioPadrao: Math.round(desvioPadrao * 100) / 100,
    cv: Math.round(cv * 10) / 10,
    fckEst: Math.round(fckEst * 100) / 100,
    metodo,
  }
}

/**
 * Classifica o nível de controle conforme CV (%)
 * NBR 12655:2022, Tabela 2
 */
export function classificarControle(cv: number): {
  nivel: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'MAL_CONTROLADO'
  descricao: string
} {
  if (cv <= 5) return { nivel: 'EXCELENTE', descricao: 'Excelente (CV ≤ 5%)' }
  if (cv <= 10) return { nivel: 'BOM', descricao: 'Bom (5% < CV ≤ 10%)' }
  if (cv <= 15) return { nivel: 'REGULAR', descricao: 'Regular (10% < CV ≤ 15%)' }
  return { nivel: 'MAL_CONTROLADO', descricao: 'Mal controlado (CV > 15%)' }
}

/**
 * Calcula limites do gráfico de controle de Shewhart
 */
export interface LimitesShewhart {
  media: number
  limiteAlertaSup: number   // +2σ
  limiteAcaoSup: number     // +3σ
  limiteAlertaInf: number   // -2σ
  limiteAcaoInf: number     // -3σ
}

export function calcularLimitesShewhart(
  media: number,
  desvioPadrao: number
): LimitesShewhart {
  return {
    media,
    limiteAlertaSup: Math.round((media + 2 * desvioPadrao) * 100) / 100,
    limiteAcaoSup: Math.round((media + 3 * desvioPadrao) * 100) / 100,
    limiteAlertaInf: Math.round((media - 2 * desvioPadrao) * 100) / 100,
    limiteAcaoInf: Math.round((media - 3 * desvioPadrao) * 100) / 100,
  }
}
