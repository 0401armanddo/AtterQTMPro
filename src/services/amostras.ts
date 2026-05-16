import type { Amostra } from '@/types'
import { makeStore } from '@/lib/storage'

export const amostrasService = makeStore<Amostra>('amostras')
