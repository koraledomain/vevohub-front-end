import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

type FetchOptions = RequestInit & {
  params?: Record<string, any>;
};

// Simple fetch wrapper that handles auth and base URL
async function fetchAPI<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const token = sessionStorage.getItem('accessToken');

  // Build full URL
  let fullUrl = url.startsWith('http') ? url : `${HOST_API}${url}`;

  // Add query params if provided
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl = `${fullUrl}?${queryString}`;
    }
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle errors
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = response.statusText || 'Something went wrong';
    }
    throw errorData;
  }

  // Parse JSON response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as Promise<T>;
}

// ----------------------------------------------------------------------

// Simple API object - just use fetch directly!
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) => fetchAPI<T>(url, { ...options, method: 'GET' }),
  post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchAPI<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  patch: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchAPI<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchAPI<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T = any>(url: string, options?: FetchOptions) =>
    fetchAPI<T>(url, { ...options, method: 'DELETE' }),
};

export default api;

// ----------------------------------------------------------------------

export const fetcher = async <T = any>(args: string | [string, FetchOptions]): Promise<T> => {
  const [url, options] = Array.isArray(args) ? args : [args];
  return api.get<T>(url, options);
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/auth/login',
    register: '/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  profiles: {
    candidates: '/candidates',
    positions: '/positions',
    profiles: '/profiles',
  },
};
