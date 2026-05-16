import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CorpoDeProva } from '@/types'
import { corposDeProvaService } from '@/services/corposDeProva'

type CorpoDeProvaCreateData = Omit<CorpoDeProva, 'id' | 'createdAt' | 'updatedAt'>
type CorpoDeProvaUpdateData = Partial<Omit<CorpoDeProva, 'id' | 'createdAt' | 'updatedAt'>>

export function useCorposDeProva(amostraId?: string) {
  return useQuery({
    queryKey: amostraId ? ['corposDeProva', { amostraId }] : ['corposDeProva'],
    queryFn: async () => {
      const all = await corposDeProvaService.list()
      if (amostraId) {
        return all.filter((cp) => cp.amostraId === amostraId)
      }
      return all
    },
  })
}

export function useCorpoDeProva(id: string) {
  return useQuery({
    queryKey: ['corposDeProva', id],
    queryFn: () => corposDeProvaService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateCorpoDeProva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CorpoDeProvaCreateData) => corposDeProvaService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corposDeProva'] })
    },
  })
}

export function useUpdateCorpoDeProva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CorpoDeProvaUpdateData }) =>
      corposDeProvaService.update(id, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['corposDeProva'] })
      void queryClient.invalidateQueries({ queryKey: ['corposDeProva', variables.id] })
    },
  })
}

export function useDeleteCorpoDeProva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => corposDeProvaService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corposDeProva'] })
    },
  })
}
