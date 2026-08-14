import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Barbell, List, X, House, Heart, SignOut,
  CaretDown, User, Notebook, Moon, Sun, ShieldCheck, ClipboardText
} from '@phosphor-icons/react';
import logoHeader from '../../assets/logoHeader.png';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './Header.css';

const navItems = [
  {
    label: 'Ejercicios', to: '/exercises',
    icon: <Barbell size={16} weight="bold" />,
    sub: [
      { label: 'Todos los ejercicios', to: '/exercises' },
      { label: 'Tren superior', to: '/exercises?area=upper' },
      { label: 'Tren inferior', to: '/exercises?area=lower' },
      { label: 'Core & Abdomen', to: '/exercises?area=core' },
      { label: 'Cardio', to: '/exercises?area=cardio' },
    ],
  },
  {
    label: 'Rutinas', to: '/routines',
    icon: <Notebook size={16} weight="bold" />,
    sub: [
      { label: 'Todas las rutinas', to: '/routines' },
      { label: 'Principiante', to: '/routines?level=beginner' },
      { label: 'Intermedio', to: '/routines?level=intermediate' },
      { label: 'Avanzado', to: '/routines?level=advanced' },
      { label: 'Movilidad', to: '/routines?cat=mobility' },
    ],
  },
  { label: 'Favoritos', to: '/favorites', icon: <Heart size={16} weight="bold" /> },
];

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { favorites } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const headerRef = useRef(null);
  const favCount = (favorites.exercises?.length || 0) + (favorites.routines?.length || 0);

  // Tema oscuro
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('mx_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('mx_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('mx_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  useEffect(() => {
    const handleClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (to) => location.pathname === to;
  const isAdminView = currentUser?.role === 'SUPER' && location.pathname !== '/admin';

  useEffect(() => {
    if (isAdminView) {
      document.body.classList.add('admin-banner-active');
    } else {
      document.body.classList.remove('admin-banner-active');
    }
    return () => {
      document.body.classList.remove('admin-banner-active');
    };
  }, [isAdminView]);

  return (
    <>
      {isAdminView && (
        <div className="admin-view-banner">
          <span>Modo Administrador: Estás en la vista de usuario</span>
          <Link to="/admin" className="admin-banner-btn">
            <ShieldCheck size={14} weight="bold" /> Volver al Panel Admin
          </Link>
        </div>
      )}
      <header className="header" ref={headerRef}>
        <div className="header-inner container">
          <Link to={currentUser ? '/home' : '/'} className="header-logo">
            <img src={logoHeader} alt="Maxercise" className="logo-img" />
            <span className="logo-text">maxercise</span>
          </Link>

          {currentUser && (
            <nav className="header-nav hide-mobile">
              {navItems.map(item => (
                <div
                  key={item.label}
                  className="nav-item-wrap"
                  onMouseEnter={() => item.sub && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link to={item.to} className={`nav-link ${isActive(item.to) ? 'active' : ''}`}>
                    {item.icon}
                    {item.label}
                    {item.sub && <CaretDown size={12} weight="bold" />}
                    {item.label === 'Favoritos' && favCount > 0 && (
                      <span className="fav-badge">{favCount}</span>
                    )}
                  </Link>
                  {item.sub && activeDropdown === item.label && (
                    <div className="nav-dropdown">
                      {item.sub.map(s => (
                        <Link key={s.to} to={s.to} className="dropdown-item">{s.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}

          <div className="header-actions">
            <button
              className="btn btn-icon"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{ marginRight: '8px' }}
            >
              {isDark ? <Sun size={20} weight="fill" /> : <Moon size={20} weight="fill" />}
            </button>

            {currentUser ? (
              <div className="user-menu-wrap" onClick={() => setUserDropdown(p => !p)}>
                <div className="user-avatar">{currentUser.name?.[0]?.toUpperCase() || <User size={18} />}</div>
                <span className="user-name hide-mobile">{currentUser.name}</span>
                <CaretDown size={12} weight="bold" />
                {userDropdown && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar large">{currentUser.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="font-semibold">{currentUser.name}</div>
                        <div className="text-sm text-muted">{currentUser.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/home" className="dropdown-item"><House size={16} /> Inicio</Link>
                    <Link to="/questionnaire" className="dropdown-item"><ClipboardText size={16} /> Mi Perfil Físico</Link>
                    <Link to="/favorites" className="dropdown-item"><Heart size={16} /> Mis favoritos</Link>
                    {currentUser.role === 'SUPER' && (
                      <Link to="/admin" className="dropdown-item"><ShieldCheck size={16} /> Panel de Administrador</Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item danger">
                      <SignOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
              </>
            )}

            {currentUser && (
              <button
                className="hamburger hide-desktop"
                onClick={() => setMobileOpen(p => !p)}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu rendered OUTSIDE header to avoid backdrop-filter stacking context */}
      {currentUser && mobileOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <div key={item.label}>
              <Link to={item.to} className="mobile-link">{item.icon} {item.label}</Link>
              {item.sub && item.sub.map(s => (
                <Link key={s.to} to={s.to} className="mobile-sub-link">{s.label}</Link>
              ))}
            </div>
          ))}
          <Link to="/questionnaire" className="mobile-link"><ClipboardText size={16} /> Mi Perfil Físico</Link>
          {currentUser.role === 'SUPER' && (
            <Link to="/admin" className="mobile-link"><ShieldCheck size={16} /> Panel de Administrador</Link>
          )}
          <button onClick={handleLogout} className="mobile-link danger">
            <SignOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </>
  );
}

