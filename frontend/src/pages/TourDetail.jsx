import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchTourById, resolveMediaUrl } from '../api';

const DEFAULT_TOUR_IMAGE = '/uploads/default-travel-hero.png';

export default function TourDetail({ session, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [guestCount, setGuestCount] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchTourById(id)
      .then(setTour)
      .catch((e) => setError(e.message));
  }, [id]);

  const addTour = async () => {
    setAdding(true);
    const success = await onAddToCart(tour, guestCount);
    setAdding(false);
    if (success) {
      setAdded(true);
      navigate('/cart');
    }
  };

  if (error) return <div className="page-state error">{error}</div>;
  if (!tour) return <div className="page-state loading">Đang tải chi tiết tour...</div>;

  return (
    <div className="traveloka-shell">
      <nav className="navbar"><Link className="brand" to="/"><span className="brand-word"><b>La</b>vel</span><small>TRAVEL &amp; TOURS</small></Link><Link className="secondary-button" to="/">← Quay lại</Link></nav>
      <div className="detail-breadcrumb"><Link to="/">Trang chủ</Link><span>›</span><Link to="/">Tour</Link><span>›</span><b>{tour.location || 'Chi tiết'}</b></div>
      <article className="tour-detail">
        <div className="detail-hero">
          <div className="detail-media">
            {tour.media_type === 'video' && tour.media_url
              ? <video src={resolveMediaUrl(tour.media_url)} controls playsInline poster={resolveMediaUrl(DEFAULT_TOUR_IMAGE)} />
              : <img src={resolveMediaUrl(tour.media_url || DEFAULT_TOUR_IMAGE)} onError={(event) => { event.currentTarget.src = resolveMediaUrl(DEFAULT_TOUR_IMAGE); }} alt={tour.title} />}
          </div>
          <div className="detail-hero-overlay">
            <span className="tour-tag">{tour.featured ? '★ Tour nổi bật' : 'Tour chọn lọc'}</span>
            <h1>{tour.title}</h1>
            <p>⌖ {tour.location || 'Địa điểm đang cập nhật'}</p>
          </div>
        </div>
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-intro">
              <span className="section-kicker">TỔNG QUAN HÀNH TRÌNH</span>
              <h2>Về chuyến đi này</h2>
              <p>{tour.description || 'Thông tin chi tiết về hành trình đang được cập nhật.'}</p>
            </section>
            <section className="trip-information">
              <h2>Thông tin chuyến đi</h2>
              <div className="detail-facts">
                <div><i className="fact-icon green">↗</i><span>Ngày khởi hành</span><strong>{tour.start_date ? new Date(`${tour.start_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</strong></div>
                <div><i className="fact-icon blue">✓</i><span>Ngày kết thúc</span><strong>{tour.end_date ? new Date(`${tour.end_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</strong></div>
                <div><i className="fact-icon aqua">◷</i><span>Thời lượng</span><strong>{tour.duration} ngày</strong></div>
                <div><i className="fact-icon sky">♙</i><span>Quy mô đoàn</span><strong>Tối đa {tour.max_group_size} khách</strong></div>
              </div>
            </section>
            <section className="detail-benefits">
              <h2>An tâm đặt tour cùng Lavel</h2>
              <div><span>✓</span><p><strong>Xác nhận nhanh chóng</strong><small>Thông tin đặt tour được xử lý minh bạch.</small></p></div>
              <div><span>✓</span><p><strong>Hỗ trợ tận tâm</strong><small>Đồng hành trước và trong suốt chuyến đi.</small></p></div>
            </section>
          </div>
          <aside className="detail-booking">
            <span className="booking-label">GIÁ TOUR MỖI KHÁCH</span>
            <div className="booking-price"><strong>{tour.price.toLocaleString('vi-VN')}₫</strong></div>
            <div className="booking-summary-row"><span>Điểm đến</span><b>{tour.location || 'Đang cập nhật'}</b></div>
            <div className="booking-summary-row"><span>Khởi hành</span><b>{tour.start_date ? new Date(`${tour.start_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</b></div>
            <div className="booking-summary-row"><span>Thời lượng</span><b>{tour.duration} ngày</b></div>
            {session && session.user.role !== 'admin' && (
              <>
                <label className="detail-guest-picker"><span>Số lượng khách</span><div><button type="button" onClick={() => setGuestCount((count) => Math.max(1, count - 1))}>−</button><strong>{guestCount}</strong><button type="button" disabled={guestCount >= tour.max_group_size} onClick={() => setGuestCount((count) => Math.min(tour.max_group_size, count + 1))}>+</button></div><small>Tối đa {tour.max_group_size} khách</small></label>
                <button type="button" className={added ? 'added-button' : ''} disabled={adding} onClick={addTour}>{adding ? 'Đang thêm...' : added ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng'}</button>
              </>
            )}
            <small className="booking-note">Không thu phí khi thêm vào giỏ hàng</small>
          </aside>
        </div>
      </article>
    </div>
  );
}
