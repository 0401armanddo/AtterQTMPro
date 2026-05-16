import { useNavigate, useParams } from 'react-router-dom'
import { useObra, useUpdateObra } from '@/hooks/useObras'
import ObraForm from './ObraForm'

export default function EditarObra() {
  const { obraId } = useParams<{ obraId: string }>()
  const navigate = useNavigate()
  const { data: obra, isLoading } = useObra(obraId ?? '')
  const { mutate, isPending } = useUpdateObra()

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!obra) return <div className="p-6 text-sm text-red-500">Obra não encontrada.</div>

  return (
    <ObraForm
      title={`Editar — ${obra.nome}`}
      isPending={isPending}
      defaultValues={{
        nome: obra.nome,
        endereco: obra.endereco ?? '',
        responsavelTecnico: obra.responsavelTecnico,
        crea: obra.crea ?? '',
        cno: obra.cno ?? '',
        art: obra.art ?? '',
        fckProjeto: String(obra.fckProjeto),
        status: obra.status,
      }}
      onSubmit={({ fckProjetoNum, ...raw }) => {
        mutate(
          {
            id: obra.id,
            data: {
              nome: raw.nome,
              endereco: raw.endereco || undefined,
              responsavelTecnico: raw.responsavelTecnico,
              crea: raw.crea || undefined,
              cno: raw.cno || undefined,
              art: raw.art || undefined,
              fckProjeto: fckProjetoNum,
              status: raw.status,
            },
          },
          { onSuccess: () => navigate(`/obras/${obra.id}`) }
        )
      }}
    />
  )
}
