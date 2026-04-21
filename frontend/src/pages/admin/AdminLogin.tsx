import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-box">
        <div className="admin-login-logo serif">ДОМ СОЮЗОВ</div>
        <div className="admin-login-title mono">ADMIN · CMS</div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="field">
            <label className="mono">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label className="mono">ПАРОЛЬ / PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" className="btn solid" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'ВХОД...' : 'ВОЙТИ →'}
          </button>
        </form>
      </div>
    </div>
  );
}
