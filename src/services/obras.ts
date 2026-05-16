import type { Obra } from '@/types'
import { makeStore } from '@/lib/storage'

export const obrasService = makeStore<Obra>('obras')
