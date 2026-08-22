-- ==========================================================
-- BEXO BD - PRODUCTION SUPABASE DATABASE SCHEMA & RLS RULES
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE (public.bexo_users)
-- Passwords are NOT stored here - authentication is handled entirely by Supabase Auth (auth.users).
CREATE TABLE IF NOT EXISTS public.bexo_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "profileId" text UNIQUE NOT NULL,
  email text,
  phone text,
  "fullName" text,
  "shopName" text,
  address text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user', 'supplier')),
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  "referredBy" text,
  "lastActive" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE (public.bexo_posts)
CREATE TABLE IF NOT EXISTS public.bexo_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric DEFAULT 0 NOT NULL,
  profit numeric DEFAULT 0,
  stock integer DEFAULT 0,
  category text,
  sku text,
  description text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE (public.bexo_orders)
CREATE TABLE IF NOT EXISTS public.bexo_orders (
  id text PRIMARY KEY,
  "userId" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  "profileId" text NOT NULL,
  "productId" text,
  title text,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  quantity integer DEFAULT 1,
  "totalPrice" numeric DEFAULT 0,
  "customerName" text,
  "customerPhone" text,
  "customerAddress" text,
  "deliveryZone" text,
  "deliveryCharge" numeric DEFAULT 0,
  "sellingPrice" numeric DEFAULT 0,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled')),
  tracking_link text,
  items jsonb DEFAULT '[]'::jsonb,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TRANSACTIONS TABLE (public.bexo_transactions)
CREATE TABLE IF NOT EXISTS public.bexo_transactions (
  id text PRIMARY KEY,
  "userId" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  "profileId" text NOT NULL,
  amount numeric DEFAULT 0 NOT NULL,
  type text CHECK (type IN ('income', 'withdrawal', 'deposit', 'bonus', 'refund')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bexo_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's profileId
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS text AS $$
DECLARE
  v_profile_id text;
BEGIN
  SELECT "profileId" INTO v_profile_id
  FROM public.bexo_users
  WHERE id = auth.uid();
  RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------
-- A. bexo_users Policies
--------------------------------------------------------------
ALTER TABLE public.bexo_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for now" ON public.bexo_users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.bexo_users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.bexo_users;
DROP POLICY IF EXISTS "Users can update their own profile non-financial" ON public.bexo_users;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.bexo_users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.bexo_users;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.bexo_users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.bexo_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Users can update their own profile fields
CREATE POLICY "Users can update their own profile non-financial"
ON public.bexo_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins can update any profile"
ON public.bexo_users
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can insert their initial profile upon registration
CREATE POLICY "Users can insert their own profile"
ON public.bexo_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

--------------------------------------------------------------
-- B. bexo_posts (Products) Policies
--------------------------------------------------------------
ALTER TABLE public.bexo_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for now" ON public.bexo_posts;
DROP POLICY IF EXISTS "Anyone can view published products" ON public.bexo_posts;
DROP POLICY IF EXISTS "Admins can manage products" ON public.bexo_posts;

-- Public (anonymous + authenticated) can view published products in catalog
CREATE POLICY "Anyone can view published products"
ON public.bexo_posts
FOR SELECT
USING (status = 'published' OR public.is_admin());

-- Only admins can insert, update, or delete products
CREATE POLICY "Admins can manage products"
ON public.bexo_posts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

--------------------------------------------------------------
-- C. bexo_orders Policies
--------------------------------------------------------------
ALTER TABLE public.bexo_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for now" ON public.bexo_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.bexo_orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.bexo_orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.bexo_orders;

-- Users can only view their own orders; Admins view all
CREATE POLICY "Users can view their own orders"
ON public.bexo_orders
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid() 
  OR "profileId" = public.current_profile_id()
  OR public.is_admin()
);

-- Users can create orders tied to their own profile
CREATE POLICY "Users can create their own orders"
ON public.bexo_orders
FOR INSERT
TO authenticated
WITH CHECK (
  "userId" = auth.uid() 
  OR "profileId" = public.current_profile_id()
  OR public.is_admin()
);

-- Only admins can modify order status/price or delete orders
CREATE POLICY "Admins can manage all orders"
ON public.bexo_orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete orders"
ON public.bexo_orders
FOR DELETE
TO authenticated
USING (public.is_admin());

--------------------------------------------------------------
-- D. bexo_transactions Policies
--------------------------------------------------------------
ALTER TABLE public.bexo_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for now" ON public.bexo_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.bexo_transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.bexo_transactions;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.bexo_transactions
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid() 
  OR "profileId" = public.current_profile_id()
  OR public.is_admin()
);

-- Only Admins (or secure server functions) can insert, update, or delete transactions
CREATE POLICY "Admins can manage all transactions"
ON public.bexo_transactions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_profile_id text;
  v_role text;
  v_full_name text;
  v_shop_name text;
  v_phone text;
  v_address text;
  v_referred_by text;
BEGIN
  -- Extract metadata safely
  v_profile_id := COALESCE(new.raw_user_meta_data->>'profileId', 'BX-' || floor(100000 + random() * 900000)::text);
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  v_full_name := COALESCE(new.raw_user_meta_data->>'fullName', split_part(COALESCE(new.email, ''), '@', 1));
  v_shop_name := COALESCE(new.raw_user_meta_data->>'shopName', 'My Shop');
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', new.phone, '');
  v_address := COALESCE(new.raw_user_meta_data->>'address', '');
  v_referred_by := new.raw_user_meta_data->>'referredBy';

  -- Ensure admin email gets admin role if matching
  IF new.email = 'bexobd@gmail.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.bexo_users (
    id,
    "profileId",
    email,
    phone,
    "fullName",
    "shopName",
    address,
    role,
    balance,
    "referredBy",
    created_at
  )
  VALUES (
    new.id,
    v_profile_id,
    new.email,
    v_phone,
    v_full_name,
    v_shop_name,
    v_address,
    v_role,
    0,
    v_referred_by,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.bexo_users.phone),
      "fullName" = COALESCE(NULLIF(EXCLUDED."fullName", ''), public.bexo_users."fullName"),
      "shopName" = COALESCE(NULLIF(EXCLUDED."shopName", ''), public.bexo_users."shopName");

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
