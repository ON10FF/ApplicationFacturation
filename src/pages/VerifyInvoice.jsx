import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function VerifyInvoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function verify() {
      // Appel de la fonction bypassant la RLS sécurisée
      const { data, error } = await supabase.rpc('verify_invoice_public', { p_invoice_id: id });
      if (!error) setData(data);
    }
    verify();
  }, [id]);

  if (!data) return <p>Vérification en cours...</p>;
  if (!data.is_authentic) return <p>Facture introuvable ou non valide.</p>;

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl text-green-600 font-bold">✓ Facture Authentique</h1>
      <p>Émetteur : {data.company_name} (NINEA: {data.company_ninea})</p>
      <p>Client : {data.client_name}</p>
      <p>Numéro : {data.number}</p>
      <p>Montant TTC : {data.total_ttc} FCFA</p>
    </div>
  );
}