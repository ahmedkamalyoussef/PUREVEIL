import axios from 'axios';
import { Product, Category, Order, User, DashboardStats } from '../types';

import { getImageUrl } from '../utils/imageUrl';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api/v1';

export { getImageUrl };
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token to Requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pureveil_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginApi = async (credentials: Record<string, string>): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

export const registerApi = async (userData: Record<string, string>): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

// Upload API (Multer)
export const uploadImageApi = async (file: File, folder: string = 'products'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/upload/${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

// Products API
export const fetchProducts = async (params?: {
  category?: string;
  search?: string;
  maxPrice?: number;
  featured?: string;
  isNew?: string;
  status?: string;
}): Promise<Product[]> => {
  try {
    const response = await api.get('/products', { params });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchProductById = async (id: number | string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
};

export const createProduct = async (productData: Partial<Product>): Promise<any> => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number | string, productData: Partial<Product>): Promise<any> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number | string): Promise<any> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Collections / Categories API
export const fetchCollections = async (): Promise<{ categories: Category[] }> => {
  try {
    const response = await api.get('/collections');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return { categories: [] };
  }
};

export const fetchCategoriesApi = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/collections/categories');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const createCategoryApi = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post('/collections/categories', data);
  return response.data.data;
};

export const createCollectionApi = createCategoryApi;

export const updateCategoryApi = async (id: number, data: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/collections/categories/${id}`, data);
  return response.data.data;
};

export const updateCollectionApi = updateCategoryApi;

export const deleteCategoryApi = async (id: number): Promise<any> => {
  const response = await api.delete(`/collections/categories/${id}`);
  return response.data;
};

export const deleteCollectionApi = deleteCategoryApi;

// Favorites API
export const fetchFavoritesApi = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/favorites');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return [];
  }
};

export const addFavoriteApi = async (productId: number | string): Promise<any> => {
  const response = await api.post('/favorites', { productId });
  return response.data;
};

export const removeFavoriteApi = async (productId: number | string): Promise<any> => {
  const response = await api.delete(`/favorites/${productId}`);
  return response.data;
};

// Cart API
export interface CartDataResponse {
  items: any[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export const fetchCartApi = async (): Promise<CartDataResponse> => {
  const response = await api.get('/cart');
  return response.data.data;
};

export const addToCartApi = async (
  productId: number | string,
  size: string,
  quantity: number,
  unitPrice?: number
): Promise<CartDataResponse> => {
  const response = await api.post('/cart', { productId, size, quantity, unitPrice });
  return response.data.data;
};

export const updateCartItemApi = async (
  productId: number | string,
  size: string,
  quantity: number
): Promise<CartDataResponse> => {
  const response = await api.put('/cart', { productId, size, quantity });
  return response.data.data;
};

export const removeCartItemApi = async (
  productId: number | string,
  size: string
): Promise<CartDataResponse> => {
  const response = await api.delete(`/cart/${productId}/${size}`);
  return response.data.data;
};

export const clearCartApi = async (): Promise<CartDataResponse> => {
  const response = await api.delete('/cart/clear');
  return response.data.data;
};

// Orders API
export const createOrderApi = async (orderData: any): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data.data;
};

export const fetchOrdersApi = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/orders');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
};

export const updateOrderStatusApi = async (id: number, status: string): Promise<Order> => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data.data;
};

// Users API (Admin)
export const fetchUsersApi = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

export const updateUserApi = async (id: number | string, data: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data.data;
};

export const updateUserRoleApi = async (id: number | string, role: string): Promise<User> => {
  return updateUserApi(id, { role: role as any });
};

export const deleteUserApi = async (id: number | string): Promise<any> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const updateProfileApi = async (data: { name: string }): Promise<User> => {
  const response = await api.put('/users/profile', data);
  return response.data.data;
};

export const updatePasswordApi = async (data: { currentPassword?: string; newPassword?: string }): Promise<any> => {
  const response = await api.put('/users/password', data);
  return response.data;
};

// Dashboard Stats API (Admin)
export const fetchDashboardStatsApi = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      recentOrders: []
    };
  }
};

export default api;
