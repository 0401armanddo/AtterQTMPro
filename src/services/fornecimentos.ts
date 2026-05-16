import { api } from './apiClient'
import type { Fornecimento } from '@/types'

type CreateData = Omit<Fornecimento, 'id' | 'createdAt' | 'updatedAt' | 'amostras'>
type UpdateData = Partial<CreateData>

export const fornecimentosService = {
  list: (obraId?: string) =>
    api.get<Fornecimento[]>(obraId ? `/fornecimentos?obraId=${obraId}` : '/fornecimentos'),
  get: (id: string) => api.get<Fornecimento>(`/fornecimentos/${id}`),
  create: (data: CreateData) => api.post<Fornecimento>('/fornecimentos', data),
  update: (id: string, data: UpdateData) => api.put<Fornecimento>(`/fornecimentos/${id}`, data),
  remove: (id: string) => api.delete(`/fornecimentos/${id}`),
}
