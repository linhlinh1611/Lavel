const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTours() {
  const response = await fetch(`${BASE_URL}/api/v1/tours/`);
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu tour.');
  }
  return await response.json();
}

async function fetchAdminTours(token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/tours/admin/all`, {
    headers: authHeaders(token),
  });
  if (!response.ok) await parseError(response, 'Không thể tải danh sách quản trị.');
  return await response.json();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(response, fallback) {
  const data = await response.json().catch(() => null);
  throw new Error(data?.detail || fallback);
}

async function createTour(tour, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/tours/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(tour),
  }, 15000);

  if (!response.ok) {
    await parseError(response, 'Không thể tạo tour mới.');
  }

  return await response.json();
}

async function updateTour(id, tour, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/tours/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(tour),
  }, 15000);
  if (!response.ok) await parseError(response, 'Không thể cập nhật tour.');
  return await response.json();
}

async function deleteTour(id, token) {
  const response = await fetch(`${BASE_URL}/api/v1/tours/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) await parseError(response, 'Không thể xóa tour.');
  return await response.json();
}

function uploadTourMedia(file, token, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);
    request.open('POST', `${BASE_URL}/api/v1/media/upload`);
    request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.timeout = 60000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let data = null;
      try { data = JSON.parse(request.responseText); } catch { /* empty/invalid response */ }
      if (request.status >= 200 && request.status < 300) resolve(data);
      else reject(new Error(data?.detail || 'Không thể tải file lên.'));
    };
    request.onerror = () => reject(new Error('Mất kết nối khi tải file lên.'));
    request.ontimeout = () => reject(new Error('Tải file quá 60 giây. Hãy chọn file nhỏ hơn.'));
    request.send(body);
  });
}

function resolveMediaUrl(path) {
  if (!path || path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

async function fetchHeroSetting() {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/settings/hero`);
  if (!response.ok) await parseError(response, 'Không thể tải ảnh banner.');
  return await response.json();
}

async function updateHeroSetting(heroImageUrl, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/settings/hero`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ hero_image_url: heroImageUrl }),
  });
  if (!response.ok) await parseError(response, 'Không thể cập nhật ảnh banner.');
  return await response.json();
}

function normalizeCartItem(item) {
  return { ...item.tour, cart_item_id: item.id, quantity: item.quantity };
}

async function fetchCart(token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/cart/`, { headers: authHeaders(token) });
  if (!response.ok) await parseError(response, 'Không thể tải giỏ hàng.');
  return (await response.json()).map(normalizeCartItem);
}

async function addCartItem(tourId, quantity, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/cart/${tourId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) await parseError(response, 'Không thể thêm tour vào giỏ hàng.');
  return normalizeCartItem(await response.json());
}

async function updateCartItem(itemId, quantity, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/cart/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) await parseError(response, 'Không thể cập nhật giỏ hàng.');
  return normalizeCartItem(await response.json());
}

async function removeCartItem(itemId, token) {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/cart/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) await parseError(response, 'Không thể xóa tour khỏi giỏ hàng.');
}

async function fetchTourById(id) {
  const response = await fetch(`${BASE_URL}/api/v1/tours/${id}`);
  if (!response.ok) throw new Error('Không thể tải thông tin tour.');
  return await response.json();
}

async function login(credentials) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || 'Đăng nhập thất bại.');
  }
  return await response.json();
}

async function register(user) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = Array.isArray(data?.detail) ? data.detail[0]?.msg : data?.detail;
    throw new Error(detail || 'Đăng ký thất bại.');
  }
  return await response.json();
}

export { fetchTours, fetchAdminTours, createTour, updateTour, deleteTour, uploadTourMedia, resolveMediaUrl, fetchHeroSetting, updateHeroSetting, fetchCart, addCartItem, updateCartItem, removeCartItem, fetchTourById, login, register };
