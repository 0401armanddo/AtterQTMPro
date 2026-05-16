import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Amostra } from '@/types'
import { amostrasService } from '@/services/amostras'

type AmostraCreateData = Omit<Amostra, 'id' | 'createdAt'>
type AmostraUpdateData = Partial<Omit<Amostra, 'id' | 'createdAt'>>

export function useAmostras(fornecimentoId?: string) {
  return useQuery({
    queryKey: fornecimentoId ? ['amostras', { fornecimentoId }] : ['amostras'],
    queryFn: async () => {
      const all = await amostrasService.list()
      if (fornecimentoId) {
        return all.filter((a) => a.fornecimentoId === fornecimentoId)
      }
      return all
    },
  })
}

export function useAmostra(id: string) {
  return useQuery({
    queryKey: ['amostras', id],
    queryFn: () => amostrasService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateAmostra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AmostraCreateData) => amostrasService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['amostras'] })
    },
  })
}

export function useUpdateAmostra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AmostraUpdateData }) =>
      amostrasService.update(id, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['amostras'] })
      void queryClient.invalidateQueries({ queryKey: ['amostras', variables.id] })
    },
  })
}

export function useDeleteAmostra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => amostrasService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['amostras'] })
    },
  })
}
