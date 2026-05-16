import { api } from './apiClient'
import type { CorpoDeProva } from '@/types'

type CreateData = Omit<CorpoDeProva, 'id' | 'createdAt' | 'updatedAt'>
type UpdateData = Partial<CreateData>

export const corposDeProvaService = {
  list: (amostraId?: string) =>
    api.get<CorpoDeProva[]>(amostraId ? `/corpos-de-prova?amostraId=${amostraId}` : '/corpos-de-prova'),
  get: (id: string) => api.get<CorpoDeProva>(`/corpos-de-prova/${id}`),
  create: (data: CreateData) => api.post<CorpoDeProva>('/corpos-de-prova', data),
  update: (id: string, data: UpdateData) => api.put<CorpoDeProva>(`/corpos-de-prova/${id}`, data),
  remove: (id: string) => api.delete(`/corpos-de-prova/${id}`),
}
