import { Link, Navigate, useNavigate } from 'react-router-dom';

export default function Cart({ cart, session, onQuantityChange, onLogout }) {
  const navigate = useNavigate();
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role === 'admin') return <Navigate to="/admin" replace />;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="traveloka-shell">
      <nav className="navbar"><Link className="brand" to="/"><span className="brand-word"><b>La</b>vel</span><small>TRAVEL &amp; TOURS</small></Link><div className="nav-auth"><span className="user-chip" title={session.user.full_name || session.user.email}><i>{(session.user.full_name || session.user.email).charAt(0).toUpperCase()}</i><span>{session.user.full_name || session.user.email}</span></span><button className="auth-btn" onClick={onLogout}>Đăng xuất</button></div></nav>
      <div className="admin-heading"><div><p className="eyebrow">Chuyến đi đã chọn</p><h1>Giỏ hàng</h1></div><Link className="secondary-button" to="/">Tiếp tục xem tour</Link></div>
      {cart.length === 0 ? <div className="empty-cart"><h2>Giỏ hàng đang trống</h2><p>Hãy khám phá và thêm tour bạn yêu thích.</p><Link className="primary-link" to="/">Khám phá tour</Link></div> : (
        <div className="cart-layout"><div className="admin-list">{cart.map((item) => (
          <article className="admin-tour-row cart-tour-card" key={item.id} role="link" tabIndex="0" onClick={() => navigate(`/tour/${item.id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/tour/${item.id}`); }}>
            <div><strong>{item.title}</strong><p>{item.price.toLocaleString('vi-VN')} VND / tour</p></div>
            <div className="cart-guest-control" onClick={(event) => event.stopPropagation()}><small>Số khách</small><div className="quantity-control"><button onClick={() => onQuantityChange(item, item.quantity - 1)}>−</button><span>{item.quantity}</span><button disabled={item.quantity >= item.max_group_size} onClick={() => onQuantityChange(item, item.quantity + 1)}>+</button></div><small>Tối đa {item.max_group_size}</small></div>
          </article>
        ))}</div><aside className="cart-summary"><span>Tổng thanh toán</span><strong>{total.toLocaleString('vi-VN')} VND</strong><button>Tiến hành đặt tour</button></aside></div>
      )}
    </div>
  );
}
