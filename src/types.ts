export interface Product {
  id: string;
  title: string;
  basePrice: number;
  imageUrl: string;
  description: string;
  stockStatus?: 'in_stock' | 'out_of_stock';
  stock?: number;
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
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  balance: number;
  role: 'admin' | 'user' | 'supplier';
  shopName?: string;
  phone?: string;
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
