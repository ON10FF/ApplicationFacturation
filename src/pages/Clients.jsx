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
    <div>
      <h1 className="text-2xl font-bold mb-4">Mes Clients</h1>
      <form onSubmit={addClient} className="flex space-x-2 mb-6 bg-white p-4 shadow rounded">
        <input type="text" placeholder="Nom du client" required className="border p-2 rounded flex-1" value={name} onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="Adresse" className="border p-2 rounded flex-1" value={address} onChange={e => setAddress(e.target.value)} />
        <button className="bg-green-600 text-white px-4 rounded">Ajouter</button>
      </form>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr><th className="p-3">Nom</th><th className="p-3">Adresse</th></tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-t"><td className="p-3">{c.name}</td><td className="p-3">{c.address}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}