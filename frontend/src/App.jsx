import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import { addCartItem, fetchCart, fetchHeroSetting, fetchTours, removeCartItem, resolveMediaUrl, updateCartItem } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import TourDetail from './pages/TourDetail';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import { destinationGroups } from './data/destinations';

const DEFAULT_TOUR_IMAGE = '/uploads/default-travel-hero.png';

function Navbar({ session, cartCount, onLogout }) {
  return (
    <>
      <nav className="navbar">
        <Link className="brand" to="/"><span className="brand-word"><b>La</b>vel</span><small>TRAVEL &amp; TOURS</small></Link>
        <div className="nav-links service-nav">
          <a href="#tours">Tour</a><a href="#destinations">Điểm đến</a><a href="#offers">Ưu đãi</a>
          {session?.user.role === 'admin' && <Link to="/admin">Quản trị</Link>}
        </div>
        <div className="nav-auth">
          {session && session.user.role !== 'admin' && <Link className="cart-link" to="/cart"><span className="cart-icon">◇</span><span>Giỏ hàng</span><b>{cartCount}</b></Link>}
          {session ? (
            <>
              <span className="user-chip" title={session.user.full_name || session.user.email}><i>{(session.user.full_name || session.user.email).charAt(0).toUpperCase()}</i><span>{session.user.full_name || session.user.email}</span></span>
              <button className="auth-btn" onClick={onLogout}>Đăng xuất</button>
            </>
          ) : <Link className="auth-btn" to="/login">Tài khoản</Link>}
        </div>
      </nav>
    </>
  );
}

function Home({ session, cartCount, onLogout }) {
  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    fetchTours()
      .then(setTours)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchHeroSetting().then((data) => setHeroImage(data.hero_image_url)).catch(() => {});
  }, []);

  const filteredTours = tours.filter((tour) => {
    const keyword = searchTerm.trim().toLocaleLowerCase('vi');
    if (!keyword) return true;
    return `${tour.title} ${tour.location || ''}`.toLocaleLowerCase('vi').includes(keyword);
  });
  const destinations = [...new Set(tours.map((tour) => tour.location).filter(Boolean))].slice(0, 6);

  return (
    <div className="traveloka-shell">
      <Navbar session={session} cartCount={cartCount} onLogout={onLogout} />
      <header className="booking-hero" style={heroImage ? { backgroundImage: `linear-gradient(90deg, rgba(5,35,48,.76), rgba(5,35,48,.12)), url(${resolveMediaUrl(heroImage)})` } : undefined}>
        <div className="booking-copy">
          <span className="hero-kicker">KHÁM PHÁ VIỆT NAM</span>
          <h1>Trải nghiệm kỳ nghỉ<br />tuyệt vời</h1>
          <p>Tour chọn lọc · Dịch vụ tận tâm · Giá tốt mỗi ngày</p>
        </div>
        <div className="floating-search">
          <div className="search-tabs"><button className="active">✈ Tour du lịch</button></div>
          <form className="booking-search" onSubmit={(event) => { event.preventDefault(); setSearchTerm(search); document.querySelector('#tours')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <label><span>Điểm đến</span><div>⌖<select value={search} onChange={(event) => setSearch(event.target.value)}><option value="">Bạn muốn đi đâu?</option>{Object.entries(destinationGroups).map(([region, regionDestinations]) => <optgroup key={region} label={region}>{regionDestinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}</optgroup>)}</select></div></label>
            <label><span>Ngày khởi hành</span><div>□<input type="date" /></div></label>
            <label><span>Số khách</span><div>♙<input type="number" min="1" defaultValue="2" /></div></label>
            <button type="submit">Tìm tour</button>
          </form>
        </div>
      </header>

      <section id="offers" className="benefit-strip">
        <div><span>✓</span><p><strong>Giá tốt mỗi ngày</strong><small>Ưu đãi được chọn lọc</small></p></div>
        <div><span>♢</span><p><strong>Thanh toán an toàn</strong><small>Bảo mật và tiện lợi</small></p></div>
        <div><span>☎</span><p><strong>Tư vấn tận tâm</strong><small>Hỗ trợ xuyên suốt hành trình</small></p></div>
      </section>

      <main>
        {destinations.length > 0 && <section id="destinations" className="section destination-section">
          <div className="section-heading"><div><span>ĐIỂM ĐẾN NỔI BẬT</span><h2>Bạn muốn đi đâu?</h2><p>Lên rừng xuống biển. Trọn vẹn Việt Nam.</p></div></div>
          <div className="destination-grid">{destinations.map((destination, index) => {
            const destinationTour = tours.find((tour) => tour.location === destination && tour.media_type === 'image' && tour.media_url);
            const backgroundUrl = resolveMediaUrl(destinationTour?.media_url || DEFAULT_TOUR_IMAGE);
            return (
              <button
                key={destination}
                className={`destination-card destination-${index + 1}`}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(4,40,54,.08), rgba(3,39,52,.78)), url(${backgroundUrl})` }}
                onClick={() => { setSearch(destination); setSearchTerm(destination); document.querySelector('#tours')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span>Khám phá</span><strong>{destination}</strong><small>{tours.filter((tour) => tour.location === destination).length} tour</small>
              </button>
            );
          })}</div>
        </section>}

        <section id="tours" className="section feature-section">
          <div className="section-title">
            <div><span className="section-kicker">ƯU ĐÃI HÔM NAY</span><h2>Tour tốt nhất dành cho bạn</h2><p>Nhanh tay đặt ngay. Để mai sẽ lỡ.</p></div>
            {session?.user.role === 'admin' && <Link className="primary-link" to="/admin">Quản lý tour</Link>}
          </div>
          {loading ? <p className="loading">Đang tải tour...</p>
            : error ? <p className="error">{error}</p>
              : filteredTours.length === 0 ? <p>Không tìm thấy tour phù hợp với “{searchTerm}”.</p>
                : (
                  <div className="tour-grid">
                    {filteredTours.map((tour) => (
                      <Link key={tour.id} className="tour-card-link" to={`/tour/${tour.id}`} aria-label={`Xem chi tiết ${tour.title}`}>
                      <article className="tour-card">
                        <div className="tour-media">
                          {tour.media_type === 'video' && tour.media_url
                            ? <video src={resolveMediaUrl(tour.media_url)} muted loop autoPlay playsInline poster={resolveMediaUrl(DEFAULT_TOUR_IMAGE)} />
                            : <img src={resolveMediaUrl(tour.media_url || DEFAULT_TOUR_IMAGE)} onError={(event) => { event.currentTarget.src = resolveMediaUrl(DEFAULT_TOUR_IMAGE); }} alt={tour.title} />}
                        </div>
                        <div className="tour-card-top">
                          <span className="tour-tag">{tour.featured ? 'Ưu đãi nổi bật' : 'Tour chọn lọc'}</span>
                        </div>
                        <strong className="tour-title">{tour.title}</strong>
                        <p>{tour.description}</p>
                        <div className="tour-meta">
                          <span className="tour-location">📍 {tour.location || 'Đang cập nhật'}</span>
                          <span>▣ {tour.start_date ? new Date(`${tour.start_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Ngày đi đang cập nhật'}</span>
                          <span>◷ {tour.duration} ngày</span><span>♙ Tối đa {tour.max_group_size} khách</span>
                        </div>
                        <div className="tour-price"><small>Giá từ</small><strong>{tour.price.toLocaleString('vi-VN')}₫</strong><span>/ khách</span></div>
                      </article>
                      </Link>
                    ))}
                  </div>
                )}
        </section>
      </main>
    </div>
  );
}

function AdminRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('travel_session')); } catch { return null; }
  });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (session?.access_token && session.user.role !== 'admin') {
      fetchCart(session.access_token).then(setCart).catch(() => setCart([]));
    } else {
      setCart([]);
    }
  }, [session]);

  const handleLogin = (data) => {
    localStorage.setItem('travel_session', JSON.stringify(data));
    setSession(data);
  };
  const handleLogout = () => {
    localStorage.removeItem('travel_session');
    setSession(null);
  };
  const addToCart = async (tour, quantity = 1) => {
    if (!session) {
      window.location.assign('/login');
      return false;
    }
    try {
      const updated = await addCartItem(tour.id, quantity, session.access_token);
      setCart((prev) => {
        const exists = prev.some((item) => item.cart_item_id === updated.cart_item_id);
        return exists ? prev.map((item) => item.cart_item_id === updated.cart_item_id ? updated : item) : [...prev, updated];
      });
      return true;
    } catch (error) {
      window.alert(error.message);
      return false;
    }
  };
  const changeCartQuantity = async (item, quantity) => {
    try {
      if (quantity < 1) {
        await removeCartItem(item.cart_item_id, session.access_token);
        setCart((prev) => prev.filter((entry) => entry.cart_item_id !== item.cart_item_id));
      } else {
        const updated = await updateCartItem(item.cart_item_id, quantity, session.access_token);
        setCart((prev) => prev.map((entry) => entry.cart_item_id === updated.cart_item_id ? updated : entry));
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home session={session} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tour/:id" element={<TourDetail session={session} onAddToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} session={session} onQuantityChange={changeCartQuantity} onLogout={handleLogout} />} />
        <Route path="/admin" element={
          <AdminRoute session={session}>
            <AdminDashboard session={session} onLogout={handleLogout} />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
