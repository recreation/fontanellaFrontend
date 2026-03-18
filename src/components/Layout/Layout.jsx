import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/appointments', icon: '📅', label: 'Agenda' },
  { to: '/lawyers',      icon: '👨‍⚖️', label: 'Abogados' },
  { to: '/clients',      icon: '👤', label: 'Clientes' },
  { to: '/offices',      icon: '🏢', label: 'Oficinas' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 230, background: '#0f172a', color: '#f1f5f9',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>⚖️ FontanellaApp</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{user?.office}</div>
        </div>

        {/* User */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 1.5rem',
                color: isActive ? '#38bdf8' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                fontSize: 14, transition: 'all .15s',
              })}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            margin: '1rem', padding: '9px', background: '#1e293b',
            color: '#94a3b8', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontSize: 13,
          }}
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}
