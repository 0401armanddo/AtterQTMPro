export default function Relatorios() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard
          title="Laudo por Amostra"
          description="Gera o laudo PDF de uma amostra específica com resultados e conclusão de conformidade."
          action="Gerar Laudo"
        />
        <ReportCard
          title="Relatório Mensal"
          description="Consolidado mensal de ensaios e índices de conformidade por obra."
          action="Gerar Relatório"
        />
        <ReportCard
          title="Exportar CSV"
          description="Exporta os dados de ensaios em formato CSV para análise em Excel."
          action="Exportar"
        />
      </div>
    </div>
  )
}

function ReportCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: string
}) {
  return (
    <div className="border rounded-lg p-5 bg-white space-y-3">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
        {action}
      </button>
    </div>
  )
}
