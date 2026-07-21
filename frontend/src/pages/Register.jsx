import { useState } from 'react';
import { register } from '../api';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/login', { replace: true });
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
        <p className="auth-eyebrow">Bắt đầu hành trình</p>
        <h1>Tạo tài khoản</h1>
        <p className="auth-subtitle">Đăng ký để lưu và quản lý chuyến đi của bạn.</p>
        {error && <div className="auth-alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Họ và tên
            <input name="full_name" placeholder="Nguyễn Văn An" value={form.full_name} onChange={handleChange} autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="ban@example.com" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label>
            Mật khẩu
            <input name="password" type="password" minLength="6" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={handleChange} autoComplete="new-password" required />
          </label>
          <label>
            Xác nhận mật khẩu
            <input name="confirmPassword" type="password" minLength="6" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
          </label>
          <button type="submit" disabled={submitting}>{submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button>
        </form>
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
