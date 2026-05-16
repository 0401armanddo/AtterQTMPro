import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  endereco: z.string().optional(),
  responsavelTecnico: z.string().min(3, 'Informe o nome do responsável técnico'),
  crea: z.string().optional(),
  cno: z.string().optional(),
  art: z.string().optional(),
  fckProjeto: z.string(),
  status: z.enum(['ATIVA', 'CONCLUIDA', 'SUSPENSA']),
})

type ObraFormValues = z.infer<typeof schema>

interface FormErrors {
  nome?: string
  responsavelTecnico?: string
  fckProjeto?: string
}

export default function NovaObra() {
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors } } =
    useForm<ObraFormValues>({ defaultValues: { status: 'ATIVA' } })

  const onSubmit = (raw: ObraFormValues) => {
    const formErrors: FormErrors = {}
    if (raw.nome.length < 3) formErrors.nome = 'Nome deve ter ao menos 3 caracteres'
    if (raw.responsavelTecnico.length < 3) formErrors.responsavelTecnico = 'Informe o RT'
    const fck = parseFloat(raw.fckProjeto)
    if (isNaN(fck) || fck < 20) formErrors.fckProjeto = 'fck mínimo é 20 MPa (NBR 6118)'
    if (fck > 100) formErrors.fckProjeto = 'fck máximo é 100 MPa'

    if (Object.keys(formErrors).length > 0) {
      for (const [field, msg] of Object.entries(formErrors)) {
        setError(field as keyof ObraFormValues, { message: msg })
      }
      return
    }

    // TODO: chamar API POST /obras
    console.log('Nova obra:', { ...raw, fckProjeto: fck })
    navigate('/obras')
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Obra</h1>
        <p className="text-sm text-gray-500">Preencha os dados cadastrais da obra</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome da obra *" error={errors.nome?.message}>
          <input {...register('nome')} className={inputCls} placeholder="Ex: Residencial Solar" />
        </Field>

        <Field label="Endereço" error={errors.endereco?.message}>
          <input {...register('endereco')} className={inputCls} placeholder="Rua, número, cidade" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Responsável Técnico *" error={errors.responsavelTecnico?.message}>
            <input {...register('responsavelTecnico')} className={inputCls} placeholder="Eng. João Silva" />
          </Field>
          <Field label="CREA / CAU" error={errors.crea?.message}>
            <input {...register('crea')} className={inputCls} placeholder="CREA-SP 123456/D" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="CNO (Cadastro Nacional de Obras)" error={errors.cno?.message}>
            <input {...register('cno')} className={inputCls} placeholder="000.000.000/00" />
          </Field>
          <Field label="Número da ART/RRT" error={errors.art?.message}>
            <input {...register('art')} className={inputCls} placeholder="Art nº ..." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="fck de projeto (MPa) *" error={errors.fckProjeto?.message}>
            <input
              {...register('fckProjeto')}
              type="number"
              step="1"
              className={inputCls}
              placeholder="25"
            />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputCls}>
              <option value="ATIVA">Ativa</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="SUSPENSA">Suspensa</option>
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
            Salvar Obra
          </button>
          <button
            type="button"
            onClick={() => navigate('/obras')}
            className="px-5 py-2 border text-sm font-medium rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
