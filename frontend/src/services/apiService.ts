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
  page?: number;
  limit?: number;
}): Promise<Product[]> => {
  try {
    const response = await api.get('/products', { params });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchPaginatedProducts = async (params?: Record<string, any>): Promise<PaginatedResponse<Product>> => {
  try {
    const response = await api.get('/products', { params });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch paginated products:', error);
    return { data: [], pagination: undefined };
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

// Orders & Users Pagination Interfaces
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: PaginationMeta;
}

// Orders API
export const createOrderApi = async (orderData: any): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data.data;
};

export const fetchOrdersApi = async (params?: Record<string, any>): Promise<PaginatedResponse<Order>> => {
  try {
    const response = await api.get('/orders', { params });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return { data: [], pagination: undefined };
  }
};

export const updateOrderStatusApi = async (id: number | string, status: string): Promise<Order> => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data.data;
};

export const updatePaymentStatusApi = async (id: number | string, paymentStatus: string): Promise<Order> => {
  const response = await api.put(`/orders/${id}/payment-status`, { paymentStatus });
  return response.data.data;
};

// Users API (Admin)
export const fetchUsersApi = async (params?: Record<string, any>): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get('/users', { params });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { data: [], pagination: undefined };
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
      recentOrders: [],
    };
  }
};

// Store Settings API
export interface StoreSettings {
  logo?: string;
  favicon?: string;
  storeName: string;
  storeNameEn?: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp?: string;
  storeAddress: string;
  storeAddressEn?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  snapchatUrl?: string;
  tiktokUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  copyrightText?: string;
  copyrightTextEn?: string;
  currency: string;
  // Visibility Toggles
  showPhone?: boolean;
  showWhatsapp?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showSocialLinks?: boolean;
  showInstagram?: boolean;
  showTwitter?: boolean;
  showFacebook?: boolean;
  showSnapchat?: boolean;
  showTiktok?: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  logo: '/logo.png',
  favicon: '/favicon.png',
  storeName: 'PURE VEIL - بيور فيل',
  storeNameEn: 'PURE VEIL Luxury Perfumes',
  supportEmail: 'support@pureveil.com',
  supportPhone: '+965 2200 8800',
  whatsapp: '+965 2200 8800',
  storeAddress: 'مدينة الكويت - برج العطور الفاخرة',
  storeAddressEn: 'Kuwait City - Luxury Fragrance Tower',
  instagramUrl: '#',
  twitterUrl: '#',
  facebookUrl: '#',
  snapchatUrl: '#',
  tiktokUrl: '#',
  shippingFee: 2.0,
  freeShippingThreshold: 30.0,
  copyrightText: 'جميع الحقوق محفوظة.',
  copyrightTextEn: 'All rights reserved.',
  currency: 'KWD',
  showPhone: true,
  showWhatsapp: true,
  showEmail: true,
  showAddress: true,
  showSocialLinks: true,
  showInstagram: true,
  showTwitter: true,
  showFacebook: true,
  showSnapchat: true,
  showTiktok: true,
};

export const fetchSettingsApi = async (): Promise<StoreSettings> => {
  try {
    const response = await api.get('/settings');
    const data = response.data.data;
    if (data) {
      localStorage.setItem('pureveil_store_settings', JSON.stringify(data));
      return data;
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    const saved = localStorage.getItem('pureveil_store_settings');
    if (saved) {
      try {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_STORE_SETTINGS;
  }
};

export const updateSettingsApi = async (data: Partial<StoreSettings>): Promise<StoreSettings> => {
  try {
    const response = await api.put('/settings', data);
    const updated = response.data.data;
    if (updated) {
      localStorage.setItem('pureveil_store_settings', JSON.stringify(updated));
      return updated;
    }
    throw new Error('No data returned');
  } catch (error) {
    console.error('Failed to update settings via API, saving locally:', error);
    const saved = localStorage.getItem('pureveil_store_settings');
    const current = saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    const merged = { ...current, ...data };
    localStorage.setItem('pureveil_store_settings', JSON.stringify(merged));
    return merged;
  }
};

export default api;
