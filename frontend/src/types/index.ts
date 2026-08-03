export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  createdAt?: string;
}

export interface VolumeOption {
  id?: number;
  size: string;
  price: number;
  stock?: number;
  sku?: string;
  displayOrder?: number;
}

export interface OlfactoryNotes {
  top?: string[];
  topEn?: string[];
  heart?: string[];
  heartEn?: string[];
  base?: string[];
  baseEn?: string[];
}

export interface ProductSpecs {
  sillage?: string;
  longevity?: string;
  season?: string;
  gender?: string;
}

export interface Product {
  id: number | string;
  sku: string;
  name: string;
  nameEn?: string;
  shortDescription?: string;
  shortDescriptionEn?: string;
  description?: string;
  descriptionEn?: string;
  usageInstructions?: string;
  usageInstructionsEn?: string;
  highlights?: string[];
  highlightsEn?: string[];
  tags?: string[];
  tagsEn?: string[];
  seoTitle?: string;
  seoTitleEn?: string;
  seoDescription?: string;
  seoDescriptionEn?: string;
  category: string;
  categoryEn?: string;
  categoryId?: number | string;
  price: number;
  oldPrice?: number | string | null;
  rating: number;
  reviewsCount: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'draft';
  image: string;
  concentration?: string;
  specs?: ProductSpecs;
  featured?: boolean;
  isNew?: boolean;
  volumeOptions?: VolumeOption[];
  notes?: OlfactoryNotes;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  name_en?: string;
  description?: string;
  descriptionEn?: string;
  description_en?: string;
  image?: string;
  displayOrder?: number;
  display_order?: number;
  status?: 'active' | 'inactive';
  productCount?: number;
  product_count?: number;
  count?: number;
  seoTitle?: string;
  seo_title?: string;
  seoTitleEn?: string;
  seo_title_en?: string;
  seoDescription?: string;
  seo_description?: string;
  seoDescriptionEn?: string;
  seo_description_en?: string;
}

export interface CartItem {
  id?: number;
  productId: number | string;
  productName?: string;
  productNameEn?: string;
  productImage?: string;
  product?: Product;
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderItem {
  id?: number;
  productId?: number;
  name: string;
  size?: string;
  price: number;
  quantity: number;
  productImage?: string;
  product_image?: string;
}

export interface TimelineEvent {
  id: number;
  status: string;
  note?: string;
  noteEn?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  user_id?: number | null;
  userId?: number | null;
  customer_name: string;
  customerName?: string;
  customer_email?: string;
  customerEmail?: string;
  customer_phone?: string;
  customerPhone?: string;
  subtotal: number;
  shipping_fee: number;
  shippingFee?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'preparing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
  payment_status?: 'paid' | 'unpaid' | 'refunded';
  paymentStatus?: 'paid' | 'unpaid' | 'refunded';
  payment_method?: string;
  paymentMethod?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  date?: string;
  items?: OrderItem[];
  itemCount?: number;
  previewImages?: string[];
  currentStageStep?: number;
  currentStageKey?: string;
  estimatedDelivery?: {
    ar: string;
    en: string;
  };
  timeline?: TimelineEvent[];
}


export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
}
