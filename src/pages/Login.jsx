import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/appointments');
    } catch {
      toast.error('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    display: 'block', width: '100%', padding: '10px 12px',
    border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 6,
    fontSize: 14, outline: 'none',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff', padding: '2.5rem', borderRadius: 12,
          width: 360, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40 }}>⚖️</div>
          <h2 style={{ marginTop: 8, fontSize: 22 }}>FontanellaApp</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Gestión de Citas Legales</p>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
        <input
          type="email" required value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="abogado@estudio.com"
          style={inp}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginTop: '1rem' }}>
          Contraseña
        </label>
        <input
          type="password" required value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          style={inp}
        />

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '11px', marginTop: '1.5rem',
            background: loading ? '#94a3b8' : '#0f172a',
            color: '#fff', border: 'none', borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: 14,
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: '1rem' }}>
          Demo: usá cualquier email de abogado del seed SQL
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: '0.5rem' }}>
          ¿Sos cliente? <a href="/client-login" style={{ color: '#3b82f6' }}>Ingresá acá</a>
        </p>
      </form>
    </div>
  );
}
