import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { full_name: '', email: '', phone_number: '', country_code: '', timezone: 'America/Argentina/Buenos_Aires' };

const TIMEZONES = [
  'America/Argentina/Buenos_Aires','America/Mexico_City','America/Bogota',
  'America/Santiago','America/Lima','America/Caracas','America/Montevideo',
  'America/Asuncion','Europe/Madrid','UTC',
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search,  setSearch]  = useState('');

  const load = () => api.get('/clients', { params: { search } }).then(r => setClients(r.data));

  useEffect(() => { load(); }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/clients/${editing}`, form); toast.success('Cliente actualizado'); }
      else         { await api.post('/clients', form);           toast.success('Cliente creado'); }
      setForm(EMPTY); setEditing(null); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (c) => {
    setEditing(c.client_id);
    setForm({ full_name: c.full_name, email: c.email, phone_number: c.phone_number || '', country_code: c.country_code || '', timezone: c.timezone });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try { await api.delete(`/clients/${id}`); toast.success('Eliminado'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const inp = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 12 };

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: '1.25rem' }}>👤 Clientes</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Lista */}
        <div>
          <input
            placeholder="🔍 Buscar por nombre, email o teléfono..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, marginBottom: '1rem', padding: '9px 12px' }}
          />
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {['Nombre / Email', 'Teléfono', 'País', 'Timezone', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Sin resultados</td></tr>
                )}
                {clients.map(c => (
                  <tr key={c.client_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.full_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12 }}>{c.phone_number || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12 }}>{c.country_code || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#64748b' }}>{c.timezone}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 4 }}>✏️</button>
                      <button onClick={() => handleDelete(c.client_id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} style={{ background: '#fff', padding: '1.5rem', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h3 style={{ fontSize: 15 }}>{editing ? 'Editar' : 'Nuevo'} Cliente</h3>

          <label style={lbl}>Nombre completo *</label>
          <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inp} />

          <label style={lbl}>Email *</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />

          <label style={lbl}>Teléfono</label>
          <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} style={inp} placeholder="+54 9 11 1234-5678" />

          <label style={lbl}>Código de país (ISO)</label>
          <input value={form.country_code} onChange={e => setForm(f => ({ ...f, country_code: e.target.value.toUpperCase() }))} style={inp} placeholder="AR" maxLength={2} />

          <label style={lbl}>Timezone *</label>
          <select required value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} style={inp}>
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
            <button type="submit" style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }}
                style={{ padding: '9px 14px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
