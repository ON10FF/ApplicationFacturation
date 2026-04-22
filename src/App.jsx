import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import VerifyInvoice from './pages/VerifyInvoice';

import { CompanyProvider } from './contexts/CompanyContext';
import Companies from './pages/Companies';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify/:id" element={<VerifyInvoice />} />
      
      {/* Routes protégées */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/invoices/create" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );
}