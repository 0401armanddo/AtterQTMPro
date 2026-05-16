import { Link } from 'react-router-dom'

export default function Obras() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
        <Link
          to="/obras/nova"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + Nova Obra
        </Link>
      </div>
      <div className="border rounded-lg bg-white p-8 text-center text-gray-400 text-sm">
        Nenhuma obra cadastrada. Clique em "Nova Obra" para começar.
      </div>
    </div>
  )
}
