import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCreateFornecimento } from '@/hooks/useFornecimentos'
import { useObra } from '@/hooks/useObras'
import { Field, inputCls } from '@/components/ui/Field'

interface FormValues {
  notaFiscal: string
  dataConcretagem: string
  volumeM3: string
  fckProjeto: string
  classeAbatimento: string
  brita: string
  cimento: string
  centraConcretagem: string
  slumpMedidoMm: string
  slumpEspecificadoMm: string
  temperaturaConcC: string
  temperaturaAmbC: string
  massaEspecifica: string
  teorAr: string
  observacoes: string
}

export default function NovoFornecimento() {
  const { obraId } = useParams<{ obraId: string }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId ?? '')
  const { mutate, isPending } = useCreateFornecimento()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { dataConcretagem: new Date().toISOString().slice(0, 10) },
  })

  const num = (v: string) => (v ? parseFloat(v) : undefined)

  const onSubmit = (raw: FormValues) => {
    mutate(
      {
        obraId: obraId!,
        notaFiscal: raw.notaFiscal || undefined,
        dataConcretagem: new Date(raw.dataConcretagem).toISOString(),
        volumeM3: parseFloat(raw.volumeM3),
        fckProjeto: parseFloat(raw.fckProjeto) || obra?.fckProjeto || 25,
        classeAbatimento: raw.classeAbatimento || undefined,
        brita: raw.brita || undefined,
        cimento: raw.cimento || undefined,
        centraConcretagem: raw.centraConcretagem || undefined,
        slumpMedidoMm: num(raw.slumpMedidoMm),
        slumpEspecificadoMm: num(raw.slumpEspecificadoMm),
        temperaturaConcC: num(raw.temperaturaConcC),
        temperaturaAmbC: num(raw.temperaturaAmbC),
        massaEspecifica: num(raw.massaEspecifica),
        teorAr: num(raw.teorAr),
        observacoes: raw.observacoes || undefined,
      },
      { onSuccess: (f) => navigate(`/obras/${obraId}/fornecimentos/${f.id}`) }
    )
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/obras" className="hover:text-gray-700">Obras</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}`} className="hover:text-gray-700">{obra?.nome ?? '...'}</Link>
          <span>/</span>
          <span className="text-gray-700">Novo Fornecimento</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Fornecimento</h1>
        <p className="text-sm text-gray-500">Registro de betonada — NBR 7212 / NBR 5776 / NBR 9833</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identificação */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-1">Identificação</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data de concretagem" required error={errors.dataConcretagem?.message}>
              <input {...register('dataConcretagem', { required: 'Obrigatório' })} type="date" className={inputCls} />
            </Field>
            <Field label="Nota Fiscal" error={errors.notaFiscal?.message}>
              <input {...register('notaFiscal')} className={inputCls} placeholder="NF-e 000123" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Volume (m³)" required error={errors.volumeM3?.message}>
              <input {...register('volumeM3', { required: 'Obrigatório' })} type="number" step="0.1" className={inputCls} placeholder="8.0" />
            </Field>
            <Field label="fck de projeto (MPa)" error={errors.fckProjeto?.message}>
              <input {...register('fckProjeto')} type="number" step="1" className={inputCls} placeholder={String(obra?.fckProjeto ?? 25)} />
            </Field>
            <Field label="Central concretagem" error={errors.centraConcretagem?.message}>
              <input {...register('centraConcretagem')} className={inputCls} placeholder="Concremix" />
            </Field>
          </div>
        </section>

        {/* Composição */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-1">Composição do concreto</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Classe de abatimento" error={errors.classeAbatimento?.message}>
              <input {...register('classeAbatimento')} className={inputCls} placeholder="S100" />
            </Field>
            <Field label="Brita" error={errors.brita?.message}>
              <input {...register('brita')} className={inputCls} placeholder="Brita 1" />
            </Field>
            <Field label="Cimento" error={errors.cimento?.message}>
              <input {...register('cimento')} className={inputCls} placeholder="CP II-F 32" />
            </Field>
          </div>
        </section>

        {/* Concreto fresco — NBR 5776 / NBR 9833 */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-1">Concreto fresco (NBR 5776 / NBR 9833)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Slump medido (mm)" error={errors.slumpMedidoMm?.message}>
              <input {...register('slumpMedidoMm')} type="number" step="1" className={inputCls} placeholder="120" />
            </Field>
            <Field label="Slump especificado (mm)" error={errors.slumpEspecificadoMm?.message}>
              <input {...register('slumpEspecificadoMm')} type="number" step="1" className={inputCls} placeholder="100" />
            </Field>
            <Field label="T. concreto (°C)" error={errors.temperaturaConcC?.message}>
              <input {...register('temperaturaConcC')} type="number" step="0.1" className={inputCls} placeholder="28.5" />
            </Field>
            <Field label="T. ambiente (°C)" error={errors.temperaturaAmbC?.message}>
              <input {...register('temperaturaAmbC')} type="number" step="0.1" className={inputCls} placeholder="32.0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Massa específica (kg/m³)" error={errors.massaEspecifica?.message}>
              <input {...register('massaEspecifica')} type="number" step="0.1" className={inputCls} placeholder="2380" />
            </Field>
            <Field label="Teor de ar (%)" error={errors.teorAr?.message}>
              <input {...register('teorAr')} type="number" step="0.1" className={inputCls} placeholder="1.5" />
            </Field>
          </div>
        </section>

        <Field label="Observações" error={errors.observacoes?.message}>
          <textarea {...register('observacoes')} rows={3} className={inputCls} placeholder="Observações relevantes..." />
        </Field>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar Fornecimento'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 border text-sm rounded-md hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
