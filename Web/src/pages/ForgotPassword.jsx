import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Warning, EnvelopeSimple, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import logoCompleto from '../assets/logoCompleto.png';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { forgotPassword } = useAuth();

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSent(true);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
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

        {!sent ? (
          <>
            <h2 className="auth-title">Recuperar contraseña</h2>
            <p className="auth-subtitle">Te enviaremos instrucciones a tu correo</p>
            {error && <div className="auth-error"><Warning size={15} weight="fill" /> {error}</div>}
            <form onSubmit={handle} className="auth-form">
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                <EnvelopeSimple size={16} weight="bold" />
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle size={36} style={{ color: '#22c55e' }} weight="fill" />
            </div>
            <h2 className="auth-title">Correo enviado</h2>
            <p className="auth-subtitle">
              Si <strong>{email}</strong> tiene una cuenta, recibirás las instrucciones para restablecer tu contraseña.
            </p>
            {previewUrl && (
              <div className="alert-banner info" style={{ marginTop: '1rem', textAlign: 'left' }}>
                <strong>🔬 Modo desarrollo:</strong> Ve el correo simulado aquí:<br />
                <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                  {previewUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} weight="bold" /> Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
