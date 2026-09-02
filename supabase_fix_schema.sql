-- ==========================================================
-- BEXO BD: SAFE MIGRATION & REPAIR SCRIPT FOR SUPABASE
-- Run this in Supabase SQL Editor
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FIX bexo_users TABLE
CREATE TABLE IF NOT EXISTS public.bexo_users (
  id uuid PRIMARY KEY,
  "profileId" text UNIQUE,
  email text,
  phone text,
  "fullName" text,
  "shopName" text,
  address text,
  role text DEFAULT 'user',
  balance numeric DEFAULT 0,
  "referredBy" text,
  "lastActive" text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS "profileId" text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS "fullName" text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS "shopName" text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 0;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS "referredBy" text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS "lastActive" text;
ALTER TABLE public.bexo_users ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- 2. FIX bexo_posts TABLE (Products)
CREATE TABLE IF NOT EXISTS public.bexo_posts (
  id text PRIMARY KEY,
  title text,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  stock integer DEFAULT 0,
  category text,
  sku text,
  description text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'published',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS profit numeric DEFAULT 0;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.bexo_posts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. FIX bexo_orders TABLE
CREATE TABLE IF NOT EXISTS public.bexo_orders (
  id text PRIMARY KEY,
  "userId" uuid,
  "profileId" text,
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
  status text DEFAULT 'Pending',
  tracking_link text,
  items jsonb DEFAULT '[]'::jsonb,
  date timestamp with time zone DEFAULT now()
);
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "userId" uuid;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "profileId" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "productId" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS profit numeric DEFAULT 0;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "totalPrice" numeric DEFAULT 0;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "customerName" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "customerPhone" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "customerAddress" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "deliveryZone" text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "deliveryCharge" numeric DEFAULT 0;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS "sellingPrice" numeric DEFAULT 0;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS tracking_link text;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.bexo_orders ADD COLUMN IF NOT EXISTS date timestamp with time zone DEFAULT now();

-- 4. FIX bexo_transactions TABLE
CREATE TABLE IF NOT EXISTS public.bexo_transactions (
  id text PRIMARY KEY,
  "userId" uuid,
  "profileId" text,
  amount numeric DEFAULT 0,
  type text,
  status text DEFAULT 'pending',
  description text,
  date timestamp with time zone DEFAULT now()
);
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS "userId" uuid;
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS "profileId" text;
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0;
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.bexo_transactions ADD COLUMN IF NOT EXISTS date timestamp with time zone DEFAULT now();

-- 5. CREATE OTHER REQUIRED APP TABLES IF NOT PRESENT
CREATE TABLE IF NOT EXISTS public.bexo_customer_reports (
  id text PRIMARY KEY,
  data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_referrals (
  id text PRIMARY KEY,
  "referrerId" text,
  "refereeId" text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_pending_profits (
  id text PRIMARY KEY,
  "profileId" text,
  amount numeric DEFAULT 0,
  "orderId" text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_bill_requests (
  id text PRIMARY KEY,
  "profileId" text,
  amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_accounts (
  id text PRIMARY KEY,
  "profileId" text,
  type text,
  number text,
  name text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_settings (
  id text PRIMARY KEY,
  data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bexo_categories (
  id text PRIMARY KEY,
  name text,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bexo_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.bexo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_customer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_pending_profits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_bill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bexo_categories ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES FOR SECURE ACCESS
DO $$
BEGIN
  -- bexo_users
  DROP POLICY IF EXISTS "Users view own profile" ON public.bexo_users;
  DROP POLICY IF EXISTS "Users update own profile" ON public.bexo_users;
  DROP POLICY IF EXISTS "Users insert own profile" ON public.bexo_users;
  DROP POLICY IF EXISTS "Admins all on users" ON public.bexo_users;
  
  CREATE POLICY "Users view own profile" ON public.bexo_users FOR SELECT USING (auth.uid() = id OR public.is_admin());
  CREATE POLICY "Users update own profile" ON public.bexo_users FOR UPDATE USING (auth.uid() = id OR public.is_admin());
  CREATE POLICY "Users insert own profile" ON public.bexo_users FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
  CREATE POLICY "Admins all on users" ON public.bexo_users FOR ALL USING (public.is_admin());

  -- bexo_posts
  DROP POLICY IF EXISTS "Public view posts" ON public.bexo_posts;
  DROP POLICY IF EXISTS "Admins manage posts" ON public.bexo_posts;
  CREATE POLICY "Public view posts" ON public.bexo_posts FOR SELECT USING (true);
  CREATE POLICY "Admins manage posts" ON public.bexo_posts FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated');

  -- bexo_orders
  DROP POLICY IF EXISTS "Users manage own orders" ON public.bexo_orders;
  CREATE POLICY "Users manage own orders" ON public.bexo_orders FOR ALL USING (auth.role() = 'authenticated');

  -- bexo_transactions
  DROP POLICY IF EXISTS "Users manage transactions" ON public.bexo_transactions;
  CREATE POLICY "Users manage transactions" ON public.bexo_transactions FOR ALL USING (auth.role() = 'authenticated');

  -- Other tables
  DROP POLICY IF EXISTS "Auth access customer reports" ON public.bexo_customer_reports;
  DROP POLICY IF EXISTS "Auth access referrals" ON public.bexo_referrals;
  DROP POLICY IF EXISTS "Auth access pending profits" ON public.bexo_pending_profits;
  DROP POLICY IF EXISTS "Auth access bill requests" ON public.bexo_bill_requests;
  DROP POLICY IF EXISTS "Auth access accounts" ON public.bexo_accounts;
  DROP POLICY IF EXISTS "Public access settings" ON public.bexo_settings;
  DROP POLICY IF EXISTS "Public access categories" ON public.bexo_categories;

  CREATE POLICY "Auth access customer reports" ON public.bexo_customer_reports FOR ALL USING (auth.role() = 'authenticated');
  CREATE POLICY "Auth access referrals" ON public.bexo_referrals FOR ALL USING (auth.role() = 'authenticated');
  CREATE POLICY "Auth access pending profits" ON public.bexo_pending_profits FOR ALL USING (auth.role() = 'authenticated');
  CREATE POLICY "Auth access bill requests" ON public.bexo_bill_requests FOR ALL USING (auth.role() = 'authenticated');
  CREATE POLICY "Auth access accounts" ON public.bexo_accounts FOR ALL USING (auth.role() = 'authenticated');
  CREATE POLICY "Public access settings" ON public.bexo_settings FOR ALL USING (true);
  CREATE POLICY "Public access categories" ON public.bexo_categories FOR ALL USING (true);
END $$;

-- 9. USER SYNC TRIGGER (Ensures profileId stays the exact same across all devices)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_profile_id text;
  v_role text;
  v_full_name text;
  v_shop_name text;
BEGIN
  v_profile_id := COALESCE(new.raw_user_meta_data->>'profileId', 'BX-' || floor(100000 + random() * 900000)::text);
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  v_full_name := COALESCE(new.raw_user_meta_data->>'fullName', split_part(COALESCE(new.email, ''), '@', 1));
  v_shop_name := COALESCE(new.raw_user_meta_data->>'shopName', 'My Shop');

  IF new.email = 'bexobd@gmail.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.bexo_users (
    id, "profileId", email, phone, "fullName", "shopName", address, role, balance, "referredBy", created_at
  ) VALUES (
    new.id, v_profile_id, new.email, COALESCE(new.phone, ''), v_full_name, v_shop_name, '', v_role, 0, new.raw_user_meta_data->>'referredBy', now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.bexo_users.phone),
      "fullName" = COALESCE(NULLIF(EXCLUDED."fullName", ''), public.bexo_users."fullName");

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
