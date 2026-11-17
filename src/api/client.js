import axios from 'axios';
import { auth } from '../auth/firebase';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Firebase auth token
client.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Failed to attach auth token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (status >= 500) {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'error',
              message: error.response.data?.detail || 'Server error. Please try again.',
            },
          })
        );
      }
    } else if (error.request) {
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: { type: 'error', message: 'Network error. Check your connection.' },
        })
      );
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export function verifyAuth(idToken) {
  return client.post('/api/auth/verify', { idToken });
}

// ===== People =====
export function getPeople(params = {}) {
  return client.get('/api/people', { params });
}

export function createPerson(data) {
  return client.post('/api/people', data);
}

export function getPerson(id) {
  return client.get(`/api/people/${id}`);
}

export function updatePerson(id, data) {
  return client.patch(`/api/people/${id}`, data);
}

export function deletePerson(id) {
  return client.delete(`/api/people/${id}`);
}

// ===== Relationships =====
export function createRelationship(data) {
  return client.post('/api/relationships', data);
}

export function deleteRelationship(id) {
  return client.delete(`/api/relationships/${id}`);
}

// ===== Tree =====
export function getTree(personId, depth = 2) {
  return client.get(`/api/tree/${personId}`, { params: { depth } });
}

// ===== Pathfinder =====
export function findPath(person1Id, person2Id) {
  return client.get('/api/pathfinder', {
    params: {
      person1Id,
      person2Id,
      person1_id: person1Id,
      person2_id: person2Id,
    },
  });
}

// ===== Upload =====
export function uploadPreview(file) {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/api/upload/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
}

export function uploadCommit(resolutions, sessionId) {
  return client.post('/api/upload/commit', {
    resolutions,
    sessionId,
    session_id: sessionId,
  });
}

export function downloadTemplate() {
  return client.get('/api/upload/template', { responseType: 'blob' });
}

// ===== Events =====
export function getEvents() {
  return client.get('/api/events');
}

export function createEvent(data) {
  return client.post('/api/events', data);
}

export function getEvent(code) {
  return client.get(`/api/events/${code}`);
}

export function joinEvent(code) {
  return client.post(`/api/events/${code}/join`);
}

// ===== Pre-signed upload URL =====
export function getPresignedUrl(filename, contentType) {
  return client.post('/api/upload/presign', { filename, content_type: contentType });
}

export default client;

