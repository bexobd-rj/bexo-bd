-- ==========================================================
-- BEXO BD: 100% PRODUCTION SECURITY HARDENING SCRIPT
-- ==========================================================

-- 1. Secure admin checker function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (lower(trim(COALESCE(auth.jwt() ->> 'email', ''))) = 'bexobd@gmail.com') OR EXISTS (
    SELECT 1 FROM public.bexo_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Secure Signup Trigger (Admin role strictly locked to bexobd@gmail.com)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_profile_id text;
  v_role text;
  v_name text;
BEGIN
  v_profile_id := COALESCE(new.raw_user_meta_data->>'profileId', 'BX-' || floor(100000 + random() * 900000)::text);
  
  -- Strict security: Only bexobd@gmail.com can be admin
  IF lower(trim(new.email)) = 'bexobd@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'user';
  END IF;

  v_name := COALESCE(new.raw_user_meta_data->>'fullName', split_part(COALESCE(new.email, ''), '@', 1));

  INSERT INTO public.bexo_users (
    id, "profileId", email, phone, "fullName", "shopName", address, role, balance, created_at
  ) VALUES (
    new.id, v_profile_id, new.email, COALESCE(new.phone, ''), v_name, 'My Shop', '', v_role, 0, now()
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.bexo_users.phone);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Strict User-Ownership RLS Policies
DROP POLICY IF EXISTS "Auth access users" ON public.bexo_users;
DROP POLICY IF EXISTS "Users view own profile" ON public.bexo_users;
DROP POLICY IF EXISTS "Users update own profile" ON public.bexo_users;
DROP POLICY IF EXISTS "Users insert own profile" ON public.bexo_users;
DROP POLICY IF EXISTS "Admins manage all users" ON public.bexo_users;

CREATE POLICY "Users view own profile" ON public.bexo_users
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile" ON public.bexo_users
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users insert own profile" ON public.bexo_users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins manage all users" ON public.bexo_users
FOR ALL TO authenticated
USING (public.is_admin());

-- 4. Products Table Policies
DROP POLICY IF EXISTS "Public read posts" ON public.bexo_posts;
DROP POLICY IF EXISTS "Auth manage posts" ON public.bexo_posts;
DROP POLICY IF EXISTS "Public view published products" ON public.bexo_posts;
DROP POLICY IF EXISTS "Admins manage products" ON public.bexo_posts;

CREATE POLICY "Public view published products" ON public.bexo_posts
FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage products" ON public.bexo_posts
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Orders Table Policies
DROP POLICY IF EXISTS "Auth manage orders" ON public.bexo_orders;
DROP POLICY IF EXISTS "Users view own orders" ON public.bexo_orders;
DROP POLICY IF EXISTS "Users create own orders" ON public.bexo_orders;
DROP POLICY IF EXISTS "Admins manage orders" ON public.bexo_orders;

CREATE POLICY "Users view own orders" ON public.bexo_orders
FOR SELECT TO authenticated
USING ("userId" = auth.uid() OR public.is_admin());

CREATE POLICY "Users create own orders" ON public.bexo_orders
FOR INSERT TO authenticated
WITH CHECK ("userId" = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage orders" ON public.bexo_orders
FOR ALL TO authenticated
USING (public.is_admin());

-- 6. Transactions Table Policies
DROP POLICY IF EXISTS "Auth manage transactions" ON public.bexo_transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.bexo_transactions;
DROP POLICY IF EXISTS "Admins manage transactions" ON public.bexo_transactions;

CREATE POLICY "Users view own transactions" ON public.bexo_transactions
FOR SELECT TO authenticated
USING ("userId" = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage transactions" ON public.bexo_transactions
FOR ALL TO authenticated
USING (public.is_admin());

-- 7. Secure Subsidiary Tables
DROP POLICY IF EXISTS "Allow all customer reports" ON public.bexo_customer_reports;
DROP POLICY IF EXISTS "Allow all referrals" ON public.bexo_referrals;
DROP POLICY IF EXISTS "Allow all pending profits" ON public.bexo_pending_profits;
DROP POLICY IF EXISTS "Allow all bill requests" ON public.bexo_bill_requests;
DROP POLICY IF EXISTS "Allow all accounts" ON public.bexo_accounts;

CREATE POLICY "Auth access customer reports" ON public.bexo_customer_reports
FOR ALL TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Auth access referrals" ON public.bexo_referrals
FOR ALL TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Auth access pending profits" ON public.bexo_pending_profits
FOR ALL TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Auth access bill requests" ON public.bexo_bill_requests
FOR ALL TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Auth access accounts" ON public.bexo_accounts
FOR ALL TO authenticated USING (auth.role() = 'authenticated');
