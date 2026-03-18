import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ClientLogin() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/client-login', { email });
      login(data.token, data.user);
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    display: 'block', width: '100%', padding: '10px 12px',
    border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 6, fontSize: 14,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: '2.5rem', borderRadius: 12,
        width: 360, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40 }}>👤</div>
          <h2 style={{ marginTop: 8, fontSize: 22 }}>Portal Clientes</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Consultá tus citas agendadas</p>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Tu email</label>
        <input
          type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          style={inp}
        />

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '11px', marginTop: '1.5rem',
          background: loading ? '#94a3b8' : '#1e3a5f',
          color: '#fff', border: 'none', borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          {loading ? 'Ingresando...' : 'Ver mis citas'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: '1.5rem' }}>
          ¿Sos abogado?{' '}
          <Link to="/login" style={{ color: '#3b82f6' }}>Ingresá acá</Link>
        </p>
      </form>
    </div>
  );
}
