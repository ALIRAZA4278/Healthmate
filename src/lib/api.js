const API_URL = '/api';

// Helper function to get token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

// Auth APIs
export const authAPI = {
  register: (data) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Reports APIs
export const reportsAPI = {
  upload: (formData) =>
    apiCall('/reports/upload', {
      method: 'POST',
      body: formData,
    }),

  getAll: () => apiCall('/reports'),

  getById: (id) => apiCall(`/reports/${id}`),

  delete: (id) =>
    apiCall(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// Vitals APIs
export const vitalsAPI = {
  getAll: () => apiCall('/vitals'),

  add: (data) =>
    apiCall('/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiCall(`/vitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/vitals/${id}`, {
      method: 'DELETE',
    }),
};

// Family Members APIs
export const familyMembersAPI = {
  getAll: () => apiCall('/family-members'),

  getById: (id) => apiCall(`/family-members/${id}`),

  create: (data) =>
    apiCall('/family-members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiCall(`/family-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/family-members/${id}`, {
      method: 'DELETE',
    }),
};

// Auth helper functions
export const auth = {
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getToken,

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};
