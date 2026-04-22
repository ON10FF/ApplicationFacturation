import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', ninea: '', rccm: '', address: '', phone: '', email: '', stamp_image_url: '' });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      // On utilise le bucket 'factures' que nous avons déjà créé, dans un dossier 'stamps'
      const fileName = `stamps/${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('factures')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) {
        console.error('Erreur upload image:', uploadError);
        alert('Erreur lors de l\'envoi de l\'image : ' + uploadError.message);
        setLoading(false);
        return;
      }
      
      const { data } = supabase.storage.from('factures').getPublicUrl(fileName);
      setForm({ ...form, [field]: data.publicUrl });
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle();
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération:', error);
    }
    if (data) setForm({ ...form, ...data });
  };

  useEffect(() => {
    if (user) {
      fetchCompany();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const { data: existing, error: fetchError } = await supabase.from('companies').select('id').eq('user_id', user.id).maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur de vérification:', fetchError);
      alert('Erreur: ' + fetchError.message);
      setLoading(false);
      return;
    }
    
    let actionError;
    if (existing) {
      const { error } = await supabase.from('companies').update(form).eq('id', existing.id);
      actionError = error;
    } else {
      const { error } = await supabase.from('companies').insert([{ ...form, user_id: user.id }]);
      actionError = error;
    }
    
    setLoading(false);
    
    if (actionError) {
      console.error('Erreur de sauvegarde:', actionError);
      alert('Erreur lors de la sauvegarde: ' + actionError.message);
    } else {
      alert('Paramètres sauvegardés !');
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Profil de l'entreprise</h2>
      <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Raison Sociale *</label>
          <input type="text" required className="w-full p-2 border rounded" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NINEA *</label>
          <input type="text" required className="w-full p-2 border rounded" value={form.ninea || ''} onChange={e => setForm({...form, ninea: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RCCM</label>
          <input type="text" className="w-full p-2 border rounded" value={form.rccm || ''} onChange={e => setForm({...form, rccm: e.target.value})} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Adresse *</label>
          <input type="text" required className="w-full p-2 border rounded" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input type="text" className="w-full p-2 border rounded" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="col-span-2 mt-4">
          <label className="block text-sm font-medium mb-1">Cachet de l'entreprise (Image/PNG/JPG)</label>
          <div className="flex items-center space-x-4">
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'stamp_image_url')} className="w-full p-2 border rounded" />
            {form.stamp_image_url && (
              <img src={form.stamp_image_url} alt="Cachet" className="h-16 w-16 object-contain border p-1 rounded" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Le cachet sera automatiquement apposé sur vos factures.</p>
        </div>
        <button type="submit" disabled={loading} className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-4">
          {loading ? 'Enregistrement...' : 'Sauvegarder les paramètres'}
        </button>
      </form>
    </div>
  );
}