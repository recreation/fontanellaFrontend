import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import ClientLogin from './pages/ClientLogin';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Lawyers from './pages/Lawyers';
import Clients from './pages/Clients';
import Offices from './pages/Offices';
import MyAppointments from './pages/MyAppointments';

// Solo abogados
function LawyerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'lawyer') return <Navigate to="/my-appointments" replace />;
  return children;
}

// Solo clientes
function ClientRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/client-login" replace />;
  if (user.role !== 'client') return <Navigate to="/appointments" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Logins */}
          <Route path="/login"        element={<Login />} />
          <Route path="/client-login" element={<ClientLogin />} />

          {/* Portal cliente */}
          <Route path="/my-appointments" element={
            <ClientRoute><MyAppointments /></ClientRoute>
          } />

          {/* Portal abogado */}
          <Route path="/" element={
            <LawyerRoute><Layout /></LawyerRoute>
          }>
            <Route index element={<Navigate to="/appointments" replace />} />
            <Route path="appointments"     element={<Appointments />} />
            <Route path="appointments/new" element={<BookAppointment />} />
            <Route path="lawyers"          element={<Lawyers />} />
            <Route path="clients"          element={<Clients />} />
            <Route path="offices"          element={<Offices />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
