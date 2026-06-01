const DEFAULT_API_URL = 'http://127.0.0.1:8000';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

let csrfToken = null;
let csrfPromise = null;

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

export function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function shouldSendCsrf(method) {
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase());
}

export async function ensureCsrf({ force = false } = {}) {
  const cookieToken = getCookie('csrftoken');

  if (!force && cookieToken) {
    csrfToken = cookieToken;
    return csrfToken;
  }

  if (!force && csrfToken) {
    return csrfToken;
  }

  if (force) {
    csrfToken = null;
    csrfPromise = null;
  }

  if (!csrfPromise) {
    csrfPromise = fetch(buildUrl('/api/csrf/'), {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`CSRF request failed with ${response.status}`);
        }

        const data = await response.json().catch(() => ({}));
        csrfToken = data.csrfToken || getCookie('csrftoken');
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

async function buildRequestHeaders(method, options, forceCsrf = false) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  if (shouldSendCsrf(method) && !headers.has('X-CSRFToken')) {
    const token = await ensureCsrf({ force: forceCsrf });

    if (token) {
      headers.set('X-CSRFToken', token);
    }
  }

  return headers;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const request = async (forceCsrf = false) => fetch(buildUrl(path), {
    ...options,
    method,
    headers: await buildRequestHeaders(method, options, forceCsrf),
    credentials: 'include',
  });

  let response = await request(false);

  if (response.status === 403 && shouldSendCsrf(method)) {
    response = await request(true);
  }

  return response;
}
