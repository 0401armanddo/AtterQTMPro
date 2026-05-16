/**
 * Critérios de aceitação e rejeição — NBR 12655:2022, Tabela 1
 */

export type StatusConformidade =
  | 'ACEITO'
  | 'ZONA_ANALISE'
  | 'REJEITADO_IMEDIATO'
  | 'REJEITADO_CP_INDIVIDUAL'

export interface ResultadoConformidade {
  status: StatusConformidade
  fckEst: number
  fckProjeto: number
  fcMin?: number
  limiteAceitacao: number      // fck_projeto
  limiteRejeicaoImediata: number  // 0,85 × fck_projeto
  limiteIndividual: number     // 0,85 × fck_projeto
  mensagem: string
  acao: string
}

/**
 * Avalia conformidade do lote conforme NBR 12655:2022, Tabela 1
 *
 * Critérios:
 *  - Aceito: fck,est >= fck (projeto)
 *  - Zona de análise: 0,85×fck <= fck,est < fck
 *  - Rejeição imediata: fck,est < 0,85×fck
 *  - CP individual: nenhum resultado < 0,85×fck
 */
export function avaliarConformidadeLote(
  fckEst: number,
  fckProjeto: number,
  fcMin?: number
): ResultadoConformidade {
  const limiteRejeicao = 0.85 * fckProjeto

  // Verifica rejeição por CP individual antes da análise do lote
  if (fcMin !== undefined && fcMin < limiteRejeicao) {
    return {
      status: 'REJEITADO_CP_INDIVIDUAL',
      fckEst,
      fckProjeto,
      fcMin,
      limiteAceitacao: fckProjeto,
      limiteRejeicaoImediata: limiteRejeicao,
      limiteIndividual: limiteRejeicao,
      mensagem: `CP individual com fc = ${fcMin} MPa está abaixo de 0,85 × fck = ${limiteRejeicao.toFixed(1)} MPa`,
      acao: 'Investigar estrutura. Possível extração de testemunhos conforme NBR 7680.',
    }
  }

  if (fckEst >= fckProjeto) {
    return {
      status: 'ACEITO',
      fckEst,
      fckProjeto,
      fcMin,
      limiteAceitacao: fckProjeto,
      limiteRejeicaoImediata: limiteRejeicao,
      limiteIndividual: limiteRejeicao,
      mensagem: `Lote ACEITO: fck,est = ${fckEst} MPa ≥ fck = ${fckProjeto} MPa`,
      acao: 'Nenhuma ação necessária.',
    }
  }

  if (fckEst < limiteRejeicao) {
    return {
      status: 'REJEITADO_IMEDIATO',
      fckEst,
      fckProjeto,
      fcMin,
      limiteAceitacao: fckProjeto,
      limiteRejeicaoImediata: limiteRejeicao,
      limiteIndividual: limiteRejeicao,
      mensagem: `Lote REJEITADO: fck,est = ${fckEst} MPa < 0,85 × fck = ${limiteRejeicao.toFixed(1)} MPa`,
      acao: 'Paralisar uso do concreto. Acionar responsável técnico imediatamente. Investigar estrutura (NBR 7680).',
    }
  }

  // Zona de análise: 0,85×fck <= fck,est < fck
  return {
    status: 'ZONA_ANALISE',
    fckEst,
    fckProjeto,
    fcMin,
    limiteAceitacao: fckProjeto,
    limiteRejeicaoImediata: limiteRejeicao,
    limiteIndividual: limiteRejeicao,
    mensagem: `Zona de análise: fck,est = ${fckEst} MPa (entre ${limiteRejeicao.toFixed(1)} e ${fckProjeto} MPa)`,
    acao: 'Análise complementar necessária. Consultar responsável técnico para decisão conforme NBR 12655.',
  }
}

/**
 * Avalia um CP individual (alerta de não conformidade)
 */
export function avaliarCPIndividual(
  resistenciaMpa: number,
  fckProjeto: number
): {
  conforme: boolean
  percentualFck: number
  alerta: boolean
  mensagem: string
} {
  const percentualFck = (resistenciaMpa / fckProjeto) * 100
  const limiteAlerta = 0.85 * fckProjeto
  const conforme = resistenciaMpa >= fckProjeto
  const alerta = resistenciaMpa < limiteAlerta

  let mensagem: string
  if (conforme) {
    mensagem = `CP conforme: ${resistenciaMpa} MPa (${percentualFck.toFixed(1)}% do fck)`
  } else if (alerta) {
    mensagem = `NÃO CONFORME: ${resistenciaMpa} MPa abaixo de 0,85 × fck (${limiteAlerta.toFixed(1)} MPa)`
  } else {
    mensagem = `Atenção: ${resistenciaMpa} MPa abaixo do fck mas acima de 0,85 × fck`
  }

  return { conforme, percentualFck: Math.round(percentualFck * 10) / 10, alerta, mensagem }
}

/**
 * Verifica frequência mínima de amostragem — NBR 12655:2022, item 7
 * 1 amostra a cada 100 m³ ou por andar, o que ocorrer primeiro
 */
export function verificarFrequenciaAmostragem(
  volumeM3: number,
  numeroAmostras: number
): {
  adequada: boolean
  amostrasNecessarias: number
  mensagem: string
} {
  const amostrasNecessarias = Math.ceil(volumeM3 / 100)
  const adequada = numeroAmostras >= amostrasNecessarias

  return {
    adequada,
    amostrasNecessarias,
    mensagem: adequada
      ? `Amostragem adequada: ${numeroAmostras} amostras para ${volumeM3} m³`
      : `Amostragem insuficiente: ${numeroAmostras}/${amostrasNecessarias} amostras para ${volumeM3} m³`,
  }
}
