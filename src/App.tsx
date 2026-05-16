import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Obras from '@/pages/Obras'
import NovaObra from '@/pages/Obras/NovaObra'
import EnsaiosPendentes from '@/pages/Ensaios/Pendentes'
import Relatorios from '@/pages/Relatorios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="obras">
              <Route index element={<Obras />} />
              <Route path="nova" element={<NovaObra />} />
            </Route>
            <Route path="ensaios">
              <Route path="pendentes" element={<EnsaiosPendentes />} />
            </Route>
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
