/**
 * Cálculos de resistência à compressão — NBR 5739:2018
 */

export interface DimensoesCP {
  diametroMm: number
  alturaMm: number
  massaG?: number
}

export interface ResultadoResistencia {
  resistenciaMpa: number
  relacaoHD: number
  fatorCorrecao: number
  resistenciaCorrigidaMpa: number
  geometriaValida: boolean
}

/**
 * Calcula a resistência à compressão: fc = (4 × F) / (π × D²)
 * F em kN, D em mm → resultado em MPa
 */
export function calcularResistencia(cargaKn: number, diametroMm: number): number {
  const cargaN = cargaKn * 1000
  const areaMm2 = Math.PI * Math.pow(diametroMm, 2) / 4
  const resistencia = (cargaN / areaMm2) // N/mm² = MPa
  return Math.round(resistencia * 100) / 100
}

/**
 * Valida a geometria do CP — NBR 5739:2018, item 5.1
 * Relação h/d deve estar entre 1,94 e 2,10
 */
export function validarGeometria(dims: DimensoesCP): {
  valida: boolean
  relacaoHD: number
  mensagem: string
} {
  const relacaoHD = dims.alturaMm / dims.diametroMm
  const valida = relacaoHD >= 1.94 && relacaoHD <= 2.10

  let mensagem = ''
  if (!valida) {
    if (relacaoHD < 1.94) {
      mensagem = `h/d = ${relacaoHD.toFixed(3)} está abaixo do mínimo de 1,94 (NBR 5739)`
    } else {
      mensagem = `h/d = ${relacaoHD.toFixed(3)} está acima do máximo de 2,10 (NBR 5739)`
    }
  }

  return { valida, relacaoHD, mensagem }
}

/**
 * Fator de correção para CPs com h/d fora da faixa ideal (2,00)
 * Tabela 3 da NBR 5739:2018 (valores interpolados linearmente)
 */
export function fatorCorrecaoHD(relacaoHD: number): number {
  const tabela: [number, number][] = [
    [1.75, 0.87],
    [1.50, 0.84],
    [1.25, 0.79],
    [1.00, 0.70],
  ]

  if (relacaoHD >= 2.0) return 1.0

  for (let i = 0; i < tabela.length - 1; i++) {
    const [h1, f1] = tabela[i]
    const [h2, f2] = tabela[i + 1]
    if (relacaoHD >= h2 && relacaoHD <= h1) {
      return f1 + ((relacaoHD - h1) / (h2 - h1)) * (f2 - f1)
    }
  }

  return 0.70
}

/**
 * Cálculo completo com validação de geometria e fator de correção
 */
export function calcularResultadoCompleto(
  cargaKn: number,
  dims: DimensoesCP
): ResultadoResistencia {
  const { valida, relacaoHD } = validarGeometria(dims)
  const resistenciaMpa = calcularResistencia(cargaKn, dims.diametroMm)
  const fatorCorrecao = fatorCorrecaoHD(relacaoHD)
  const resistenciaCorrigidaMpa = Math.round(resistenciaMpa * fatorCorrecao * 100) / 100

  return {
    resistenciaMpa,
    relacaoHD,
    fatorCorrecao,
    resistenciaCorrigidaMpa,
    geometriaValida: valida,
  }
}

/**
 * Calcula a data prevista de ensaio a partir da data de moldagem
 */
export function calcularDataEnsaio(dataMoldagem: Date, idadeDias: number): Date {
  const data = new Date(dataMoldagem)
  data.setDate(data.getDate() + idadeDias)
  return data
}

/**
 * Resistência estimada aos 28 dias a partir da resistência a 7 dias
 * Relação aproximada: fc7 ≈ 0,70 × fc28 (cimento CP II/CP III)
 */
export function estimarFc28(fc7: number): number {
  return Math.round((fc7 / 0.70) * 100) / 100
}
