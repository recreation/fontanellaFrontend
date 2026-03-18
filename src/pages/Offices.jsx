import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY_OFFICE  = { country_id: '', name: '' };
const EMPTY_COUNTRY = { name: '', iso_code: '' };

export default function Offices() {
  const [offices,   setOffices]   = useState([]);
  const [countries, setCountries] = useState([]);
  const [officeForm,  setOfficeForm]  = useState(EMPTY_OFFICE);
  const [countryForm, setCountryForm] = useState(EMPTY_COUNTRY);
  const [editingOffice, setEditingOffice] = useState(null);
  const [tab, setTab] = useState('offices'); // 'offices' | 'countries'

  const loadOffices   = () => api.get('/offices').then(r => setOffices(r.data));
  const loadCountries = () => api.get('/offices/countries').then(r => setCountries(r.data));

  useEffect(() => { loadOffices(); loadCountries(); }, []);

  const handleSaveOffice = async (e) => {
    e.preventDefault();
    try {
      if (editingOffice) { await api.put(`/offices/${editingOffice}`, officeForm); toast.success('Actualizada'); }
      else               { await api.post('/offices', officeForm);                 toast.success('Creada'); }
      setOfficeForm(EMPTY_OFFICE); setEditingOffice(null); loadOffices();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/offices/countries', countryForm);
      toast.success('País creado');
      setCountryForm(EMPTY_COUNTRY); loadCountries();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDeleteOffice = async (id) => {
    if (!window.confirm('¿Eliminar esta oficina?')) return;
    try { await api.delete(`/offices/${id}`); toast.success('Eliminada'); loadOffices(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const inp = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 12 };

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: '1.25rem' }}>🏢 Oficinas y Países</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
        {[['offices', 'Oficinas'], ['countries', 'Países']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === key ? 700 : 400, fontSize: 14,
            borderBottom: tab === key ? '2px solid #0f172a' : '2px solid transparent',
            marginBottom: -2, color: tab === key ? '#0f172a' : '#64748b',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'offices' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Lista */}
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {['Oficina', 'País', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offices.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Sin oficinas</td></tr>
                )}
                {offices.map(o => (
                  <tr key={o.office_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13 }}>{o.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13 }}>
                      <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 7px', borderRadius: 10 }}>{o.iso_code}</span>
                      {' '}{o.country_name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => { setEditingOffice(o.office_id); setOfficeForm({ country_id: o.country_id, name: o.name }); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 4 }}>✏️</button>
                      <button onClick={() => handleDeleteOffice(o.office_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveOffice} style={{ background: '#fff', padding: '1.5rem', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: 15 }}>{editingOffice ? 'Editar' : 'Nueva'} Oficina</h3>

            <label style={lbl}>País *</label>
            <select required value={officeForm.country_id} onChange={e => setOfficeForm(f => ({ ...f, country_id: e.target.value }))} style={inp}>
              <option value="">Seleccionar país...</option>
              {countries.map(c => <option key={c.country_id} value={c.country_id}>{c.iso_code} — {c.name}</option>)}
            </select>

            <label style={lbl}>Nombre de la oficina *</label>
            <input required value={officeForm.name} onChange={e => setOfficeForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Ej: Estudio Buenos Aires Norte" />

            <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
              <button type="submit" style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                {editingOffice ? 'Actualizar' : 'Crear'}
              </button>
              {editingOffice && (
                <button type="button" onClick={() => { setEditingOffice(null); setOfficeForm(EMPTY_OFFICE); }}
                  style={{ padding: '9px 14px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {tab === 'countries' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Lista países */}
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {['ISO', 'País', 'Creado'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map(c => (
                  <tr key={c.country_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{c.iso_code}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form país */}
          <form onSubmit={handleSaveCountry} style={{ background: '#fff', padding: '1.5rem', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: 15 }}>Nuevo País</h3>

            <label style={lbl}>Nombre *</label>
            <input required value={countryForm.name} onChange={e => setCountryForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Ej: Uruguay" />

            <label style={lbl}>Código ISO (2 letras) *</label>
            <input required maxLength={2} value={countryForm.iso_code}
              onChange={e => setCountryForm(f => ({ ...f, iso_code: e.target.value.toUpperCase() }))}
              style={inp} placeholder="UY" />

            <button type="submit" style={{ width: '100%', marginTop: '1.25rem', padding: '9px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Crear País
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
