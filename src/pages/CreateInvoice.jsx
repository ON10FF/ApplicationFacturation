import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import SignaturePad from '../components/SignaturePad';
import { issueInvoice } from './Invoices';
import { useAuth } from '../contexts/AuthContext';

export default function CreateInvoice() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [lines, setLines] = useState([{ product_name: '', quantity: 1, price_ht: 0 }]);
  const[isPaid, setIsPaid] = useState(false);
  const [signature, setSignature] = useState(null);
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
    let ht = 0;
    lines.forEach(l => ht += l.quantity * l.price_ht);
    const tva = ht * 0.18; // 18% TVA Sénégal
    return { ht, tva, ttc: ht + tva };
  };

  const handleIssue = async () => {
    if (!selectedClient) return alert('Veuillez sélectionner un client.');
    const totals = calculateTotals();
    const client = clients.find(c => c.id === selectedClient);

    const { data: companyData } = await supabase.from('companies').select('*').eq('user_id', user.id).single();
    if (!companyData) {
      return alert('Veuillez configurer votre entreprise dans les paramètres avant de générer une facture.');
    }

    const formattedLines = lines.map(l => ({
      ...l,
      total_ht: l.quantity * l.price_ht,
      total_ttc: (l.quantity * l.price_ht) * 1.18
    }));

    const invoiceDraftData = {
      user_id: user.id,
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
      return alert("Erreur lors de la création du brouillon : " + draftError.message);
    }

    const pdfDataProps = {
      company: companyData,
      total_ht: totals.ht,
      total_vat: totals.tva,
      total_ttc: totals.ttc,
      is_paid: isPaid,
      paid_amount: isPaid ? totals.ttc : 0,
      paid_date: isPaid ? new Date().toISOString() : null,
      payment_method: 'Espèces',
      signature_data_url: signature,
    };

    const result = await issueInvoice(draft.id, pdfDataProps, client, formattedLines);
    if (!result.success) {
      return alert("Erreur lors de l'émission : " + result.error.message);
    }
    
    alert("Facture prête à être émise avec un total TTC de : " + totals.ttc + " FCFA. Numéro : " + result.invoiceNumber);
    navigate('/invoices');
  };

  return (
    <div className="max-w-4xl bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Créer une facture</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Client</label>
        <select className="w-full border p-2 rounded" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
          <option value="">Sélectionner un client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Lignes de facture</h3>
        {lines.map((line, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input type="text" placeholder="Désignation" className="border p-2 flex-1 rounded"
              value={line.product_name} onChange={e => handleLineChange(index, 'product_name', e.target.value)} />
            <input type="number" placeholder="Qté" className="border p-2 w-20 rounded"
              value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} />
            <input type="number" placeholder="PU HT (FCFA)" className="border p-2 w-32 rounded"
              value={line.price_ht} onChange={e => handleLineChange(index, 'price_ht', Number(e.target.value))} />
          </div>
        ))}
        <button onClick={() => setLines([...lines, { product_name: '', quantity: 1, price_ht: 0 }])} className="text-blue-500 text-sm mt-2">+ Ajouter une ligne</button>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-6 text-right">
        <p>Total HT: {calculateTotals().ht} FCFA</p>
        <p>TVA (18%): {calculateTotals().tva} FCFA</p>
        <p className="text-xl font-bold text-blue-700">Total TTC: {calculateTotals().ttc} FCFA</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="flex items-center space-x-2 cursor-pointer mb-2">
            <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
            <span className="font-medium">Marquer comme payé au comptant</span>
          </label>
        </div>
        <SignaturePad onSave={setSignature} />
      </div>

      <button onClick={handleIssue} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg">
        Générer et Émettre la Facture
      </button>
    </div>
  );
}