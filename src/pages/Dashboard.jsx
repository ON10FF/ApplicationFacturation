import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700">Actions rapides</h2>
          <div className="mt-4 flex flex-col space-y-3">
            <Link to="/invoices/create" className="flex items-center text-blue-600 hover:underline">
              <PlusCircle className="w-5 h-5 mr-2" /> Créer une facture
            </Link>
            <Link to="/invoices" className="flex items-center text-gray-600 hover:underline">
              <FileText className="w-5 h-5 mr-2" /> Voir mes factures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}