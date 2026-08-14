import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Warning, LockKey, CheckCircle } from '@phosphor-icons/react';
import logoCompleto from '../assets/logoCompleto.png';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) setError('Token inválido o expirado. Solicita un nuevo enlace.');
  }, [token]);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (!/[A-Z]/.test(form.password)) { setError('La contraseña debe tener al menos una mayúscula'); return; }
    if (!/[^a-zA-Z0-9]/.test(form.password)) { setError('La contraseña debe tener al menos un carácter especial'); return; }
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle size={36} style={{ color: '#22c55e' }} weight="fill" />
            </div>
            <h2 className="auth-title">¡Contraseña actualizada!</h2>
            <p className="auth-subtitle">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <LockKey size={28} style={{ color: 'var(--accent-primary)' }} weight="fill" />
            </div>
            <h2 className="auth-title">Nueva contraseña</h2>
            <p className="auth-subtitle">Elige una contraseña segura para tu cuenta</p>
            {error && <div className="auth-error"><Warning size={15} weight="fill" /> {error}</div>}
            {!token ? null : (
              <form onSubmit={handle} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Nueva contraseña</label>
                  <input className="form-input" type="password" placeholder="Mín. 6 caracteres" required
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar contraseña</label>
                  <input className="form-input" type="password" placeholder="Repite la contraseña" required
                    value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar contraseña →'}
                </button>
              </form>
            )}
          </>
        )}

        <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
          <Link to="/login">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
