import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import SignaturePad from '../components/SignaturePad';
import { issueInvoice } from './Invoices';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { Building2, AlertTriangle } from 'lucide-react';

export default function CreateInvoice() {
  const { user } = useAuth();
  const { activeCompany } = useCompany();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [lines, setLines] = useState([{ product_name: '', quantity: 1, price_ttc: 0 }]);
  const [isPaid, setIsPaid] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('clients').select('*').then(({ data }) => setClients(data ||[]));
  },[]);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const calculateTotals = () => {
    // Le prix unitaire est TTC : la taxe est déjà incluse, on ne l'ajoute pas.
    let ttc = 0;
    lines.forEach(l => ttc += l.quantity * l.price_ttc);
    return { ht: ttc, tva: 0, ttc };
  };

  const handleIssue = async () => {
    // Garde anti-double-clic : on bloque dès le premier appel
    if (isSubmitting) return;
    if (!selectedClient) return alert('Veuillez sélectionner un client.');

    setIsSubmitting(true);
    let draftId = null;

    try {
      const totals = calculateTotals();
      const client = clients.find(c => c.id === selectedClient);

      if (!activeCompany) {
        alert("Veuillez sélectionner une entreprise active avant de générer une facture.");
        return;
      }

      const formattedLines = lines.map(l => ({
        ...l,
        price_ht: l.price_ttc,   // alias pour compatibilité avec InvoicePDF
        total_ht: l.quantity * l.price_ttc,
        total_ttc: l.quantity * l.price_ttc,
      }));

      const invoiceDraftData = {
        user_id: user.id,
        company_id: activeCompany.id,
        client_id: client.id,
        total_ht: totals.ht,
        total_vat: totals.tva,
        total_ttc: totals.ttc,
        is_paid: isPaid,
        status: 'draft',
      };

      const { data: draft, error: draftError } = await supabase
        .from('invoices')
        .insert(invoiceDraftData)
        .select('id')
        .single();

      if (draftError) {
        console.error('Erreur Supabase (Création brouillon):', draftError);
        alert("Erreur lors de la création du brouillon : " + draftError.message);
        return;
      }

      draftId = draft.id;

      const pdfDataProps = {
        company: activeCompany,
        total_ht: totals.ht,
        total_vat: totals.tva,
        total_ttc: totals.ttc,
        is_paid: isPaid,
        paid_amount: isPaid ? totals.ttc : 0,
        paid_date: isPaid ? new Date().toISOString() : null,
        payment_method: 'Espèces',
        signature_data_url: signature,
      };

      const result = await issueInvoice(draftId, pdfDataProps, client, formattedLines);
      if (!result.success) {
        // Supprimer le brouillon orphelin pour éviter les doublons futurs
        await supabase.from('invoices').delete().eq('id', draftId);
        alert("Erreur lors de l'émission : " + (result.error?.message || 'Erreur inconnue'));
        return;
      }

      alert(`Facture émise avec succès !\nTotal TTC : ${totals.ttc} FCFA\nNuméro : ${result.invoiceNumber}`);
      navigate('/invoices');
    } finally {
      // Toujours débloquer le bouton à la fin (succès ou erreur)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 shadow rounded-xl">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Créer une facture</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1.5 text-gray-700">Client</label>
        <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
          value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
          <option value="">Sélectionner un client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-800 flex items-center justify-between">
          Lignes de facture
          <span className="text-xs font-normal text-gray-500 hidden sm:inline">Prix unitaires TTC</span>
        </h3>
        <div className="space-y-4 sm:space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-2 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg border sm:border-0 border-gray-100">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 sm:hidden">Désignation</label>
                <input type="text" placeholder="Désignation" className="w-full border border-gray-300 p-2 rounded-lg text-sm"
                  value={line.product_name} onChange={e => handleLineChange(index, 'product_name', e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="w-1/3 sm:w-20">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 sm:hidden">Qté</label>
                  <input type="number" placeholder="Qté" className="w-full border border-gray-300 p-2 rounded-lg text-sm text-center"
                    value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} />
                </div>
                <div className="flex-1 sm:w-32">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 sm:hidden">PU TTC (FCFA)</label>
                  <input type="number" placeholder="PU TTC" className="w-full border border-gray-300 p-2 rounded-lg text-sm text-right"
                    value={line.price_ttc} onChange={e => handleLineChange(index, 'price_ttc', Number(e.target.value))} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setLines([...lines, { product_name: '', quantity: 1, price_ttc: 0 }])} 
          className="w-full sm:w-auto text-blue-600 text-sm mt-4 font-medium flex items-center justify-center hover:bg-blue-50 px-4 py-2 rounded-lg transition"
        >
          + Ajouter une ligne
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-xs text-blue-600 italic">Prix unitaire = TTC (taxe déjà incluse)</p>
        <p className="text-xl font-bold text-blue-700">Total TTC : {calculateTotals().ttc.toLocaleString()} FCFA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-6 h-6 text-green-600 rounded-md border-gray-300 focus:ring-green-500" />
            <div>
              <span className="font-bold text-gray-800 block">Payé au comptant</span>
              <span className="text-xs text-gray-500">Marquer la facture comme déjà réglée</span>
            </div>
          </label>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-medium mb-2 text-gray-700">Signature</label>
          <SignaturePad onSave={setSignature} />
        </div>
      </div>

      <button
        onClick={handleIssue}
        disabled={isSubmitting}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.98] ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 shadow-green-100 hover:shadow-green-200'
        }`}
      >
        {isSubmitting ? '⏳ Génération en cours...' : 'Générer et Émettre la Facture'}
      </button>
    </div>
  );
}