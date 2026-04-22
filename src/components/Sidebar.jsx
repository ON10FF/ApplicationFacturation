import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const menus =[
    { name: 'Tableau de bord', path: '/', icon: Home },
    { name: 'Factures', path: '/invoices', icon: FileText },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Paramètres', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold text-blue-400 mb-8 mt-4 text-center">FacturePro SN</h1>
      <nav className="space-y-2 flex-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = location.pathname === menu.path;
          return (
            <Link key={menu.path} to={menu.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${active ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              <Icon className="w-5 h-5 mr-3" />
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}