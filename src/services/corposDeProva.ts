import type { CorpoDeProva } from '@/types'
import { makeStore } from '@/lib/storage'

export const corposDeProvaService = makeStore<CorpoDeProva>('corposDeProva')
