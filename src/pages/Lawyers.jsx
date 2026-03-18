import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { office_id: '', full_name: '', email: '', phone_number: '', timezone: 'America/Argentina/Buenos_Aires' };

const TIMEZONES = [
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/Bogota',
  'America/Santiago',
  'America/Lima',
  'America/Caracas',
  'America/Montevideo',
  'America/Asuncion',
  'Europe/Madrid',
  'UTC',
];

export default function Lawyers() {
  const [lawyers,  setLawyers]  = useState([]);
  const [offices,  setOffices]  = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [search,   setSearch]   = useState('');

  const load = () => api.get('/lawyers').then(r => setLawyers(r.data));

  useEffect(() => {
    load();
    api.get('/offices').then(r => setOffices(r.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/lawyers/${editing}`, form);
        toast.success('Abogado actualizado');
      } else {
        await api.post('/lawyers', form);
        toast.success('Abogado creado');
      }
      setForm(EMPTY); setEditing(null); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (l) => {
    setEditing(l.lawyer_id);
    setForm({ office_id: l.office_id, full_name: l.full_name, email: l.email, phone_number: l.phone_number || '', timezone: l.timezone });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este abogado?')) return;
    try {
      await api.delete(`/lawyers/${id}`);
      toast.success('Eliminado');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const filtered = lawyers.filter(l =>
    l.full_name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const inp = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 12 };

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: '1.25rem' }}>👨‍⚖️ Abogados</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Lista */}
        <div>
          <input
            placeholder="🔍 Buscar por nombre o email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, marginBottom: '1rem', padding: '9px 12px' }}
          />
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {['Nombre / Email', 'Oficina', 'Timezone', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Sin resultados</td></tr>
                )}
                {filtered.map(l => (
                  <tr key={l.lawyer_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.full_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{l.email}</div>
                      {l.phone_number && <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.phone_number}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13 }}>
                      <div>{l.office_name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.country_name}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>{l.timezone}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => handleEdit(l)} style={iconBtn('#3b82f6')}>✏️</button>
                      <button onClick={() => handleDelete(l.lawyer_id)} style={iconBtn('#ef4444')}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} style={{ background: '#fff', padding: '1.5rem', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h3 style={{ fontSize: 15, marginBottom: '0.25rem' }}>{editing ? 'Editar' : 'Nuevo'} Abogado</h3>

          <label style={lbl}>Nombre completo *</label>
          <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inp} />

          <label style={lbl}>Email *</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />

          <label style={lbl}>Teléfono</label>
          <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} style={inp} placeholder="+54 11 1234-5678" />

          <label style={lbl}>Timezone *</label>
          <select required value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} style={inp}>
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>

          <label style={lbl}>Oficina *</label>
          <select required value={form.office_id} onChange={e => setForm(f => ({ ...f, office_id: e.target.value }))} style={inp}>
            <option value="">Seleccionar...</option>
            {offices.map(o => (
              <option key={o.office_id} value={o.office_id}>{o.name} ({o.country_name})</option>
            ))}
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

const iconBtn = (color) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px 6px', borderRadius: 4, fontSize: 14,
  marginRight: 4,
});
