-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text UNIQUE NOT NULL, -- Firebase auth uid for mapping
  email text,
  role text DEFAULT 'user',
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_id text NOT NULL,
  title text NOT NULL,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  quantity integer DEFAULT 1,
  total_price numeric DEFAULT 0,
  status text DEFAULT 'pending',
  tracking_link text,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  amount numeric DEFAULT 0,
  type text NOT NULL, -- 'deposit', 'withdraw', 'product_purchase', etc.
  status text DEFAULT 'pending',
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Depending on your exact Firebase document fields, you may need to add additional columns here.
