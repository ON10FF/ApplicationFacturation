import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const fetchClients = async () => {
    if (!user) return;
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id);
    if (data) setClients(data);
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const addClient = async (e) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from('clients').insert([{ name, address, user_id: user.id }]);
    if (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      alert('Erreur: ' + error.message);
    } else {
      setName(''); setAddress('');
      fetchClients();
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mes Clients</h1>
      
      <form onSubmit={addClient} className="flex flex-col sm:flex-row gap-3 mb-8 bg-white p-4 md:p-6 shadow rounded-xl border border-gray-100">
        <div className="flex-1">
          <input type="text" placeholder="Nom du client" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="flex-1">
          <input type="text" placeholder="Adresse" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
            value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-100">
          Ajouter
        </button>
      </form>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Nom</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Adresse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-800">{c.name}</td>
                  <td className="p-4 text-sm text-gray-600">{c.address || '-'}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-12 text-center text-gray-400">
                    Aucun client enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}