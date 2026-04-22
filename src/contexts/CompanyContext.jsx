import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CompanyContext = createContext({});

export const CompanyProvider = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompanyState] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCompanies = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const list = data || [];
    setCompanies(list);

    // Restaurer l'entreprise active depuis localStorage
    const savedId = localStorage.getItem(`activeCompany_${user.id}`);
    const found = list.find(c => c.id === savedId);
    if (found) {
      setActiveCompanyState(found);
    } else if (list.length > 0) {
      // Par défaut : première entreprise
      setActiveCompanyState(list[0]);
      localStorage.setItem(`activeCompany_${user.id}`, list[0].id);
    } else {
      setActiveCompanyState(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshCompanies();
  }, [refreshCompanies]);

  const setActiveCompany = (company) => {
    setActiveCompanyState(company);
    if (user && company) {
      localStorage.setItem(`activeCompany_${user.id}`, company.id);
    }
  };

  return (
    <CompanyContext.Provider value={{ companies, activeCompany, setActiveCompany, refreshCompanies, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => useContext(CompanyContext);
