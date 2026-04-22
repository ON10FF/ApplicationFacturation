import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from '../components/InvoicePDF';
import { calculateHash } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Download, CheckCircle, Clock } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    
    if (data) setInvoices(data);
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="bg-white p-6 shadow rounded">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mes Factures</h2>
        <Link to="/invoices/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          + Nouvelle facture
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border-b">N° Facture</th>
              <th className="p-3 border-b">Client</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Montant (TTC)</th>
              <th className="p-3 border-b">Statut</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 border-b">
                <td className="p-3 font-medium text-gray-800">{inv.number || 'Brouillon'}</td>
                <td className="p-3">{inv.clients?.name || 'Inconnu'}</td>
                <td className="p-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="p-3">{inv.total_ttc} FCFA</td>
                <td className="p-3">
                  {inv.status === 'issued' ? (
                    <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1"/> Émise</span>
                  ) : (
                    <span className="flex items-center text-yellow-600"><Clock className="w-4 h-4 mr-1"/> Brouillon</span>
                  )}
                </td>
                <td className="p-3 flex space-x-3">
                  {inv.pdf_url && (
                    <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Télécharger">
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">Aucune facture trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
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