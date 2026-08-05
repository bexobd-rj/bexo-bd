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
  lastActive text
);

-- 2. Products Table (bexo_posts)
CREATE TABLE IF NOT EXISTS public.bexo_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders Table (bexo_orders)
CREATE TABLE IF NOT EXISTS public.bexo_orders (
  id text PRIMARY KEY,
  "profileId" text NOT NULL,
  "productId" text NOT NULL,
  title text NOT NULL,
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
  type text NOT NULL, 
  status text DEFAULT 'pending',
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
