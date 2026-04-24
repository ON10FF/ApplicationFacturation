import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { Building2, PlusCircle, CheckCircle, Pencil, X, Upload } from 'lucide-react';

const EMPTY_FORM = { name: '', ninea: '', rccm: '', address: '', phone: '', email: '', stamp_image_url: '', logo_url: '' };

export default function Companies() {
  const { user } = useAuth();
  const { companies, activeCompany, setActiveCompany, refreshCompanies } = useCompany();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (company) => {
    setEditingId(company.id);
    setForm({ ...EMPTY_FORM, ...company });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(field);
    const ext = file.name.split('.').pop();
    const path = `companies/${user.id}_${field}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('factures').upload(path, file, { upsert: true });
    if (error) { alert('Erreur upload : ' + error.message); setUploading(''); return; }
    const { data } = supabase.storage.from('factures').getPublicUrl(path);
    setForm(f => ({ ...f, [field]: data.publicUrl }));
    setUploading('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Le nom est obligatoire.');
    setSaving(true);

    const payload = {
      name: form.name,
      ninea: form.ninea,
      rccm: form.rccm,
      address: form.address,
      phone: form.phone,
      email: form.email,
      stamp_image_url: form.stamp_image_url,
      logo_url: form.logo_url,
      user_id: user.id,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('companies').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('companies').insert([payload]));
    }

    setSaving(false);
    if (error) { alert('Erreur : ' + error.message); return; }
    await refreshCompanies();
    closeForm();
  };

  const handleActivate = (company) => {
    setActiveCompany(company);
  };

  return (
    <div className="max-w-5xl">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Entreprises</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos entreprises et sélectionnez celle active pour la facturation.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
        >
          <PlusCircle className="w-4 h-4" /> Nouvelle entreprise
        </button>
      </div>

      {/* Alerte aucune entreprise */}
      {companies.length === 0 && !showForm && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-6 text-center">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-amber-400" />
          <p className="font-semibold">Aucune entreprise enregistrée.</p>
          <p className="text-sm mt-1">Créez votre première entreprise pour commencer à générer des factures.</p>
        </div>
      )}

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {companies.map((company) => {
          const isActive = activeCompany?.id === company.id;
          return (
            <div key={company.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-5 transition-all ${isActive ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded border p-1" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg leading-tight">{company.name}</h2>
                    {company.ninea && <p className="text-xs text-gray-500">NINEA: {company.ninea}</p>}
                  </div>
                </div>
                {isActive && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {company.address && <p>📍 {company.address}</p>}
                {company.phone && <p>📞 {company.phone}</p>}
                {company.email && <p>✉️ {company.email}</p>}
                {company.rccm && <p className="text-xs text-gray-400">RCCM: {company.rccm}</p>}
              </div>

              {company.stamp_image_url && (
                <div className="mt-3">
                  <img src={company.stamp_image_url} alt="Cachet" className="h-14 object-contain border rounded p-1" />
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {!isActive && (
                  <button
                    onClick={() => handleActivate(company)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition font-medium"
                  >
                    Définir comme active
                  </button>
                )}
                <button
                  onClick={() => openEdit(company)}
                  className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 px-3 rounded-lg transition"
                >
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire création / modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Raison Sociale *</label>
                <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">NINEA</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.ninea} onChange={e => setForm(f => ({ ...f, ninea: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">RCCM</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.rccm} onChange={e => setForm(f => ({ ...f, rccm: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Adresse</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                <input type="email" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              {/* Upload Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Logo de l'entreprise</label>
                <div className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
                    <Upload className="w-4 h-4" />
                    {uploading === 'logo_url' ? 'Envoi...' : 'Choisir un fichier'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo_url')} />
                  </label>
                  {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-12 w-12 object-contain border bg-white rounded p-1" />}
                </div>
              </div>

              {/* Upload Cachet */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Cachet de l'entreprise</label>
                <div className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
                    <Upload className="w-4 h-4" />
                    {uploading === 'stamp_image_url' ? 'Envoi...' : 'Choisir un fichier'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'stamp_image_url')} />
                  </label>
                  {form.stamp_image_url && <img src={form.stamp_image_url} alt="Cachet" className="h-12 object-contain border bg-white rounded p-1" />}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeForm}
                  className="order-2 sm:order-1 flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="order-1 sm:order-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-bold disabled:opacity-50 shadow-lg shadow-blue-100">
                  {saving ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer l\'entreprise')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
