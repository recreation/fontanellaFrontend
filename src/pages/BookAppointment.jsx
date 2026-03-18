import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = {
  lawyer_id: '', client_id: '', appointment_type_id: '',
  date: '', start_time: '', notes: '',
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [types,   setTypes]   = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [duration, setDuration] = useState(30);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    api.get('/lawyers').then(r => setLawyers(r.data));
    api.get('/clients').then(r => setClients(r.data));
    // appointment_type directo de DB (podés agregar /api/appointment-types si querés)
    setTypes([
      { appointment_type_id: 1, label: 'Presencial',   code: 'IN_PERSON', default_duration_min: 60 },
      { appointment_type_id: 2, label: 'Videollamada', code: 'VIDEO',     default_duration_min: 30 },
      { appointment_type_id: 3, label: 'Telefónica',   code: 'PHONE',     default_duration_min: 20 },
    ]);
  }, []);

  const handleTypeChange = (e) => {
    const t = types.find(t => t.appointment_type_id == e.target.value);
    setForm(f => ({ ...f, appointment_type_id: e.target.value }));
    if (t) setDuration(t.default_duration_min);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Obtener timezone del abogado seleccionado
      const lawyer = lawyers.find(l => l.lawyer_id == form.lawyer_id);
      const tz = lawyer?.timezone || 'UTC';

      // Interpretar la hora ingresada en la timezone del abogado y convertir a UTC
      const startsLocal = DateTime.fromISO(`${form.date}T${form.start_time}:00`, { zone: tz });
      const endsLocal   = startsLocal.plus({ minutes: duration });

      if (!startsLocal.isValid) {
        toast.error('Fecha u hora inválida');
        return;
      }

      const fmt = (dt) => dt.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");

      await api.post('/appointments', {
        lawyer_id:           +form.lawyer_id,
        client_id:           +form.client_id,
        appointment_type_id: +form.appointment_type_id,
        starts_at_utc:       fmt(startsLocal),
        ends_at_utc:         fmt(endsLocal),
        notes:               form.notes || null,
      });

      toast.success('Cita creada correctamente');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    display: 'block', width: '100%', padding: '9px 12px',
    border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14,
  };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/appointments')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>←</button>
        <h2 style={{ fontSize: 20 }}>📝 Nueva Cita</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff', padding: '2rem', borderRadius: 10,
          maxWidth: 580, boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        }}
      >
        {/* Abogado */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={lbl}>Abogado *</label>
          <select required value={form.lawyer_id} onChange={e => setForm(f => ({ ...f, lawyer_id: e.target.value }))} style={inp}>
            <option value="">Seleccionar abogado...</option>
            {lawyers.map(l => (
              <option key={l.lawyer_id} value={l.lawyer_id}>
                {l.full_name} — {l.office_name} ({l.timezone})
              </option>
            ))}
          </select>
        </div>

        {/* Cliente */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={lbl}>Cliente *</label>
          <select required value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={inp}>
            <option value="">Seleccionar cliente...</option>
            {clients.map(c => (
              <option key={c.client_id} value={c.client_id}>
                {c.full_name} — {c.email}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={lbl}>Tipo de cita *</label>
          <select required value={form.appointment_type_id} onChange={handleTypeChange} style={inp}>
            <option value="">Seleccionar tipo...</option>
            {types.map(t => (
              <option key={t.appointment_type_id} value={t.appointment_type_id}>
                {t.label} ({t.default_duration_min} min)
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y hora */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={lbl}>Fecha *</label>
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>
              Hora *
              {form.lawyer_id && (
                <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 6 }}>
                  ({lawyers.find(l => l.lawyer_id == form.lawyer_id)?.timezone || 'UTC'})
                </span>
              )}
            </label>
            <input type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inp} />
          </div>
        </div>

        {/* Duración */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Duración: <b>{duration} minutos</b></label>
          <input
            type="range" min={15} max={120} step={15} value={duration}
            onChange={e => setDuration(+e.target.value)}
            style={{ width: '100%', accentColor: '#0f172a' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            <span>15 min</span><span>120 min</span>
          </div>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={lbl}>Notas</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3} placeholder="Motivo de la consulta, referencias, etc."
            style={{ ...inp, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit" disabled={loading}
            style={{
              flex: 1, padding: '11px', background: loading ? '#94a3b8' : '#0f172a',
              color: '#fff', border: 'none', borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600,
            }}
          >
            {loading ? 'Guardando...' : 'Confirmar cita'}
          </button>
          <button
            type="button" onClick={() => navigate('/appointments')}
            style={{ padding: '11px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
