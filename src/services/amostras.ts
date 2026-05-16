import { api } from './apiClient'
import type { Amostra } from '@/types'

type CreateData = Omit<Amostra, 'id' | 'createdAt' | 'updatedAt' | 'corposDeProva'>
type UpdateData = Partial<CreateData>

export const amostrasService = {
  list: (fornecimentoId?: string) =>
    api.get<Amostra[]>(fornecimentoId ? `/amostras?fornecimentoId=${fornecimentoId}` : '/amostras'),
  get: (id: string) => api.get<Amostra>(`/amostras/${id}`),
  create: (data: CreateData) => api.post<Amostra>('/amostras', data),
  update: (id: string, data: UpdateData) => api.put<Amostra>(`/amostras/${id}`, data),
  remove: (id: string) => api.delete(`/amostras/${id}`),
}
