import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="text-gray-600">Connecté en tant que: {user?.email}</div>
      <button onClick={() => supabase.auth.signOut()} className="flex items-center text-red-500 hover:text-red-700">
        <LogOut className="w-5 h-5 mr-1" /> Déconnexion
      </button>
    </header>
  );
}