import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCreateAmostra } from '@/hooks/useAmostras'
import { useObra } from '@/hooks/useObras'
import { useFornecimento } from '@/hooks/useFornecimentos'
import { useAmostras } from '@/hooks/useAmostras'
import { Field, inputCls } from '@/components/ui/Field'

interface FormValues {
  dataMoldagem: string
  localAplicacao: string
  responsavelColeta: string
  observacoes: string
}

// Idades padrão de ensaio — NBR 12655
const IDADES_PADRAO = [7, 28]

export default function NovaAmostra() {
  const { obraId, fornecimentoId } = useParams<{ obraId: string; fornecimentoId: string }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId ?? '')
  const { data: forn } = useFornecimento(fornecimentoId ?? '')
  const { data: amostrasExistentes = [] } = useAmostras(fornecimentoId)
  const { mutate, isPending } = useCreateAmostra()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { dataMoldagem: new Date().toISOString().slice(0, 10) },
  })

  const proximoNumero = amostrasExistentes.length + 1

  const onSubmit = (raw: FormValues) => {
    const dataMoldagem = new Date(raw.dataMoldagem)

    mutate(
      {
        fornecimentoId: fornecimentoId!,
        numeroAmostra: proximoNumero,
        dataMoldagem: dataMoldagem.toISOString(),
        localAplicacao: raw.localAplicacao,
        responsavelColeta: raw.responsavelColeta,
        observacoes: raw.observacoes || undefined,
      },
      {
        onSuccess: (amostra) =>
          navigate(`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${amostra.id}`),
      }
    )
  }

  const dataFmt = forn ? new Date(forn.dataConcretagem).toLocaleDateString('pt-BR') : '...'

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/obras" className="hover:text-gray-700">Obras</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}`} className="hover:text-gray-700">{obra?.nome ?? '...'}</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}/fornecimentos/${fornecimentoId}`} className="hover:text-gray-700">
            Forn. {dataFmt}
          </Link>
          <span>/</span>
          <span className="text-gray-700">Nova Amostra</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Amostra</h1>
        <p className="text-sm text-gray-500">Amostra #{proximoNumero} — serão criados CPs para {IDADES_PADRAO.join(', ')} dias.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Data de moldagem" required error={errors.dataMoldagem?.message}>
          <input {...register('dataMoldagem', { required: 'Obrigatório' })} type="date" className={inputCls} />
        </Field>

        <Field label="Local de aplicação" required error={errors.localAplicacao?.message}>
          <input
            {...register('localAplicacao', { required: 'Obrigatório' })}
            className={inputCls}
            placeholder="Ex: Pilar P7 - Pavimento 3"
          />
        </Field>

        <Field label="Responsável pela coleta" required error={errors.responsavelColeta?.message}>
          <input
            {...register('responsavelColeta', { required: 'Obrigatório' })}
            className={inputCls}
            placeholder="Nome do técnico"
          />
        </Field>

        <Field label="Observações" error={errors.observacoes?.message}>
          <textarea {...register('observacoes')} rows={2} className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Criando...' : 'Criar Amostra'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 border text-sm rounded-md hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
