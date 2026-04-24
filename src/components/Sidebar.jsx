import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings as SettingsIcon, Building2, X } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { activeCompany } = useCompany();
  const menus =[
    { name: 'Tableau de bord', path: '/', icon: Home },
    { name: 'Factures', path: '/invoices', icon: FileText },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Mes Entreprises', path: '/companies', icon: Building2 },
    { name: 'Paramètres', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-4 flex flex-col transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:min-h-screen
      `}>
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="text-xl font-bold text-blue-400 text-center flex-1">FacturePro SN</h1>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = location.pathname === menu.path;
            return (
              <Link key={menu.path} to={menu.path} onClick={() => onClose()}
                className={`flex items-center p-3 rounded-lg transition-colors ${active ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <Icon className="w-5 h-5 mr-3" />
                {menu.name}
              </Link>
            );
          })}
        </nav>

        {activeCompany && (
          <div className="mt-auto pt-4 border-t border-gray-800">
            <div className="flex items-center p-3 bg-gray-800 rounded-lg">
              <Building2 className="w-4 h-4 text-blue-400 mr-2" />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 uppercase font-bold">Entreprise active</p>
                <p className="text-sm font-medium truncate text-white">{activeCompany.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}