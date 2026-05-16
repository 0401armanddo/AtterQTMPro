import { api } from './apiClient'
import type { Obra } from '@/types'

type CreateData = Omit<Obra, 'id' | 'createdAt' | 'updatedAt' | 'fornecimentos'>
type UpdateData = Partial<CreateData>

export const obrasService = {
  list: () => api.get<Obra[]>('/obras'),
  get: (id: string) => api.get<Obra>(`/obras/${id}`),
  create: (data: CreateData) => api.post<Obra>('/obras', data),
  update: (id: string, data: UpdateData) => api.put<Obra>(`/obras/${id}`, data),
  remove: (id: string) => api.delete(`/obras/${id}`),
}
