import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-gray-600 text-sm md:text-base truncate max-w-[150px] md:max-w-none">
          <span className="hidden sm:inline">Connecté en tant que: </span>
          {user?.email}
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()} className="flex items-center text-red-500 hover:text-red-700 text-sm md:text-base">
        <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-1" /> 
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </header>
  );
}