import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCorpoDeProva, useUpdateCorpoDeProva } from '@/hooks/useCorposDeProva'
import { useAmostra } from '@/hooks/useAmostras'
import { useObra } from '@/hooks/useObras'
import { useFornecimento } from '@/hooks/useFornecimentos'
import { Field, inputCls } from '@/components/ui/Field'
import { calcularResultadoCompleto } from '@/utils/concreto/resistencia'
import { avaliarCPIndividual } from '@/utils/concreto/conformidade'
import type { TipoFratura } from '@/types'

interface FormValues {
  dataEnsaio: string
  diametroMm: string
  alturaMm: string
  massaG: string
  cargaRupturaKn: string
  tipoFratura: TipoFratura
  observacoes: string
}

const FRATURAS: { value: TipoFratura; label: string }[] = [
  { value: 'TIPO_I', label: 'Tipo I — Cônica satisfatória' },
  { value: 'TIPO_II', label: 'Tipo II — Cônica com fendilhamento' },
  { value: 'TIPO_III', label: 'Tipo III — Cônica e cisalhamento' },
  { value: 'TIPO_IV', label: 'Tipo IV — Cisalhamento' },
  { value: 'TIPO_V', label: 'Tipo V — Colunar com cones em ambas as bases' },
  { value: 'TIPO_VI', label: 'Tipo VI — Topo cônico com fendilhamento lateral' },
]

export default function RegistrarEnsaio() {
  const { obraId, fornecimentoId, amostraId, cpId } = useParams<{
    obraId: string
    fornecimentoId: string
    amostraId: string
    cpId: string
  }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId ?? '')
  const { data: forn } = useFornecimento(fornecimentoId ?? '')
  const { data: amostra } = useAmostra(amostraId ?? '')
  const { data: cp, isLoading } = useCorpoDeProva(cpId ?? '')
  const { mutate, isPending } = useUpdateCorpoDeProva()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      dataEnsaio: new Date().toISOString().slice(0, 10),
      diametroMm: '100',
      tipoFratura: 'TIPO_I',
    },
  })

  const [diametroMm, alturaMm, cargaKn] = watch(['diametroMm', 'alturaMm', 'cargaRupturaKn'])

  // Preview em tempo real
  const preview = (() => {
    const d = parseFloat(diametroMm)
    const h = parseFloat(alturaMm)
    const f = parseFloat(cargaKn)
    if (isNaN(d) || isNaN(h) || isNaN(f) || d <= 0 || h <= 0 || f <= 0) return null
    return calcularResultadoCompleto(f, { diametroMm: d, alturaMm: h })
  })()

  const conformidadePreview = preview && forn
    ? avaliarCPIndividual(preview.resistenciaCorrigidaMpa, forn.fckProjeto)
    : null

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Carregando...</div>
  if (!cp) return <div className="p-6 text-sm text-red-500">CP não encontrado.</div>

  const onSubmit = (raw: FormValues) => {
    const diametro = parseFloat(raw.diametroMm)
    const altura = parseFloat(raw.alturaMm)
    const carga = parseFloat(raw.cargaRupturaKn)
    const resultado = calcularResultadoCompleto(carga, { diametroMm: diametro, alturaMm: altura })

    mutate(
      {
        id: cp.id,
        data: {
          dataEnsaio: new Date(raw.dataEnsaio).toISOString(),
          diametroMm: diametro,
          alturaMm: altura,
          massaG: raw.massaG ? parseFloat(raw.massaG) : undefined,
          cargaRupturaKn: carga,
          resistenciaMpa: resultado.resistenciaCorrigidaMpa,
          tipoFratura: raw.tipoFratura,
          observacoes: raw.observacoes || undefined,
          status: conformidadePreview?.alerta ? 'REJEITADO' : 'ENSAIADO',
        },
      },
      {
        onSuccess: () =>
          navigate(`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${amostraId}`),
      }
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1 flex-wrap">
          <Link to="/obras" className="hover:text-gray-700">Obras</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}`} className="hover:text-gray-700">{obra?.nome ?? '...'}</Link>
          <span>/</span>
          <Link to={`/obras/${obraId}/fornecimentos/${fornecimentoId}/amostras/${amostraId}`} className="hover:text-gray-700">
            Amostra #{amostra?.numeroAmostra ?? '...'}
          </Link>
          <span>/</span>
          <span className="text-gray-700">Registrar Ensaio</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Ensaio</h1>
        <p className="text-sm text-gray-500 font-mono">{cp.identificacao} — {cp.idadeEnsaioDias} dias</p>
      </div>

      {/* Preview em tempo real */}
      {preview && (
        <div className={`border rounded-lg p-4 text-sm ${conformidadePreview?.alerta ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <p className="font-semibold mb-2">Resultado calculado (NBR 5739)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">Resistência</p>
              <p className="font-bold text-lg">{preview.resistenciaCorrigidaMpa} MPa</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">h/d</p>
              <p className={`font-medium ${!preview.geometriaValida ? 'text-orange-600' : ''}`}>
                {preview.relacaoHD.toFixed(3)}
                {!preview.geometriaValida && ' ⚠ fora de 1,94–2,10'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fator correção</p>
              <p className="font-medium">{preview.fatorCorrecao.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">fck projeto</p>
              <p className="font-medium">{forn?.fckProjeto} MPa</p>
            </div>
          </div>
          {conformidadePreview && (
            <p className={`mt-2 font-medium text-xs ${conformidadePreview.alerta ? 'text-red-700' : 'text-green-700'}`}>
              {conformidadePreview.mensagem}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Data do ensaio" required error={errors.dataEnsaio?.message}>
          <input {...register('dataEnsaio', { required: 'Obrigatório' })} type="date" className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Diâmetro (mm)" required error={errors.diametroMm?.message}>
            <input {...register('diametroMm', { required: 'Obrigatório' })} type="number" step="0.1" className={inputCls} placeholder="100" />
          </Field>
          <Field label="Altura (mm)" required error={errors.alturaMm?.message}>
            <input {...register('alturaMm', { required: 'Obrigatório' })} type="number" step="0.1" className={inputCls} placeholder="200" />
          </Field>
          <Field label="Massa (g)" error={errors.massaG?.message}>
            <input {...register('massaG')} type="number" step="1" className={inputCls} placeholder="3850" />
          </Field>
        </div>

        <Field label="Carga de ruptura (kN)" required error={errors.cargaRupturaKn?.message}>
          <input {...register('cargaRupturaKn', { required: 'Obrigatório' })} type="number" step="0.1" className={inputCls} placeholder="196.0" />
        </Field>

        <Field label="Tipo de fratura (NBR 5739)" required error={errors.tipoFratura?.message}>
          <select {...register('tipoFratura', { required: 'Obrigatório' })} className={inputCls}>
            {FRATURAS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
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
            {isPending ? 'Salvando...' : 'Registrar Resultado'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 border text-sm rounded-md hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
