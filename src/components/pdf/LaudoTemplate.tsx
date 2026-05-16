import type { Obra, Fornecimento, Amostra, CorpoDeProva } from '@/types'
import { calcularFckEst } from '@/utils/concreto/estatistica'
import { avaliarConformidadeLote, avaliarCPIndividual } from '@/utils/concreto/conformidade'
import { validarGeometria } from '@/utils/concreto/resistencia'

interface Props {
  obra: Obra
  fornecimento: Fornecimento
  amostra: Amostra
  cps: CorpoDeProva[]
  numeroLaudo: string
  dataEmissao: string  // ISO string
}

const TIPO_FRATURA_LABEL: Record<string, string> = {
  TIPO_I: 'I — Cônica satisfatória',
  TIPO_II: 'II — Cônica c/ fendilhamento',
  TIPO_III: 'III — Cônica e cisalhamento',
  TIPO_IV: 'IV — Cisalhamento',
  TIPO_V: 'V — Colunar',
  TIPO_VI: 'VI — Topo cônico',
}

export default function LaudoTemplate({ obra, fornecimento, amostra, cps, numeroLaudo, dataEmissao }: Props) {
  const cpsEnsaiados = cps.filter((cp) => cp.resistenciaMpa != null && cp.status !== 'PENDENTE')
  const cps28 = cpsEnsaiados.filter((cp) => cp.idadeEnsaioDias === 28 && cp.resistenciaMpa != null)
  const resistencias28 = cps28.map((cp) => cp.resistenciaMpa!)

  const estatistica = resistencias28.length >= 2 ? calcularFckEst(resistencias28) : null
  const conformidade = estatistica
    ? avaliarConformidadeLote(estatistica.fckEst, fornecimento.fckProjeto, estatistica.fcMin)
    : null

  const dataEmissaoFmt = new Date(dataEmissao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const dataConcFmt = new Date(fornecimento.dataConcretagem).toLocaleDateString('pt-BR')
  const dataMoldFmt = new Date(amostra.dataMoldagem).toLocaleDateString('pt-BR')

  const statusColor = conformidade
    ? { ACEITO: '#15803d', ZONA_ANALISE: '#b45309', REJEITADO_IMEDIATO: '#dc2626', REJEITADO_CP_INDIVIDUAL: '#dc2626' }[conformidade.status]
    : '#6b7280'

  return (
    // 794px = A4 width a 96dpi. Padding em px equivalente a margens de ~15mm.
    <div style={{ width: 794, background: '#fff', padding: '48px 56px', fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#111', lineHeight: 1.5 }}>

      {/* ── Cabeçalho ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1d4ed8', paddingBottom: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8', letterSpacing: -0.5 }}>Átter QTM Pro</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Controle Tecnológico do Concreto</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Laudo de Ensaio de Compressão</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Nº {numeroLaudo} · Emitido em {dataEmissaoFmt}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Referência: NBR 5739:2018 · NBR 12655:2022</div>
        </div>
      </div>

      {/* ── 1. Dados da Obra ─────────────────────────── */}
      <Section title="1. Dados da Obra">
        <Grid2>
          <Field label="Obra" value={obra.nome} />
          <Field label="Responsável Técnico" value={obra.responsavelTecnico} />
          <Field label="Endereço" value={obra.endereco ?? '—'} />
          <Field label="CREA / CAU" value={obra.crea ?? '—'} />
          <Field label="CNO" value={obra.cno ?? '—'} />
          <Field label="ART / RRT" value={obra.art ?? '—'} />
        </Grid2>
      </Section>

      {/* ── 2. Dados do Fornecimento ─────────────────── */}
      <Section title="2. Dados do Fornecimento">
        <Grid2>
          <Field label="Data de concretagem" value={dataConcFmt} />
          <Field label="Nota Fiscal" value={fornecimento.notaFiscal ?? '—'} />
          <Field label="Volume concretado" value={`${fornecimento.volumeM3} m³`} />
          <Field label="Central concretagem" value={fornecimento.centraConcretagem ?? '—'} />
          <Field label="fck de projeto" value={`${fornecimento.fckProjeto} MPa`} />
          <Field label="Cimento" value={fornecimento.cimento ?? '—'} />
          <Field label="Brita" value={fornecimento.brita ?? '—'} />
          <Field label="Classe de abatimento" value={fornecimento.classeAbatimento ?? '—'} />
        </Grid2>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <Field label="Slump medido (mm)" value={fornecimento.slumpMedidoMm != null ? `${fornecimento.slumpMedidoMm}` : '—'} />
          <Field label="Slump especificado (mm)" value={fornecimento.slumpEspecificadoMm != null ? `${fornecimento.slumpEspecificadoMm}` : '—'} />
          <Field label="T. concreto (°C)" value={fornecimento.temperaturaConcC != null ? `${fornecimento.temperaturaConcC}` : '—'} />
          <Field label="T. ambiente (°C)" value={fornecimento.temperaturaAmbC != null ? `${fornecimento.temperaturaAmbC}` : '—'} />
        </div>
        {fornecimento.observacoes && (
          <div style={{ marginTop: 6, fontSize: 10, color: '#4b5563' }}>Obs.: {fornecimento.observacoes}</div>
        )}
      </Section>

      {/* ── 3. Dados da Amostra ─────────────────────── */}
      <Section title="3. Dados da Amostra">
        <Grid2>
          <Field label="Número da amostra" value={`#${amostra.numeroAmostra}`} />
          <Field label="Data de moldagem" value={dataMoldFmt} />
          <Field label="Local de aplicação" value={amostra.localAplicacao} />
          <Field label="Responsável pela coleta" value={amostra.responsavelColeta} />
        </Grid2>
        {amostra.observacoes && (
          <div style={{ marginTop: 6, fontSize: 10, color: '#4b5563' }}>Obs.: {amostra.observacoes}</div>
        )}
      </Section>

      {/* ── 4. Resultados dos Ensaios ────────────────── */}
      <Section title="4. Resultados dos Ensaios (NBR 5739:2018)">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Identificação', 'Idade (d)', 'Data ensaio', 'Ø (mm)', 'h (mm)', 'h/d', 'F (kN)', 'fc (MPa)', 'Fratura', 'Status'].map((h) => (
                <th key={h} style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cps.map((cp, i) => {
              const geom = cp.diametroMm && cp.alturaMm
                ? validarGeometria({ diametroMm: cp.diametroMm, alturaMm: cp.alturaMm })
                : null
              const avaliacao = cp.resistenciaMpa != null
                ? avaliarCPIndividual(cp.resistenciaMpa, fornecimento.fckProjeto)
                : null
              const fora = geom && !geom.valida
              const reprovado = avaliacao?.alerta
              return (
                <tr key={cp.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 600 }}>{cp.identificacao}</td>
                  <td style={{ padding: '4px 6px' }}>{cp.idadeEnsaioDias}</td>
                  <td style={{ padding: '4px 6px' }}>
                    {cp.dataEnsaio ? new Date(cp.dataEnsaio).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '4px 6px' }}>{cp.diametroMm ?? '—'}</td>
                  <td style={{ padding: '4px 6px' }}>{cp.alturaMm ?? '—'}</td>
                  <td style={{ padding: '4px 6px', color: fora ? '#dc2626' : undefined }}>
                    {geom ? `${geom.relacaoHD.toFixed(2)}${fora ? ' ⚠' : ''}` : '—'}
                  </td>
                  <td style={{ padding: '4px 6px' }}>{cp.cargaRupturaKn ?? '—'}</td>
                  <td style={{ padding: '4px 6px', fontWeight: 700, color: reprovado ? '#dc2626' : cp.resistenciaMpa != null ? '#15803d' : undefined }}>
                    {cp.resistenciaMpa != null ? `${cp.resistenciaMpa}` : '—'}
                  </td>
                  <td style={{ padding: '4px 6px', fontSize: 9 }}>
                    {cp.tipoFratura ? TIPO_FRATURA_LABEL[cp.tipoFratura] ?? cp.tipoFratura : '—'}
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{
                      background: cp.status === 'ENSAIADO' ? '#dcfce7' : cp.status === 'REJEITADO' ? '#fee2e2' : '#fef9c3',
                      color: cp.status === 'ENSAIADO' ? '#15803d' : cp.status === 'REJEITADO' ? '#dc2626' : '#b45309',
                      padding: '1px 6px', borderRadius: 4, fontWeight: 600, fontSize: 9,
                    }}>
                      {cp.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 6, fontSize: 9, color: '#6b7280' }}>
          ⚠ h/d fora de 1,94–2,10 requer fator de correção (NBR 5739:2018, Tabela 3). fc = 4·F / (π·D²).
        </div>
      </Section>

      {/* ── 5. Análise Estatística ───────────────────── */}
      <Section title="5. Análise Estatística (NBR 12655:2022)">
        {estatistica ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 10 }}>
              <StatBox label="n" value={String(estatistica.n)} />
              <StatBox label="fcm (MPa)" value={String(estatistica.fcm)} />
              <StatBox label="fc,mín (MPa)" value={String(estatistica.fcMin)} />
              <StatBox label="s (MPa)" value={String(estatistica.desvioPadrao)} />
              <StatBox label="CV (%)" value={String(estatistica.cv)} />
              <StatBox label={`fck,est — ${estatistica.metodo}`} value={`${estatistica.fckEst} MPa`} bold />
            </div>
            <div style={{ fontSize: 9, color: '#6b7280' }}>
              {estatistica.metodo === 'M1'
                ? 'Método 1 (n < 6): fck,est = 2·fcm − fc,máx'
                : 'Método 2 (n ≥ 6): fck,est = fcm − 1,65·s'}
              {' · '}Critério de aceitação: fck,est ≥ fck = {fornecimento.fckProjeto} MPa
              {' · '}Limite individual: fc ≥ 0,85·fck = {(fornecimento.fckProjeto * 0.85).toFixed(1)} MPa
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: '#6b7280' }}>
            {resistencias28.length < 2
              ? `Análise estatística requer ao menos 2 resultados de 28 dias. Disponível: ${resistencias28.length}.`
              : 'Sem resultados de 28 dias.'}
          </div>
        )}
      </Section>

      {/* ── 6. Conclusão ─────────────────────────────── */}
      <Section title="6. Conclusão">
        {conformidade ? (
          <div style={{ border: `2px solid ${statusColor}`, borderRadius: 6, padding: '10px 14px', background: statusColor + '18' }}>
            <div style={{ fontWeight: 700, color: statusColor, fontSize: 13, marginBottom: 4 }}>
              {conformidade.status.replace('_', ' ')}
            </div>
            <div style={{ fontSize: 11 }}>{conformidade.mensagem}</div>
            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>{conformidade.acao}</div>
          </div>
        ) : (
          <div style={{ fontSize: 10, color: '#6b7280' }}>
            Conclusão indisponível — ensaios de 28 dias ainda pendentes ou insuficientes.
          </div>
        )}
      </Section>

      {/* ── 7. Assinaturas ───────────────────────────── */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <SignBox label="Responsável pela Coleta" name={amostra.responsavelColeta} />
        <SignBox label="Responsável Técnico" name={obra.responsavelTecnico} registro={obra.crea} />
      </div>

      {/* ── Rodapé ──────────────────────────────────── */}
      <div style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #e5e7eb', fontSize: 9, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>Átter QTM Pro · Controle Tecnológico do Concreto · NBR 12655:2022 / NBR 5739:2018</span>
        <span>Laudo Nº {numeroLaudo} · {dataEmissaoFmt}</span>
      </div>
    </div>
  )
}

/* ── Auxiliares de layout ─────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 10, padding: '3px 8px', borderRadius: 3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'baseline', borderBottom: '1px dotted #e5e7eb', paddingBottom: 2 }}>
      <span style={{ color: '#6b7280', whiteSpace: 'nowrap', minWidth: 120, fontSize: 10 }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function StatBox({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: bold ? 700 : 600, color: bold ? '#1d4ed8' : '#111' }}>{value}</div>
    </div>
  )
}

function SignBox({ label, name, registro }: { label: string; name: string; registro?: string }) {
  return (
    <div>
      <div style={{ borderBottom: '1px solid #374151', marginBottom: 4, height: 40 }} />
      <div style={{ fontSize: 10, fontWeight: 600 }}>{name}</div>
      {registro && <div style={{ fontSize: 9, color: '#6b7280' }}>{registro}</div>}
      <div style={{ fontSize: 9, color: '#6b7280' }}>{label}</div>
    </div>
  )
}
