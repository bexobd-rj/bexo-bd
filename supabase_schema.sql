-- 1. Users Table (bexo_users)
CREATE TABLE IF NOT EXISTS public.bexo_users (
  id text PRIMARY KEY,
  "profileId" text UNIQUE NOT NULL,
  email text,
  phone text,
  "fullName" text,
  password text,
  role text DEFAULT 'user',
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "lastActive" text
);

-- 2. Products Table (bexo_posts)
CREATE TABLE IF NOT EXISTS public.bexo_posts (
  id text PRIMARY KEY,
  title text,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  stock integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders Table (bexo_orders)
CREATE TABLE IF NOT EXISTS public.bexo_orders (
  id text PRIMARY KEY,
  "profileId" text NOT NULL,
  "productId" text,
  title text,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  quantity integer DEFAULT 1,
  "totalPrice" numeric DEFAULT 0,
  status text DEFAULT 'pending',
  tracking_link text,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions Table (bexo_transactions)
CREATE TABLE IF NOT EXISTS public.bexo_transactions (
  id text PRIMARY KEY,
  "profileId" text NOT NULL,
  amount numeric DEFAULT 0,
  type text, 
  status text DEFAULT 'pending',
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.bexo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bexo_users 
    WHERE id = auth.uid()::text AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for bexo_users
-- Users can read, insert, and update their own profile
CREATE POLICY "Users can read own profile" ON public.bexo_users FOR SELECT USING (id = auth.uid()::text ); 
CREATE POLICY "Users can insert own profile" ON public.bexo_users FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "Users can update own profile" ON public.bexo_users FOR UPDATE USING (id = auth.uid()::text);
-- Admins can do everything
CREATE POLICY "Admins can manage all users" ON public.bexo_users FOR ALL USING (public.is_admin());

-- RLS for bexo_posts (Products)
-- Anyone can read products
CREATE POLICY "Anyone can read products" ON public.bexo_posts FOR SELECT USING (true);
-- Only admins can insert/update/delete products
CREATE POLICY "Admins can manage products" ON public.bexo_posts FOR ALL USING (public.is_admin());

-- RLS for bexo_orders
-- Users can manage their own orders
CREATE POLICY "Users can manage own orders" ON public.bexo_orders FOR ALL USING (
  "profileId" IN (SELECT "profileId" FROM public.bexo_users WHERE id = auth.uid()::text)
);
-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.bexo_orders FOR ALL USING (public.is_admin());

-- RLS for bexo_transactions
-- Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" ON public.bexo_transactions FOR ALL USING (
  "profileId" IN (SELECT "profileId" FROM public.bexo_users WHERE id = auth.uid()::text)
);
-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.bexo_transactions FOR ALL USING (public.is_admin());

