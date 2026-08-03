import {
  Clock,
  RefreshCw,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  Undo2,
  LucideIcon,
} from 'lucide-react';

export interface StatusConfig {
  key: string;
  nameAr: string;
  nameEn: string;
  step: number; // 1 to 4 (0 for exceptional states like cancelled, refunded, returned)
  icon: LucideIcon;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badge: string;
  };
  defaultNoteAr: string;
  defaultNoteEn: string;
}

export const ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  // Primary 4 Steps
  pending: {
    key: 'pending',
    nameAr: 'تم تقديم الطلب',
    nameEn: 'Order Placed',
    step: 1,
    icon: Clock,
    color: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      accent: 'amber',
      badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    },
    defaultNoteAr: 'تم استقبال الطلب بنجاح وهو قيد الانتظار والمراجعة.',
    defaultNoteEn: 'Order has been placed successfully and is pending processing.',
  },
  processing: {
    key: 'processing',
    nameAr: 'قيد التجهيز',
    nameEn: 'Processing',
    step: 2,
    icon: RefreshCw,
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      accent: 'blue',
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    },
    defaultNoteAr: 'جاري تحضير وتغليف عطورك الفاخرة بعناية.',
    defaultNoteEn: 'Your order is being processed and packaged.',
  },
  shipped: {
    key: 'shipped',
    nameAr: 'تم الشحن',
    nameEn: 'Shipped',
    step: 3,
    icon: Truck,
    color: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      accent: 'indigo',
      badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    },
    defaultNoteAr: 'تم تسليم الشحنة لشركة التوصيل وهو في الطريق إليك.',
    defaultNoteEn: 'Your order has been shipped and is on its way.',
  },
  delivered: {
    key: 'delivered',
    nameAr: 'تم التسليم',
    nameEn: 'Delivered',
    step: 4,
    icon: PackageCheck,
    color: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      accent: 'emerald',
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    },
    defaultNoteAr: 'تم تسليم الطلب بنجاح. شكراً لتسوقك من دار بيور فيل.',
    defaultNoteEn: 'Order delivered successfully. Thank you for shopping with PURE VEIL.',
  },

  // Legacy mappings for backward compatibility
  confirmed: {
    key: 'confirmed',
    nameAr: 'قيد التجهيز',
    nameEn: 'Processing',
    step: 2,
    icon: RefreshCw,
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      accent: 'blue',
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    },
    defaultNoteAr: 'تم تأكيد طلبك وجاري مراجعته وتجهيزه.',
    defaultNoteEn: 'Your order has been confirmed and is being processed.',
  },
  preparing: {
    key: 'preparing',
    nameAr: 'قيد التجهيز',
    nameEn: 'Processing',
    step: 2,
    icon: RefreshCw,
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      accent: 'blue',
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    },
    defaultNoteAr: 'جاري تحضير وتغليف عطورك الفاخرة بعناية.',
    defaultNoteEn: 'Your luxury perfumes are being carefully prepared and packaged.',
  },
  packed: {
    key: 'packed',
    nameAr: 'قيد التجهيز',
    nameEn: 'Processing',
    step: 2,
    icon: RefreshCw,
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      accent: 'blue',
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    },
    defaultNoteAr: 'تم تغليف طلبك بالكامل وهو جاهز للتسليم لشركة الشحن.',
    defaultNoteEn: 'Your package is fully packed and ready for courier pickup.',
  },
  out_for_delivery: {
    key: 'out_for_delivery',
    nameAr: 'تم الشحن',
    nameEn: 'Shipped',
    step: 3,
    icon: Truck,
    color: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      accent: 'indigo',
      badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    },
    defaultNoteAr: 'مندوب التوصيل في طريقه للتسليم إلى عنوانك.',
    defaultNoteEn: 'The courier is currently out for delivery to your address.',
  },

  // Exceptional States
  cancelled: {
    key: 'cancelled',
    nameAr: 'ملغى',
    nameEn: 'Cancelled',
    step: 0,
    icon: XCircle,
    color: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      accent: 'red',
      badge: 'bg-red-500/15 border-red-500/30 text-red-300',
    },
    defaultNoteAr: 'تم إلغاء الطلب.',
    defaultNoteEn: 'The order has been cancelled.',
  },
  refunded: {
    key: 'refunded',
    nameAr: 'مسترجع',
    nameEn: 'Refunded',
    step: 0,
    icon: RotateCcw,
    color: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      accent: 'purple',
      badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    },
    defaultNoteAr: 'تم استرجاع مبلغ الطلب.',
    defaultNoteEn: 'Order amount has been refunded.',
  },
  returned: {
    key: 'returned',
    nameAr: 'مُعَاد',
    nameEn: 'Returned',
    step: 0,
    icon: Undo2,
    color: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      accent: 'orange',
      badge: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
    },
    defaultNoteAr: 'تم إرجاع الطلب إلى المتجر.',
    defaultNoteEn: 'Order has been returned to store.',
  },
};

// 4 Primary Progress Steps for Tracker
export const PROGRESS_STAGES_LIST: Array<{ key: string; nameAr: string; nameEn: string; step: number }> = [
  { key: 'pending', nameAr: 'تم تقديم الطلب', nameEn: 'Order Placed', step: 1 },
  { key: 'processing', nameAr: 'قيد التجهيز', nameEn: 'Processing', step: 2 },
  { key: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', step: 3 },
  { key: 'delivered', nameAr: 'تم التسليم', nameEn: 'Delivered', step: 4 },
];

export const getStatusConfig = (statusKey: string): StatusConfig => {
  return ORDER_STATUS_CONFIG[statusKey] || ORDER_STATUS_CONFIG.pending;
};
