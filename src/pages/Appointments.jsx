import { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import luxonPlugin from '@fullcalendar/luxon3';

const STATUS_COLOR = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#22c55e',
  CANCELLED: '#ef4444',
  COMPLETED: '#8b5cf6',
  NO_SHOW:   '#f97316',
};

const STATUS_LABEL = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW:   'No se presentó',
};

export default function Appointments() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [lawyers,   setLawyers]   = useState([]);
  // Por defecto filtra por el abogado logueado
  const [filters,   setFilters]   = useState({ lawyer_id: user?.id || '', status: '' });
  const [selected,  setSelected]  = useState(null);
  const [events,    setEvents]    = useState([]);
  const [dateRange, setDateRange] = useState(null);

  // Timezone del abogado logueado — FullCalendar lo usa para mostrar los slots
  const userTimezone = user?.timezone || 'local';

  useEffect(() => {
    api.get('/lawyers').then(r => setLawyers(r.data));
  }, []);

  useEffect(() => {
    if (!dateRange) return;

    api.get('/appointments', {
      params: {
        lawyer_id: filters.lawyer_id || undefined,
        status:    filters.status    || undefined,
        from:      dateRange.from,
        to:        dateRange.to,
      },
    })
    .then(({ data }) => {
      setEvents(
        data.map(a => ({
          id:              String(a.appointment_id),
          title:           `${a.client_name} · ${a.type_label}`,
          // Las fechas ya vienen como ISO con Z desde el backend
          start:           a.starts_at_utc,
          end:             a.ends_at_utc,
          backgroundColor: STATUS_COLOR[a.status],
          borderColor:     STATUS_COLOR[a.status],
          extendedProps:   a,
        }))
      );
    })
    .catch(err => console.error('Error cargando citas:', err));
  }, [filters, dateRange]);

  const handleDatesSet = useCallback(({ startStr, endStr }) => {
    setDateRange({ from: startStr, to: endStr });
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success(`Estado → ${STATUS_LABEL[status]}`);
      setSelected(null);
      setDateRange(prev => prev ? { ...prev } : prev);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: 20 }}>📅 Agenda de Citas</h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>🌍 {userTimezone}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filters.lawyer_id}
            onChange={e => setFilters(f => ({ ...f, lawyer_id: e.target.value }))}
            style={selStyle}
          >
            <option value="">Todos los abogados</option>
            {lawyers.map(l => (
              <option key={l.lawyer_id} value={l.lawyer_id}>{l.full_name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            style={selStyle}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button onClick={() => navigate('/appointments/new')} style={btnPrimary}>
            + Nueva cita
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[k], display: 'inline-block' }} />
            {v}
          </span>
        ))}
      </div>

      {/* Calendario */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
        <FullCalendar
          key={userTimezone}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          locale="es"
          timeZone={userTimezone}
          events={events}
          datesSet={handleDatesSet}
          eventClick={({ event }) => setSelected(event.extendedProps)}
          height="70vh"
          slotMinTime="07:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          nowIndicator
        />
      </div>

      {/* Modal detalle */}
      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 16 }}>{selected.client_name}</h3>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: STATUS_COLOR[selected.status] + '22',
                color: STATUS_COLOR[selected.status],
              }}>
                {STATUS_LABEL[selected.status]}
              </span>
            </div>

            <Row label="Abogado"  value={selected.lawyer_name} />
            <Row label="Tipo"     value={selected.type_label} />
            <Row label="Inicio"   value={fmtDate(selected.starts_at_utc, selected.lawyer_timezone)} />
            <Row label="Fin"      value={fmtDate(selected.ends_at_utc,   selected.lawyer_timezone)} />
            <Row label="Timezone" value={selected.lawyer_timezone} />
            {selected.notes && <Row label="Notas" value={selected.notes} />}

            <div style={{ marginTop: '1.25rem' }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Cambiar estado:</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_LABEL)
                  .filter(([k]) => k !== selected.status)
                  .map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleStatusChange(selected.appointment_id, k)}
                      style={{
                        padding: '5px 10px', fontSize: 11, border: 'none', borderRadius: 4,
                        background: STATUS_COLOR[k], color: '#fff', cursor: 'pointer',
                      }}
                    >
                      {v}
                    </button>
                  ))}
              </div>
            </div>

            <button onClick={() => setSelected(null)} style={{ ...btnSecondary, marginTop: '1rem', width: '100%' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: '#64748b', minWidth: 80 }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function fmtDate(utcStr, timezone) {
  // utcStr puede venir como ISO con Z o sin Z — normalizamos
  const normalized = utcStr.endsWith('Z') ? utcStr : utcStr.replace(' ', 'T') + 'Z';
  const dt = DateTime.fromISO(normalized).setZone(timezone || 'UTC');
  return dt.toFormat("dd/MM/yyyy HH:mm") + ` (${dt.offsetNameShort})`;
}

const selStyle     = { padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 };
const btnPrimary   = { padding: '7px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const btnSecondary = { padding: '7px 16px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const overlay      = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal        = { background: '#fff', padding: '1.75rem', borderRadius: 10, width: 420, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.3)' };
