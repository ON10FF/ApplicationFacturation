import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const[email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Vous pouvez vous connecter.");
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isLogin ? 'Connexion' : 'Inscription'} - Facturation SN
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-2 border rounded"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" required className="w-full p-2 border rounded"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-blue-500 mt-4 underline">
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}