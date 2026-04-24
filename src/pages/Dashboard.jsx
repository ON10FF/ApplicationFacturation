import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <PlusCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Actions rapides</h2>
          <p className="text-gray-500 text-sm mb-6">Commencez à travailler immédiatement.</p>
          
          <div className="space-y-3">
            <Link to="/invoices/create" className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition group">
              <span className="font-medium">Créer une facture</span>
              <PlusCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/invoices" className="flex items-center justify-between p-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition group">
              <span className="font-medium">Voir mes factures</span>
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Placeholder cards for future features to make it look full */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Statistiques</h2>
          <p className="text-gray-500 text-sm">Bientôt disponible: suivez vos revenus et dépenses en un coup d'œil.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
            <PlusCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Notifications</h2>
          <p className="text-gray-500 text-sm">Bientôt disponible: soyez alerté des paiements en retard.</p>
        </div>
      </div>
    </div>
  );
}