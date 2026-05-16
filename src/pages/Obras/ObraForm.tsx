import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Field, inputCls } from '@/components/ui/Field'
import type { StatusObra } from '@/types'

export interface ObraFormValues {
  nome: string
  endereco: string
  responsavelTecnico: string
  crea: string
  cno: string
  art: string
  fckProjeto: string
  status: StatusObra
}

interface Props {
  title: string
  defaultValues?: Partial<ObraFormValues>
  onSubmit: (values: ObraFormValues & { fckProjetoNum: number }) => void
  isPending: boolean
}

export default function ObraForm({ title, defaultValues, onSubmit, isPending }: Props) {
  const navigate = useNavigate()
  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<ObraFormValues>({ defaultValues: { status: 'ATIVA', ...defaultValues } })

  useEffect(() => {
    if (defaultValues) reset({ status: 'ATIVA', ...defaultValues })
  }, [defaultValues, reset])

  const handleValid = (raw: ObraFormValues) => {
    const fckProjetoNum = parseFloat(raw.fckProjeto)
    if (isNaN(fckProjetoNum) || fckProjetoNum < 20) {
      setError('fckProjeto', { message: 'fck mínimo é 20 MPa (NBR 6118)' })
      return
    }
    if (fckProjetoNum > 100) {
      setError('fckProjeto', { message: 'fck máximo é 100 MPa' })
      return
    }
    onSubmit({ ...raw, fckProjetoNum })
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <form onSubmit={handleSubmit(handleValid)} className="space-y-4">
        <Field label="Nome da obra" required error={errors.nome?.message}>
          <input {...register('nome', { required: 'Obrigatório' })} className={inputCls} placeholder="Ex: Residencial Solar" />
        </Field>

        <Field label="Endereço" error={errors.endereco?.message}>
          <input {...register('endereco')} className={inputCls} placeholder="Rua, número, cidade" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Responsável Técnico" required error={errors.responsavelTecnico?.message}>
            <input {...register('responsavelTecnico', { required: 'Obrigatório' })} className={inputCls} placeholder="Eng. João Silva" />
          </Field>
          <Field label="CREA / CAU" error={errors.crea?.message}>
            <input {...register('crea')} className={inputCls} placeholder="CREA-SP 123456/D" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="CNO" error={errors.cno?.message}>
            <input {...register('cno')} className={inputCls} placeholder="000.000.000/00" />
          </Field>
          <Field label="Número da ART/RRT" error={errors.art?.message}>
            <input {...register('art')} className={inputCls} placeholder="ART nº ..." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="fck de projeto (MPa)" required error={errors.fckProjeto?.message}>
            <input {...register('fckProjeto', { required: 'Obrigatório' })} type="number" step="1" className={inputCls} placeholder="25" />
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
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 border text-sm font-medium rounded-md hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
