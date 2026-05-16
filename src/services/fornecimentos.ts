import type { Fornecimento } from '@/types'
import { makeStore } from '@/lib/storage'

export const fornecimentosService = makeStore<Fornecimento>('fornecimentos')
