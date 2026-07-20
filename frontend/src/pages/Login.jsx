import { useState } from 'react';
import { login } from '../api';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(form);
      onLogin(data);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/">Lavel</Link>
      <div className="auth-card">
        <p className="auth-eyebrow">Chào mừng trở lại</p>
        <h1>Đăng nhập</h1>
        <p className="auth-subtitle">Tiếp tục khám phá những hành trình tuyệt vời.</p>
        {error && <div className="auth-alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input name="email" type="email" placeholder="ban@example.com" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label>
            Mật khẩu
            <input name="password" type="password" placeholder="Nhập mật khẩu" value={form.password} onChange={handleChange} autoComplete="current-password" required />
          </label>
          <button type="submit" disabled={submitting}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>
        <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
}
