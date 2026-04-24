import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from '../components/InvoicePDF';
import { calculateHash } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Download, CheckCircle, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (activeCompany) {
      fetchInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [activeCompany]);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name)')
      .eq('company_id', activeCompany.id)
      .order('created_at', { ascending: false });
    
    if (data) setInvoices(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;
    
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
    } else {
      setInvoices(invoices.filter(inv => inv.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedIds.length} factures sélectionnées ?`)) return;

    const { error } = await supabase.from('invoices').delete().in('id', selectedIds);
    if (error) {
      alert("Erreur lors de la suppression groupée : " + error.message);
    } else {
      setInvoices(invoices.filter(inv => !selectedIds.includes(inv.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map(inv => inv.id));
    }
  };

  if (!activeCompany) {
    return (
      <div className="bg-white p-12 shadow rounded text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Aucune entreprise sélectionnée</h2>
        <p className="text-gray-600 mb-6">Veuillez sélectionner une entreprise dans l'onglet "Mes Entreprises" pour voir ses factures.</p>
        <Link to="/companies" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Gérer mes entreprises
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-center">Chargement des factures...</div>;

  return (
    <div className="bg-white p-4 md:p-6 shadow rounded-xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Factures : {activeCompany.name}</h2>
          <p className="text-sm text-gray-500">{invoices.length} facture(s) trouvée(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="bg-red-50 text-red-600 px-3 py-2 text-sm rounded-lg border border-red-200 hover:bg-red-100 transition flex items-center">
              <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer ({selectedIds.length})
            </button>
          )}
          <Link to="/invoices/create" className="flex-1 md:flex-none text-center bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition font-medium">
            + Nouvelle facture
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 border-b w-10">
                  <input type="checkbox" checked={selectedIds.length === invoices.length && invoices.length > 0} onChange={toggleSelectAll} className="rounded" />
                </th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider">N° Facture</th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider">Client</th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider">Montant</th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider">Statut</th>
                <th className="p-3 border-b text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(inv.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.includes(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded" />
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{inv.number || 'Brouillon'}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{new Date(inv.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{inv.clients?.name || 'Inconnu'}</td>
                  <td className="p-3 text-sm text-gray-600 hidden sm:table-cell">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-semibold text-gray-900">{inv.total_ttc.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">FCFA</span></td>
                  <td className="p-3">
                    {inv.status === 'issued' ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        Émise
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {inv.pdf_url && (
                        <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500">
                    <p className="text-lg font-medium text-gray-400">Aucune facture trouvée</p>
                    <Link to="/invoices/create" className="text-blue-600 hover:underline mt-2 inline-block">Créer votre première facture</Link>
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
export const issueInvoice = async (invoiceDraftId, companyData, clientData, lines) => {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Obtenir le prochain numéro de facture via RPC (nouveau numéro à chaque tentative)
      const { data: invoiceNumber, error: rpcError } = await supabase
        .rpc('get_next_document_number', { p_user_id: user.id, p_doc_type: 'invoice' });

      if (rpcError) throw rpcError;

      // 2. Préparer les données finales
      const issueDate = new Date().toISOString();
      const invoiceData = { ...companyData, client: clientData, lines, number: invoiceNumber, issueDate };

      // 3. Générer le PDF côté client
      const pdfBlob = await pdf(<InvoiceTemplate data={invoiceData} />).toBlob();

      // 4. Calculer le hash SHA-256 (preuve d'intégrité)
      const hash = await calculateHash(pdfBlob);

      // 5. Uploader sur Supabase Storage
      const fileName = `${user.id}/${invoiceNumber}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('factures')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });

      if (uploadError) throw uploadError;

      const pdfUrl = supabase.storage.from('factures').getPublicUrl(fileName).data.publicUrl;

      // 6. Mettre à jour la base de données (Figer la facture)
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'issued',
          number: invoiceNumber,
          issue_date: issueDate,
          pdf_url: pdfUrl,
          pdf_hash: hash,
        })
        .eq('id', invoiceDraftId);

      if (updateError) {
        // Conflit de numéro (duplicate key) → on réessaie avec un nouveau numéro
        const isDuplicateKey = updateError.code === '23505' || updateError.message?.includes('duplicate key');
        if (isDuplicateKey && attempt < MAX_RETRIES) {
          console.warn(`Conflit de numéro détecté (tentative ${attempt}/${MAX_RETRIES}), nouvel essai...`);
          await new Promise(r => setTimeout(r, 300 * attempt)); // attente progressive
          continue;
        }
        throw updateError;
      }

      return { success: true, invoiceNumber };

    } catch (error) {
      const isDuplicateKey = error?.code === '23505' || error?.message?.includes('duplicate key');
      if (isDuplicateKey && attempt < MAX_RETRIES) {
        console.warn(`Conflit de numéro (tentative ${attempt}/${MAX_RETRIES}), nouvel essai...`);
        await new Promise(r => setTimeout(r, 300 * attempt));
        continue;
      }
      console.error("Erreur lors de l'émission :", error);
      return { success: false, error };
    }
  }

  return { success: false, error: { message: `Impossible d'émettre la facture après ${MAX_RETRIES} tentatives (conflit de numéro persistant).` } };
}