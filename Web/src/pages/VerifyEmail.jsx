import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no proporcionado.');
      return;
    }

    fetch(`/api/auth/verify/${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setStatus('success');
          setMessage(data.message || 'Cuenta verificada exitosamente.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar la cuenta.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error de red al intentar verificar la cuenta.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2 className="auth-title">Verificación de Cuenta</h2>
        
        {status === 'loading' && (
          <div style={{ margin: '2rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ margin: '2rem 0' }}>
            <CheckCircle size={64} weight="fill" color="var(--accent-primary)" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{message}</p>
            <Link to="/login" className="btn btn-primary mt-4" style={{ display: 'inline-block' }}>
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ margin: '2rem 0' }}>
            <Warning size={64} weight="fill" color="#f59e0b" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{message}</p>
            <Link to="/login" className="btn btn-secondary mt-4" style={{ display: 'inline-block' }}>
              Volver a Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
