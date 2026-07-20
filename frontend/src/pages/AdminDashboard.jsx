import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createTour, deleteTour, fetchAdminTours, fetchHeroSetting, resolveMediaUrl, updateHeroSetting, updateTour, uploadTourMedia } from '../api';
import { destinationGroups, popularDestinations } from '../data/destinations';

const emptyForm = {
  title: '', location: '', start_date: '', end_date: '', description: '', price: 0, duration: 1, max_group_size: 1, featured: false, active: true, media_url: null, media_type: null,
};

export default function AdminDashboard({ session, onLogout }) {
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heroImage, setHeroImage] = useState('');
  const [heroFile, setHeroFile] = useState(null);
  const [heroSaving, setHeroSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const featuredCount = tours.filter((tour) => tour.featured).length;
  const destinationCount = new Set(tours.map((tour) => tour.location).filter(Boolean)).size;
  const averagePrice = tours.length ? tours.reduce((sum, tour) => sum + tour.price, 0) / tours.length : 0;

  const loadTours = () => fetchAdminTours(session.access_token).then(setTours).catch((err) => setError(err.message));
  useEffect(() => { loadTours(); }, []);
  useEffect(() => { fetchHeroSetting().then((data) => setHeroImage(data.hero_image_url)).catch((err) => setError(err.message)); }, []);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const nextValue = name === 'featured'
        ? value === 'featured'
        : type === 'checkbox'
          ? checked
          : type === 'number'
            ? Number(value)
            : value;
      const next = { ...prev, [name]: nextValue };
      if ((name === 'start_date' || name === 'end_date') && next.start_date && next.end_date && next.end_date >= next.start_date) {
        next.duration = Math.round((new Date(`${next.end_date}T00:00:00`) - new Date(`${next.start_date}T00:00:00`)) / 86400000) + 1;
      }
      return next;
    });
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setMediaFile(null); setMediaPreview(''); setProgress(0); setFieldErrors({}); };
  const edit = (tour) => { setEditingId(tour.id); setForm({ ...tour }); setFieldErrors({}); setMediaFile(null); setMediaPreview(resolveMediaUrl(tour.media_url)); document.querySelector('#tour-form')?.scrollIntoView({ behavior: 'smooth' }); };
  const selectMedia = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError('File vượt quá 20 MB. Vui lòng chọn file nhỏ hơn.');
      event.target.value = '';
      return;
    }
    setError('');
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    const errors = {};
    if (!(form.title || '').trim()) errors.title = 'Vui lòng nhập tiêu đề tour.';
    if (!(form.location || '').trim()) errors.location = 'Vui lòng nhập địa điểm du lịch.';
    if (!form.start_date) errors.start_date = 'Vui lòng chọn ngày khởi hành.';
    if (!form.end_date) errors.end_date = 'Vui lòng chọn ngày kết thúc.';
    else if (form.start_date && form.end_date < form.start_date) errors.end_date = 'Ngày kết thúc phải sau hoặc bằng ngày khởi hành.';
    if (!form.price || form.price <= 0) errors.price = 'Giá tour phải lớn hơn 0.';
    if (!form.max_group_size || form.max_group_size < 1) errors.max_group_size = 'Số khách tối đa phải từ 1 trở lên.';
    if (!form.duration || form.duration < 1) errors.duration = 'Thời lượng tour chưa hợp lệ.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => document.querySelector('.field-error')?.closest('label')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      let payload = form;
      if (mediaFile) {
        const media = await uploadTourMedia(mediaFile, session.access_token, setProgress);
        payload = { ...form, ...media };
      }
      if (editingId) {
        await updateTour(editingId, payload, session.access_token);
        setMessage('Đã cập nhật tour.');
      } else {
        await createTour(payload, session.access_token);
        setMessage('Đã thêm tour mới.');
      }
      resetForm(); await loadTours();
    } catch (err) { setError(err.message); } finally { setUploading(false); }
  };
  const remove = async (tour) => {
    if (!window.confirm(`Xóa tour “${tour.title}”?`)) return;
    try {
      await deleteTour(tour.id, session.access_token);
      setTours((prev) => prev.filter((item) => item.id !== tour.id));
      setMessage('Đã xóa tour.');
    } catch (err) { setError(err.message); }
  };
  const toggleVisibility = async (tour) => {
    try {
      const updated = await updateTour(tour.id, { active: !tour.active }, session.access_token);
      setTours((prev) => prev.map((item) => item.id === tour.id ? updated : item));
      setMessage(updated.active ? `Đã hiển thị tour “${tour.title}”.` : `Đã ẩn tour “${tour.title}”.`);
      setError('');
    } catch (err) { setError(err.message); }
  };
  const saveHero = async () => {
    if (!heroFile) return;
    setHeroSaving(true); setError(''); setMessage('');
    try {
      const media = await uploadTourMedia(heroFile, session.access_token);
      if (media.media_type !== 'image') throw new Error('Banner trang chủ phải là file ảnh.');
      await updateHeroSetting(media.media_url, session.access_token);
      setHeroImage(media.media_url);
      setHeroFile(null);
      setMessage('Đã cập nhật ảnh banner trang chủ.');
    } catch (err) { setError(err.message); } finally { setHeroSaving(false); }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-logo" to="/admin"><span className="brand-word"><b>La</b>vel</span><small>ADMIN PORTAL</small></Link>
        <nav className="admin-menu">
          <a className="active" href="#dashboard"><span>▦</span>Tổng quan</a>
          <a href="#tour-form"><span>＋</span>Thêm tour</a>
          <a href="#tour-list"><span>◇</span>Quản lý tour</a>
          <Link to="/"><span>↗</span>Trang khách hàng</Link>
        </nav>
        <div className="admin-profile">
          <div className="profile-avatar">{(session.user.full_name || session.user.email).charAt(0).toUpperCase()}</div>
          <div><strong>{session.user.full_name || 'Quản trị viên'}</strong><span>{session.user.email}</span></div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>Đăng xuất</button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><p>Xin chào, {session.user.full_name || 'Admin'} 👋</p><h1>Dashboard quản trị</h1></div>
          <Link className="secondary-button" to="/">Xem website</Link>
        </header>

        <section id="dashboard" className="dashboard-hero">
          <div><span className="dashboard-badge">TRAVEL MANAGEMENT</span><h2>Kiểm soát hành trình<br />trong một nơi.</h2><p>Theo dõi và cập nhật nội dung tour nhanh chóng, trực quan.</p></div>
          <div className="dashboard-orbit"><span>✈</span></div>
        </section>

        <section className="stats-grid">
          <article className="stat-card"><span className="stat-icon mint">◇</span><div><p>Tour đang hiện</p><strong>{tours.filter((tour) => tour.active).length}</strong><small>{tours.filter((tour) => !tour.active).length} tour đang ẩn</small></div></article>
          <article className="stat-card"><span className="stat-icon blue">★</span><div><p>Tour nổi bật</p><strong>{featuredCount}</strong><small>{tours.length ? Math.round(featuredCount / tours.length * 100) : 0}% tổng số tour</small></div></article>
          <article className="stat-card"><span className="stat-icon aqua">⌖</span><div><p>Điểm đến</p><strong>{destinationCount}</strong><small>Địa điểm khác nhau</small></div></article>
          <article className="stat-card"><span className="stat-icon sky">₫</span><div><p>Giá trung bình</p><strong className="stat-price">{Math.round(averagePrice).toLocaleString('vi-VN')}</strong><small>VND / tour</small></div></article>
        </section>

        <section className="hero-setting admin-panel">
          <div className="section-title"><div><span className="section-kicker">GIAO DIỆN TRANG CHỦ</span><h2>Ảnh banner kỳ nghỉ</h2><p>Ảnh nằm dưới tiêu đề “Trải nghiệm kỳ nghỉ tuyệt vời”.</p></div></div>
          <div className="hero-setting-grid">
            <div className="hero-setting-preview" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,35,48,.65), transparent), url(${heroFile ? URL.createObjectURL(heroFile) : resolveMediaUrl(heroImage)})` }}>
              <strong>Trải nghiệm kỳ nghỉ<br />tuyệt vời</strong>
            </div>
            <div className="hero-setting-controls">
              <label>Chọn ảnh mới<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setHeroFile(event.target.files[0] || null)} /></label>
              <small>Nên dùng ảnh ngang, tỷ lệ khoảng 16:6 và dung lượng dưới 20 MB.</small>
              <button onClick={saveHero} disabled={!heroFile || heroSaving}>{heroSaving ? 'Đang cập nhật...' : 'Lưu ảnh banner'}</button>
            </div>
          </div>
        </section>

        <section id="tour-form" className="form-section admin-panel">
        <div className="crud-form-header">
          <div className="crud-header-icon">{editingId ? '✎' : '＋'}</div>
          <div><span className="section-kicker">{editingId ? 'ĐANG CHỈNH SỬA' : 'TẠO HÀNH TRÌNH MỚI'}</span><h2>{editingId ? 'Chỉnh sửa thông tin tour' : 'Thêm tour mới'}</h2><p>Điền thông tin theo từng nhóm để hoàn thiện tour.</p></div>
        </div>
        <form onSubmit={submit} className="create-form" noValidate>
          <div className="form-block">
            <div className="form-block-title"><span>01</span><div><h3>Thông tin cơ bản</h3><p>Tên gọi, địa điểm và phần giới thiệu tour.</p></div></div>
            <div className="form-grid">
              <label className="wide-field">Tiêu đề tour<input className={fieldErrors.title ? 'input-invalid' : ''} name="title" placeholder="Ví dụ: Khám phá Đà Nẵng – Hội An 4N3Đ" value={form.title} onChange={change} required />{fieldErrors.title && <small className="field-error">{fieldErrors.title}</small>}</label>
              <label>Địa điểm du lịch
                <select className={fieldErrors.location ? 'input-invalid' : ''} name="location" value={form.location || ''} onChange={change} required>
                  <option value="">Chọn điểm đến du lịch</option>
                  {form.location && !popularDestinations.includes(form.location) && <option value={form.location}>{form.location} (dữ liệu cũ)</option>}
                  {Object.entries(destinationGroups).map(([region, destinations]) => (
                    <optgroup key={region} label={region}>
                      {destinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}
                    </optgroup>
                  ))}
                </select>
                {fieldErrors.location && <small className="field-error">{fieldErrors.location}</small>}
              </label>
              <label>Loại tour
                <select name="featured" value={form.featured ? 'featured' : 'standard'} onChange={change}>
                  <option value="standard">Tour tiêu chuẩn</option>
                  <option value="featured">Tour nổi bật</option>
                </select>
              </label>
              <label className="full-field">Mô tả tour<textarea name="description" placeholder="Mô tả trải nghiệm, lịch trình nổi bật và những điều khách hàng sẽ nhận được..." value={form.description || ''} onChange={change} /></label>
            </div>
          </div>

          <div className="form-block">
            <div className="form-block-title"><span>02</span><div><h3>Lịch trình & sức chứa</h3><p>Thiết lập thời gian diễn ra và quy mô đoàn.</p></div></div>
            <div className="form-grid three-columns">
              <label>Ngày khởi hành<input className={fieldErrors.start_date ? 'input-invalid' : ''} name="start_date" type="date" value={form.start_date || ''} onChange={change} required />{fieldErrors.start_date && <small className="field-error">{fieldErrors.start_date}</small>}</label>
              <label>Ngày kết thúc<input className={fieldErrors.end_date ? 'input-invalid' : ''} name="end_date" type="date" min={form.start_date || undefined} value={form.end_date || ''} onChange={change} required />{fieldErrors.end_date && <small className="field-error">{fieldErrors.end_date}</small>}</label>
              <label>Thời lượng<input className={fieldErrors.duration ? 'input-invalid' : ''} name="duration" type="number" min="1" value={form.duration} readOnly aria-readonly="true" /><small className={fieldErrors.duration ? 'field-error' : ''}>{fieldErrors.duration || 'Tự tính theo ngày đã chọn'}</small></label>
              <label>Giá mỗi khách (VND)<input className={fieldErrors.price ? 'input-invalid' : ''} name="price" type="number" min="0" step="1000" value={form.price} onChange={change} required />{fieldErrors.price && <small className="field-error">{fieldErrors.price}</small>}</label>
              <label>Số khách tối đa<input className={fieldErrors.max_group_size ? 'input-invalid' : ''} name="max_group_size" type="number" min="1" value={form.max_group_size} onChange={change} required />{fieldErrors.max_group_size && <small className="field-error">{fieldErrors.max_group_size}</small>}</label>
            </div>
          </div>

          <div className="form-block media-form-block">
            <div className="form-block-title"><span>03</span><div><h3>Hình ảnh & video</h3><p>Media đẹp giúp tour thu hút và đáng tin cậy hơn.</p></div></div>
            <label className="media-upload">
              <span className="upload-icon">↥</span>
              <strong>Chọn ảnh hoặc video ngắn</strong>
              <small>Kéo thả hoặc nhấn để chọn · JPG, PNG, WEBP, MP4, WEBM · tối đa 20 MB</small>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={selectMedia} />
            </label>
            {mediaPreview && (
              <div className="media-preview">
                {(mediaFile?.type.startsWith('video/') || (!mediaFile && form.media_type === 'video'))
                  ? <video src={mediaPreview} controls />
                  : <img src={mediaPreview} alt="Xem trước media tour" />}
                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(''); setForm((prev) => ({ ...prev, media_url: null, media_type: null })); }}>Bỏ media</button>
              </div>
            )}
          </div>

          <div className="form-actions crud-actions">
            <div>{message && <p className="success">✓ {message}</p>}{error && <p className="error">⚠ {error}</p>}</div>
            {editingId && <button type="button" className="muted-button" onClick={resetForm}>Hủy chỉnh sửa</button>}
            <button className="save-tour-button" type="submit" disabled={uploading}>{uploading ? (mediaFile && progress < 100 ? `Đang tải file ${progress}%` : 'Đang lưu tour...') : editingId ? '✓ Lưu thay đổi' : '＋ Tạo tour mới'}</button>
          </div>
          {uploading && mediaFile && <progress className="upload-progress" max="100" value={progress}>{progress}%</progress>}
        </form>
        </section>
        <section id="tour-list" className="section admin-panel tour-management">
        <div className="section-title"><div><h2>Danh sách tour</h2><p>{tours.length} tour trong hệ thống</p></div><span className="live-badge"><i /> Dữ liệu trực tiếp</span></div>
        <div className="admin-list">
          {tours.map((tour) => (
            <article className={`admin-tour-row ${tour.active ? '' : 'tour-is-hidden'}`} key={tour.id}>
              {tour.media_url && (tour.media_type === 'video'
                ? <video className="admin-media-thumb" src={resolveMediaUrl(tour.media_url)} muted />
                : <img className="admin-media-thumb" src={resolveMediaUrl(tour.media_url)} alt="" />)}
              <div><strong>{tour.title}</strong><p>{tour.location || 'Chưa có địa điểm'} · {tour.start_date ? new Date(`${tour.start_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Chưa có ngày đi'} → {tour.end_date ? new Date(`${tour.end_date}T00:00:00`).toLocaleDateString('vi-VN') : 'Chưa có ngày về'}</p></div>
              <div className="visibility-control">
                <span className={tour.active ? 'visible-status' : 'hidden-status'}>{tour.active ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                <button className={`visibility-switch ${tour.active ? 'on' : ''}`} onClick={() => toggleVisibility(tour)} aria-label={tour.active ? 'Ẩn tour' : 'Hiện tour'} aria-pressed={tour.active}><i /></button>
              </div>
              <div className="card-actions"><button onClick={() => edit(tour)}>Chỉnh sửa</button><button className="danger-button" onClick={() => remove(tour)}>Xóa</button></div>
            </article>
          ))}
        </div>
        </section>
      </main>
    </div>
  );
}
