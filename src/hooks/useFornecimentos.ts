import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Fornecimento } from '@/types'
import { fornecimentosService } from '@/services/fornecimentos'

type FornecimentoCreateData = Omit<Fornecimento, 'id' | 'createdAt'>
type FornecimentoUpdateData = Partial<Omit<Fornecimento, 'id' | 'createdAt'>>

export function useFornecimentos(obraId?: string) {
  return useQuery({
    queryKey: obraId ? ['fornecimentos', { obraId }] : ['fornecimentos'],
    queryFn: () => fornecimentosService.list(obraId),
  })
}

export function useFornecimento(id: string) {
  return useQuery({
    queryKey: ['fornecimentos', id],
    queryFn: () => fornecimentosService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateFornecimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FornecimentoCreateData) => fornecimentosService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fornecimentos'] })
    },
  })
}

export function useUpdateFornecimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FornecimentoUpdateData }) =>
      fornecimentosService.update(id, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['fornecimentos'] })
      void queryClient.invalidateQueries({ queryKey: ['fornecimentos', variables.id] })
    },
  })
}

export function useDeleteFornecimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fornecimentosService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fornecimentos'] })
    },
  })
}
