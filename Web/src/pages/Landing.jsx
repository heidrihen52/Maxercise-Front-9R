import { Link } from 'react-router-dom';
import {
  Target, Barbell, ClipboardText, Heart, Warning, MagnifyingGlass,
  Trophy, PencilSimple, Brain, RocketLaunch
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const features = [
  { icon: <Target size={32} weight="duotone" color="var(--blue-primary)" />, title: 'Personalizado para ti', desc: 'Te hacemos preguntas sobre tu cuerpo, condición física y restricciones para mostrarte solo lo que puedes hacer.' },
  { icon: <Barbell size={32} weight="duotone" color="var(--blue-primary)" />, title: '57+ Ejercicios', desc: 'Biblioteca completa con ejercicios para todos los grupos musculares, niveles y tipos de equipo.' },
  { icon: <ClipboardText size={32} weight="duotone" color="var(--blue-primary)" />, title: '25 Rutinas estructuradas', desc: 'Rutinas completas diseñadas por expertos para principiantes, intermedios y avanzados.' },
  { icon: <Heart size={32} weight="duotone" color="var(--blue-primary)" />, title: 'Guarda tus favoritos', desc: 'Colecciona los ejercicios y rutinas que más te gustan para acceder rápidamente.' },
  { icon: <Warning size={32} weight="duotone" color="var(--danger)" />, title: 'Ejercicio seguro', desc: 'Filtramos el contenido según tus condiciones médicas y te alertamos de posibles riesgos.' },
  { icon: <MagnifyingGlass size={32} weight="duotone" color="var(--blue-primary)" />, title: 'Filtros inteligentes', desc: 'Filtra por músculo, área corporal, dificultad y más para encontrar justo lo que necesitas.' },
];

const stats = [
  { num: '57+', label: 'Ejercicios' },
  { num: '25', label: 'Rutinas' },
  { num: '100%', label: 'Personalizado' },
  { num: '0', label: 'Costo' },
];

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon" style={{display:'flex',alignItems:'center'}}><Barbell size={28} weight="fill" color="var(--blue-primary)"/></span>
            <span className="landing-logo-text">maxercise</span>
          </div>
          <div className="landing-nav-links">
            {currentUser ? (
              <Link to="/home" className="btn btn-primary btn-sm">Ir al app →</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Empezar gratis</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero bg-gradient-hero">
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => <div key={i} className="particle" style={{ '--i': i }} />)}
        </div>
        <div className="container hero-content">
          <div className="hero-badge"><Trophy size={16} weight="fill" style={{marginRight:'6px'}}/> Tu entrenador inteligente</div>
          <h1 className="hero-title">
            Entrena<br />
            <span className="hero-gradient-text">inteligente.</span>
          </h1>
          <p className="hero-subtitle">
            consúltalo, aplícalo, maximízalo
          </p>
          <p className="hero-desc">
            Rutinas y ejercicios personalizados según tu cuerpo, condición física y objetivos.
            Siempre seguros, siempre efectivos.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-xl hero-cta-main">
              Comenzar ahora →
            </Link>
            <Link to="/login" className="btn btn-xl hero-cta-sec">
              Ya tengo cuenta
            </Link>
          </div>
          <div className="hero-stats">
            {stats.map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Todo lo que necesitas</h2>
            <p className="section-subtitle">Una plataforma completa para alcanzar tus objetivos de forma segura</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section bg-mesh">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">¿Cómo funciona?</h2>
            <p className="section-subtitle">Simple, rápido y completamente personalizado</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'01', icon:<PencilSimple size={28} weight="duotone" color="var(--blue-primary)"/>, t:'Crea tu cuenta', d:'Regístrate en segundos y responde un cuestionario visual sobre ti.' },
              { n:'02', icon:<Brain size={28} weight="duotone" color="var(--blue-primary)"/>, t:'Análisis inteligente', d:'Procesamos tus respuestas para filtrar contenido seguro y adecuado.' },
              { n:'03', icon:<Barbell size={28} weight="duotone" color="var(--blue-primary)"/>, t:'Entrena con confianza', d:'Accede a ejercicios y rutinas perfectas para tu perfil físico.' },
              { n:'04', icon:<Heart size={28} weight="duotone" color="var(--blue-primary)"/>, t:'Guarda lo que te gusta', d:'Colecciona tus favoritos y vuelve a ellos cuando quieras.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section bg-gradient-hero">
        <div className="container cta-inner">
          <h2>¿Listo para maximizar tu entrenamiento?</h2>
          <p>Regístrate gratis y comienza hoy mismo. Sin tarjeta de crédito, sin compromisos.</p>
          <Link to="/register" className="btn btn-xl cta-btn">
            <RocketLaunch size={22} weight="bold" /> Comenzar gratis ahora
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon" style={{display:'flex',alignItems:'center'}}><Barbell size={24} weight="fill" color="var(--blue-primary)"/></span>
            <span className="landing-logo-text">maxercise</span>
          </div>
          <p className="footer-tagline">consúltalo, aplícalo, maximízalo</p>
          <p className="footer-copy">© 2025 Maxercise. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
