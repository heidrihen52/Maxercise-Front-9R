import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Warning, Eye } from '@phosphor-icons/react';
import logoCompleto from '../assets/logoCompleto.png';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError('');

    // Formato de email estricto
    const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(form.email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      const { user, profile } = await login(form.email, form.password);
      // Redirect based on role and whether it's a newly registered user
      if (user.role === 'SUPER') {
        navigate('/admin');
      } else {
        if (localStorage.getItem('mx_is_new_user') === 'true') {
          localStorage.removeItem('mx_is_new_user');
          navigate('/questionnaire');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logoCompleto} alt="Maxercise" className="auth-logo-img" />
          
        </div>
        <h2 className="auth-title">Bienvenido de nuevo</h2>
        <p className="auth-subtitle">Inicia sesión para continuar tu entrenamiento</p>
        {error && <div className="auth-error"><Warning size={15} weight="fill" /> {error}</div>}
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="tu@correo.com" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
            <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >¿Olvidaste tu contraseña?</Link>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión →'}
          </button>
        </form>
        <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link></p>
        <div className="auth-divider"><span>o</span></div>
        <Link to="/preview" className="btn btn-ghost btn-full">
          <Eye size={15} weight="bold" /> Vista previa sin cuenta
        </Link>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', captcha: '' });
  const [captchaA] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(Math.floor(Math.random() * 10) + 1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Verificación Humana (frontend validation)
    if (parseInt(form.captcha, 10) !== captchaA + captchaB) {
      setError('La suma de verificación humana es incorrecta.');
      return;
    }

    // Formato de email estricto
    const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(form.email)) {
      setError('Por favor, ingresa un correo electrónico válido (ej. usuario@dominio.com)');
      return;
    }

    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (!/[A-Z]/.test(form.password)) { setError('La contraseña debe tener al menos una letra mayúscula'); return; }
    if (!/[0-9]/.test(form.password)) { setError('La contraseña debe tener al menos un número'); return; }
    if (!/[^a-zA-Z0-9]/.test(form.password)) { setError('La contraseña debe tener al menos un carácter especial'); return; }
    
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.captcha, captchaA + captchaB);
      
      const successMessage = data.message || 'Cuenta creada exitosamente.';
      
      // Mostrar alerta explícita en el navegador
      window.alert(successMessage);
      
      // Set a flag so we know to show the questionnaire on first login
      localStorage.setItem('mx_is_new_user', 'true');
      
      // Redirigir directamente al login
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logoCompleto} alt="Maxercise" className="auth-logo-img" />
          <div className="auth-logo-tagline">consúltalo, aplícalo, maximízalo</div>
        </div>
        <h2 className="auth-title">Crea tu cuenta</h2>
        <p className="auth-subtitle">Comienza gratis y personaliza tu experiencia</p>
        {error && <div className="auth-error"><Warning size={15} weight="fill" /> {error}</div>}
        <form onSubmit={handle} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" type="text" placeholder="Tu nombre" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="tu@correo.com" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="Mín. 6 caracteres, 1 mayúscula, 1 número, 1 especial" required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input className="form-input" type="password" placeholder="Repite tu contraseña" required value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Verificación humana: ¿Cuánto es {captchaA} + {captchaB}?</label>
              <input className="form-input" type="number" placeholder="Resultado" required value={form.captcha} onChange={e => setForm(p => ({...p, captcha: e.target.value}))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta y comenzar →'}
            </button>
          </form>
        <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </div>
    </div>
  );
}
