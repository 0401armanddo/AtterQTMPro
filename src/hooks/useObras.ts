import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Obra } from '@/types'
import { obrasService } from '@/services/obras'

export function useObras() {
  return useQuery({
    queryKey: ['obras'],
    queryFn: () => obrasService.list(),
  })
}

export function useObra(id: string) {
  return useQuery({
    queryKey: ['obras', id],
    queryFn: () => obrasService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>) =>
      obrasService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}

export function useUpdateObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>>
    }) => obrasService.update(id, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['obras'] })
      void queryClient.invalidateQueries({ queryKey: ['obras', variables.id] })
    },
  })
}

export function useDeleteObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => obrasService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}
