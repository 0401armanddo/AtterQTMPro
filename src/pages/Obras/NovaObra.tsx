import { useNavigate } from 'react-router-dom'
import { useCreateObra } from '@/hooks/useObras'
import ObraForm from './ObraForm'

export default function NovaObra() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateObra()

  return (
    <ObraForm
      title="Nova Obra"
      isPending={isPending}
      onSubmit={({ fckProjetoNum, ...raw }) => {
        mutate(
          {
            nome: raw.nome,
            endereco: raw.endereco || undefined,
            responsavelTecnico: raw.responsavelTecnico,
            crea: raw.crea || undefined,
            cno: raw.cno || undefined,
            art: raw.art || undefined,
            fckProjeto: fckProjetoNum,
            status: raw.status,
            responsavelId: 'local',
          },
          { onSuccess: (obra) => navigate(`/obras/${obra.id}`) }
        )
      }}
    />
  )
}
