export function makeStore<T extends { id: string; createdAt: string }>(
  key: string
): {
  list: () => Promise<T[]>
  get: (id: string) => Promise<T>
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>
  update: (id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<T>
  remove: (id: string) => Promise<void>
} {
  function readAll(): T[] {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return []
      return JSON.parse(raw) as T[]
    } catch {
      return []
    }
  }

  function writeAll(items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items))
  }

  return {
    list(): Promise<T[]> {
      return Promise.resolve(readAll())
    },

    get(id: string): Promise<T> {
      const items = readAll()
      const item = items.find((i) => i.id === id)
      if (!item) {
        return Promise.reject(new Error(`[${key}] Item with id "${id}" not found`))
      }
      return Promise.resolve(item)
    },

    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      const items = readAll()
      const now = new Date().toISOString()
      const newItem = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as unknown as T
      writeAll([...items, newItem])
      return Promise.resolve(newItem)
    },

    update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
      const items = readAll()
      const index = items.findIndex((i) => i.id === id)
      if (index === -1) {
        return Promise.reject(new Error(`[${key}] Item with id "${id}" not found`))
      }
      const updated = {
        ...items[index],
        ...data,
        id,
        createdAt: items[index].createdAt,
        updatedAt: new Date().toISOString(),
      } as unknown as T
      const next = [...items]
      next[index] = updated
      writeAll(next)
      return Promise.resolve(updated)
    },

    remove(id: string): Promise<void> {
      const items = readAll()
      const next = items.filter((i) => i.id !== id)
      writeAll(next)
      return Promise.resolve()
    },
  }
}
