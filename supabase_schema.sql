-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid text PRIMARY KEY,
  email text NOT NULL,
  displayName text,
  role text DEFAULT 'user' NOT NULL, -- 'admin' | 'user' | 'supplier'
  balance numeric DEFAULT 0 NOT NULL,
  shopName text,
  phone text,
  address text,
  referralName text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY, -- We'll accept text IDs generated on client or standard UUID strings
  title text NOT NULL,
  basePrice numeric DEFAULT 0 NOT NULL,
  imageUrl text,
  description text,
  stockStatus text DEFAULT 'in_stock', -- 'in_stock' | 'out_of_stock'
  stock integer DEFAULT 0,
  sku text,
  category text,
  originalPrice numeric,
  variants jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'published', -- 'published' | 'draft'
  importSource text,
  externalId text,
  createdAt text,
  updatedAt text
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  date text NOT NULL,
  customerName text NOT NULL,
  customerPhone text NOT NULL,
  customerAddress text NOT NULL,
  deliveryZone text NOT NULL, -- 'inside' | 'outside'
  deliveryCharge numeric DEFAULT 0 NOT NULL,
  basePrice numeric DEFAULT 0 NOT NULL,
  sellingPrice numeric DEFAULT 0 NOT NULL,
  profit numeric DEFAULT 0 NOT NULL,
  status text DEFAULT 'Pending' NOT NULL, -- 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned'
  trackingLink text,
  productId text NOT NULL,
  productTitle text NOT NULL,
  size text,
  userId text NOT NULL,
  resellerName text,
  resellerShopName text,
  resellerEmail text,
  profitStatus text DEFAULT 'not_added' NOT NULL, -- 'not_added' | 'pending_approval' | 'completed'
  statusHistory jsonb DEFAULT '[]'::jsonb,
  items jsonb DEFAULT '[]'::jsonb,
  comment text
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id text PRIMARY KEY,
  userId text NOT NULL,
  amount numeric DEFAULT 0 NOT NULL,
  type text NOT NULL, -- 'income' | 'withdrawal' or custom types
  status text DEFAULT 'pending' NOT NULL, -- 'pending' | 'completed' | 'failed'
  description text,
  date text NOT NULL,
  referenceId text
);
