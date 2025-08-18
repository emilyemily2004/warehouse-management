import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Product {
  name: string;
  contain_articles: {
    art_id: string;
    amount_of: number;
  }[];
  price: number;
}

export interface Article {
  art_id: string;
  name: string;
  stock: number;
}

export const apiService = {
  // Products
  getProducts: () => api.get<Product[]>('/products'),
  canProductBeMade: (productName: string) => 
    api.get<boolean>(`/products/${encodeURIComponent(productName)}/canBeMade`),
  createProduct: (productName: string) => 
    api.post<string>(`/products/${encodeURIComponent(productName)}/create`),

  // Articles
  getArticles: () => api.get<Article[]>('/articles'),

  // Auth
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) => 
    api.post('/auth/register', { username, email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export default api;
