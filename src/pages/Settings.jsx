import { Link } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';
import { Building2, ArrowRight, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { activeCompany, companies } = useCompany();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
            <p className="text-gray-500">Gérez votre compte et vos préférences.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-gray-400" />
              Gestion des entreprises
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Vous avez actuellement <strong>{companies.length}</strong> entreprise(s) enregistrée(s). 
              La gestion des profils (logo, cachet, adresse) se fait désormais dans l'onglet dédié.
            </p>

            {activeCompany ? (
              <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeCompany.logo_url ? (
                    <img src={activeCompany.logo_url} alt="Logo" className="w-10 h-10 object-contain border rounded p-1" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold">
                      {activeCompany.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{activeCompany.name}</p>
                    <p className="text-xs text-gray-500">Entreprise actuellement active</p>
                  </div>
                </div>
                <Link to="/companies" className="text-blue-600 hover:text-blue-700 p-2">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100 text-sm mb-4">
                Aucune entreprise active. Veuillez en sélectionner une.
              </div>
            )}

            <Link 
              to="/companies" 
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-blue-100"
            >
              Aller à la gestion des entreprises
            </Link>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Version 1.2.0 • FacturePro SN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}