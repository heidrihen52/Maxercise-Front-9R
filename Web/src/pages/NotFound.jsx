import { Link, useLocation } from 'react-router-dom';
import { House, Barbell, ArrowLeft, MagnifyingGlass, SignIn, PencilSimple, SquaresFour, ClipboardText, Heart, Eye } from '@phosphor-icons/react';

export default function NotFound() {
  const location = useLocation();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Animated 404 */}
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 12rem)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1rem',
        animation: 'pulse 2s infinite',
        fontFamily: 'var(--font-primary)',
      }}>
        404
      </div>

      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <MagnifyingGlass size={36} style={{ color: 'var(--text-muted)' }} />
      </div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
      }}>
        Página no encontrada
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        maxWidth: 420,
        marginBottom: '2.5rem',
        lineHeight: 1.6,
      }}>
        La ruta <code style={{
          background: 'var(--glass-bg)',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.95rem',
          color: 'var(--accent-primary)',
        }}>{location.pathname}</code> no existe en Maxercise.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <House size={18} weight="fill" /> Ir al inicio
        </Link>
        <Link to="/home" className="btn btn-secondary">
          <Barbell size={18} weight="bold" /> Mi entrenamiento
        </Link>
        <button className="btn btn-ghost" onClick={() => window.history.back()}>
          <ArrowLeft size={18} weight="bold" /> Volver
        </button>
      </div>

      {/* Sitemap section */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem 2rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: 500,
        width: '100%',
      }}>
        <h2 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Mapa del sitio
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {[
            { to: '/', label: 'Inicio', icon: <House size={16} /> },
            { to: '/login', label: 'Iniciar sesión', icon: <SignIn size={16} /> },
            { to: '/register', label: 'Registro', icon: <PencilSimple size={16} /> },
            { to: '/home', label: 'Dashboard', icon: <SquaresFour size={16} /> },
            { to: '/exercises', label: 'Ejercicios', icon: <Barbell size={16} /> },
            { to: '/routines', label: 'Rutinas', icon: <ClipboardText size={16} /> },
            { to: '/favorites', label: 'Favoritos', icon: <Heart size={16} /> },
            { to: '/preview', label: 'Vista previa', icon: <Eye size={16} /> },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
