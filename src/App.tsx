import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Auth/Login'
import Dashboard from '@/pages/Dashboard'
import Obras from '@/pages/Obras'
import NovaObra from '@/pages/Obras/NovaObra'
import EditarObra from '@/pages/Obras/EditarObra'
import ObraDetalhe from '@/pages/Obras/ObraDetalhe'
import NovoFornecimento from '@/pages/Fornecimentos/NovoFornecimento'
import FornecimentoDetalhe from '@/pages/Fornecimentos/FornecimentoDetalhe'
import NovaAmostra from '@/pages/Amostras/NovaAmostra'
import AmostraDetalhe from '@/pages/Amostras/AmostraDetalhe'
import RegistrarEnsaio from '@/pages/Ensaios/RegistrarEnsaio'
import EnsaiosPendentes from '@/pages/Ensaios/Pendentes'
import Relatorios from '@/pages/Relatorios'
import LaudoAmostra from '@/pages/Relatorios/LaudoAmostra'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="obras">
                <Route index element={<Obras />} />
                <Route path="nova" element={<NovaObra />} />
                <Route path=":obraId" element={<ObraDetalhe />} />
                <Route path=":obraId/editar" element={<EditarObra />} />
                <Route path=":obraId/fornecimentos/novo" element={<NovoFornecimento />} />
                <Route path=":obraId/fornecimentos/:fornecimentoId" element={<FornecimentoDetalhe />} />
                <Route path=":obraId/fornecimentos/:fornecimentoId/amostras/nova" element={<NovaAmostra />} />
                <Route path=":obraId/fornecimentos/:fornecimentoId/amostras/:amostraId" element={<AmostraDetalhe />} />
                <Route path=":obraId/fornecimentos/:fornecimentoId/amostras/:amostraId/ensaios/:cpId" element={<RegistrarEnsaio />} />
              </Route>

              <Route path="ensaios/pendentes" element={<EnsaiosPendentes />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="relatorios/laudo/:obraId/:fornecimentoId/:amostraId" element={<LaudoAmostra />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
