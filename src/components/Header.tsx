import { LogOut, MapPinned } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/mapa', label: 'Vista de mapa' },
  { to: '/instituciones', label: 'Instituciones' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/estudiantes', label: 'Estudiantes' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Header({ activePage }: { activePage: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    navigate('/login/estudiante');
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <MapPinned size={20} strokeWidth={2.5} />
        </div>
        <span>El Salvador EduMap</span>
      </div>

      <nav className="topnav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `topnav-link ${isActive || activePage === item.to.slice(1) ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-actions">
        <div className="avatar-menu">
          <button
            className="avatar-button"
            aria-label="Abrir menú de cuenta"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>AM</span>
          </button>
          {menuOpen && (
            <div className="avatar-dropdown">
              <button className="dropdown-item logout-item" type="button" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
