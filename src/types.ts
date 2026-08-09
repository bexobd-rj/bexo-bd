export interface Product {
  id: string;
  title: string;
  basePrice: number;
  imageUrl: string;
  description: string;
  stockStatus?: 'in_stock' | 'out_of_stock';
  stock?: number;
  sku?: string;
  category?: string;
  originalPrice?: number;
  variants?: Array<{ name: string; options: string[]; price?: number }>;
  status?: 'published' | 'draft';
  importSource?: string;
  externalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ImportedProductPreview {
  externalId: string;
  title: string;
  sku: string;
  category: string;
  description: string;
  imageUrl: string;
  images?: string[];
  originalPrice: number;
  calculatedPrice: number;
  stockStatus: 'in_stock' | 'out_of_stock';
  stockQuantity?: number;
  variants: ProductVariant[];
  selected: boolean;
}

export interface ApiConfig {
  id: string;
  name: string;
  websiteUrl: string;
  apiType: 'woocommerce' | 'shopify' | 'rest_api' | 'custom_json';
  authType: 'bearer' | 'api_key_header' | 'query_param' | 'basic_auth' | 'none';
  apiKey?: string;
  apiSecret?: string;
  customHeaders?: string; // JSON string or key: value
  status: 'active' | 'disabled';
  lastTestedAt?: string;
  lastConnectionStatus?: 'connected' | 'disconnected' | 'error';
  lastErrorMessage?: string;
  createdAt: string;
}

export interface PriceRule {
  type: 'fixed_add' | 'percentage_add' | 'fixed_price';
  value: number; // e.g., 30 BDT, 50 BDT, or 15%
  roundRule: 'none' | 'round_10' | 'round_50' | 'round_100' | 'round_99';
}

export interface ImportOptions {
  duplicateStrategy: 'skip' | 'update'; // Skip Existing vs Update Existing
  publishStatus: 'published' | 'draft'; // Publish Immediately vs Save as Draft
}

export interface CategoryMapping {
  id?: string;
  externalCategory: string;
  bexoCategory: string;
  createdAt?: string;
}

export interface ImportLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ImportHistoryItem {
  id: string;
  date: string;
  websiteName: string;
  websiteUrl: string;
  apiId?: string;
  totalFound: number;
  successCount: number;
  failedCount: number;
  skippedCount?: number;
  status: 'Completed' | 'Partial' | 'Failed';
  priceRuleSummary: string;
  importedProductsList?: Array<{ 
    sku: string; 
    title: string; 
    originalPrice: number; 
    finalPrice: number; 
    status: 'imported' | 'updated' | 'skipped' | 'failed'; 
    error?: string 
  }>;
  logs: ImportLog[];
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  size?: string;
  qty: number;
  basePrice: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryZone: 'inside' | 'outside';
  deliveryCharge: number;
  basePrice: number;
  sellingPrice: number;
  profit: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned';
  trackingLink?: string;
  productId: string;
  productTitle: string;
  size?: string;
  userId: string;
  resellerName?: string;
  resellerShopName?: string;
  resellerEmail?: string;
  profitStatus: 'not_added' | 'pending_approval' | 'completed';
  statusHistory?: { status: string; date: string; note?: string }[];
  items?: OrderItem[];
  comment?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  balance: number;
  role: 'admin' | 'user' | 'supplier';
  shopName?: string;
  phone?: string;
  website?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  date: string;
  referenceId?: string;
}
