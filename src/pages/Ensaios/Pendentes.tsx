export default function EnsaiosPendentes() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Ensaios Pendentes</h1>
      <p className="text-sm text-gray-500">
        Agenda de rompimentos de CPs para hoje e os próximos dias.
      </p>
      <div className="border rounded-lg bg-white p-8 text-center text-gray-400 text-sm">
        Nenhum ensaio pendente.
      </div>
    </div>
  )
}
