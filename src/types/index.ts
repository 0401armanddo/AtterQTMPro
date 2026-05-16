// Tipos compartilhados alinhados ao schema Prisma

export type PapelUsuario = 'ADMIN' | 'TECNICO' | 'VISUALIZADOR'
export type StatusObra = 'ATIVA' | 'CONCLUIDA' | 'SUSPENSA'
export type StatusCP = 'PENDENTE' | 'ENSAIADO' | 'REJEITADO'
export type TipoFratura = 'TIPO_I' | 'TIPO_II' | 'TIPO_III' | 'TIPO_IV' | 'TIPO_V' | 'TIPO_VI'
export type MetodoFckEst = 'M1' | 'M2'

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: PapelUsuario
  createdAt: string
}

export interface Obra {
  id: string
  nome: string
  endereco?: string
  responsavelTecnico: string
  crea?: string
  cno?: string
  art?: string
  fckProjeto: number
  status: StatusObra
  responsavelId: string
  createdAt: string
  updatedAt: string
  fornecimentos?: Fornecimento[]
}

export interface Fornecimento {
  id: string
  obraId: string
  notaFiscal?: string
  dataConcretagem: string
  volumeM3: number
  fckProjeto: number
  classeAbatimento?: string
  brita?: string
  cimento?: string
  centraConcretagem?: string
  slumpMedidoMm?: number
  slumpEspecificadoMm?: number
  temperaturaConcC?: number
  temperaturaAmbC?: number
  massaEspecifica?: number
  teorAr?: number
  observacoes?: string
  createdAt: string
  amostras?: Amostra[]
}

export interface Amostra {
  id: string
  fornecimentoId: string
  numeroAmostra: number
  dataMoldagem: string
  localAplicacao: string
  responsavelColeta: string
  coletorId?: string
  observacoes?: string
  createdAt: string
  corposDeProva?: CorpoDeProva[]
}

export interface CorpoDeProva {
  id: string
  amostraId: string
  identificacao: string
  idadeEnsaioDias: number
  diametroMm?: number
  alturaMm?: number
  massaG?: number
  dataEnsaio?: string
  cargaRupturaKn?: number
  resistenciaMpa?: number
  tipoFratura?: TipoFratura
  status: StatusCP
  observacoes?: string
  createdAt: string
  updatedAt: string
}

// DTOs de formulários
export interface ObraFormData {
  nome: string
  endereco?: string
  responsavelTecnico: string
  crea?: string
  cno?: string
  art?: string
  fckProjeto: number
  status: StatusObra
}

export interface FornecimentoFormData {
  obraId: string
  notaFiscal?: string
  dataConcretagem: string
  volumeM3: number
  fckProjeto: number
  classeAbatimento?: string
  brita?: string
  cimento?: string
  centraConcretagem?: string
  slumpMedidoMm?: number
  slumpEspecificadoMm?: number
  temperaturaConcC?: number
  temperaturaAmbC?: number
  massaEspecifica?: number
  teorAr?: number
  observacoes?: string
}

export interface AmostraFormData {
  fornecimentoId: string
  numeroAmostra: number
  dataMoldagem: string
  localAplicacao: string
  responsavelColeta: string
  observacoes?: string
}

export interface EnsaioFormData {
  cpId: string
  dataEnsaio: string
  diametroMm: number
  alturaMm: number
  massaG?: number
  cargaRupturaKn: number
  tipoFratura: TipoFratura
  observacoes?: string
}

// Resposta de autenticação
export interface AuthResponse {
  token: string
  usuario: Usuario
}
