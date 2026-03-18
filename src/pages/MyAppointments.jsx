import { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

export default function MyAppointments() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [events,     setEvents]     = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [dateRange,  setDateRange]  = useState(null);

  const userTimezone = user?.timezone || 'local';

  useEffect(() => {
    if (!dateRange) return;
    api.get('/appointments', {
      params: { from: dateRange.from, to: dateRange.to },
    })
    .then(({ data }) => {
      setEvents(data.map(a => ({
        id:              String(a.appointment_id),
        title:           `${a.lawyer_name} · ${a.type_label}`,
        start:           a.starts_at_utc,
        end:             a.ends_at_utc,
        backgroundColor: STATUS_COLOR[a.status],
        borderColor:     STATUS_COLOR[a.status],
        extendedProps:   a,
      })));
    })
    .catch(err => console.error(err));
  }, [dateRange]);

  const handleDatesSet = useCallback(({ startStr, endStr }) => {
    setDateRange({ from: startStr, to: endStr });
  }, []);

  const handleLogout = () => { logout(); navigate('/client-login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: '#0f2744', color: '#fff',
        padding: '0 2rem', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚖️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Mis Citas</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.name} · {userTimezone}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid #334155',
          color: '#94a3b8', padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12,
        }}>
          Salir
        </button>
      </header>

      {/* Leyenda */}
      <div style={{ padding: '1rem 2rem 0', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[k], display: 'inline-block' }} />
            {v}
          </span>
        ))}
      </div>

      {/* Calendario */}
      <div style={{ padding: '1rem 2rem' }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            locale="es"
            timeZone={userTimezone}
            events={events}
            datesSet={handleDatesSet}
            eventClick={({ event }) => setSelected(event.extendedProps)}
            height="75vh"
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            nowIndicator
            editable={false}
            selectable={false}
          />
        </div>
      </div>

      {/* Modal detalle — read only */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: '#fff', padding: '1.75rem', borderRadius: 10, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 16 }}>Detalle de cita</h3>
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

            <button
              onClick={() => setSelected(null)}
              style={{ width: '100%', marginTop: '1.25rem', padding: '9px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
            >
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
  const normalized = utcStr.endsWith('Z') ? utcStr : utcStr.replace(' ', 'T') + 'Z';
  const dt = DateTime.fromISO(normalized).setZone(timezone || 'UTC');
  return dt.toFormat("dd/MM/yyyy HH:mm") + ` (${dt.offsetNameShort})`;
}
