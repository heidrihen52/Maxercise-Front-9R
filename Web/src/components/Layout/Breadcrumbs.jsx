import { Link, useLocation } from 'react-router-dom';
import { House, Barbell, Notebook, Heart, Gear, ClipboardText, Eye } from '@phosphor-icons/react';
import './Breadcrumbs.css';

const routeLabels = {
  home: { label: 'Inicio', icon: <House size={13} weight="bold" /> },
  exercises: { label: 'Ejercicios', icon: <Barbell size={13} weight="bold" /> },
  routines: { label: 'Rutinas', icon: <Notebook size={13} weight="bold" /> },
  favorites: { label: 'Favoritos', icon: <Heart size={13} weight="bold" /> },
  admin: { label: 'Admin', icon: <Gear size={13} weight="bold" /> },
  questionnaire: { label: 'Cuestionario', icon: <ClipboardText size={13} weight="bold" /> },
  login: { label: 'Iniciar sesión', icon: null },
  register: { label: 'Registro', icon: null },
  preview: { label: 'Vista previa', icon: <Eye size={13} weight="bold" /> },
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  if (pathnames.length === 0 || pathnames[0] === '') return null;

  const renderLabel = (seg) => {
    const route = routeLabels[seg];
    if (!route) return seg;
    return <>{route.icon && <>{route.icon}{' '}</>}{route.label}</>;
  };

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <Link to="/home" className="bc-link"><House size={13} weight="bold" /> Inicio</Link>
      {pathnames.map((seg, idx) => {
        const to = '/' + pathnames.slice(0, idx + 1).join('/');
        const isLast = idx === pathnames.length - 1;
        return (
          <span key={to} className="bc-item">
            <span className="bc-sep">›</span>
            {isLast ? (
              <span className="bc-current">{renderLabel(seg)}</span>
            ) : (
              <Link to={to} className="bc-link">{renderLabel(seg)}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
