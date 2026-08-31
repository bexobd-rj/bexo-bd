# Bexo BD - Implementation & Modernization Guide

## Overview

This guide walks you through how to incrementally modernize the Bexo BD codebase from a monolithic single-file app to a modular, maintainable TypeScript application.

---

## Phase 1: Module Extraction (Week 1-2)

### Goal
Break up the 1.5 MB `app.js` into focused modules while keeping everything working.

### Step 1.1: Create Auth Module

**Create:** `src/auth/index.ts`

```typescript
// src/auth/index.ts
import { supabase } from '../supabase/client';
import { validateEmail, validatePassword } from '../utils/validation';
import { normalizeProfile } from '../utils/format';

export interface LoginInput {
  identifier: string; // email or phone
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  // Input validation
  const cleanIdentifier = (input.identifier || '').trim().toLowerCase();
  const cleanPass = (input.password || '').trim();

  if (!cleanIdentifier || !cleanPass) {
    return {
      success: false,
      error: 'ইমেইল/ফোন এবং পাসওয়ার্ড প্রয়োজন',
    };
  }

  // Validate password format
  if (cleanPass.length < 6) {
    return {
      success: false,
      error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে',
    };
  }

  try {
    // Convert phone to email if needed
    let email = cleanIdentifier;
    if (cleanIdentifier.includes('@')) {
      email = cleanIdentifier;
    } else {
      // Phone → email conversion (if you have this logic)
      // email = await getEmailFromPhone(cleanIdentifier);
    }

    // Authenticate with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: cleanPass,
    });

    if (authError) {
      return {
        success: false,
        error: `লগইন ব্যর্থ: ${authError.message}`,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'অ্যাকাউন্ট পাওয়া যায়নি',
      };
    }

    // Fetch user profile
    const profile = await fetchUserProfile(data.user.id);

    if (!profile) {
      return {
        success: false,
        error: 'প্রোফাইল তথ্য পাওয়া যায়নি',
      };
    }

    return {
      success: true,
      user: data.user,
      profile,
    };
  } catch (err) {
    console.error('[Auth] Login exception:', err);
    return {
      success: false,
      error: 'লগইন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।',
    };
  }
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  shopName: string;
  phone?: string;
  address?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: any;
  needsEmailConfirmation?: boolean;
  error?: string;
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  // Input validation
  if (!validateEmail(input.email)) {
    return {
      success: false,
      error: 'বৈধ ইমেইল প্রয়োজন',
    };
  }

  if (!validatePassword(input.password)) {
    return {
      success: false,
      error: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে (অক্ষর, সংখ্যা, বিশেষ চিহ্ন সহ)',
    };
  }

  if (!input.fullName || input.fullName.trim().length < 2) {
    return {
      success: false,
      error: 'সম্পূর্ণ নাম প্রয়োজন',
    };
  }

  try {
    // Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          fullName: input.fullName,
          shopName: input.shopName,
          phone: input.phone,
          address: input.address,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: `রেজিস্ট্রেশন ব্যর্থ: ${authError.message}`,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে',
      };
    }

    // Create profile row in bexo_users
    const { error: profileError } = await supabase.from('bexo_users').insert([
      {
        id: authData.user.id,
        email: input.email,
        fullName: input.fullName,
        shopName: input.shopName,
        phone: input.phone,
        address: input.address,
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      console.error('[Auth] Profile creation error:', profileError);
      // Note: Auth account exists but profile doesn't - user can still reset password
    }

    return {
      success: true,
      user: authData.user,
      needsEmailConfirmation: !authData.session, // true if confirmation required
    };
  } catch (err) {
    console.error('[Auth] Register exception:', err);
    return {
      success: false,
      error: 'রেজিস্ট্রেশন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।',
    };
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.clear();
  // Unsubscribe from realtime
  // Redirect to login
}

async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('bexo_users')
    .select('id, email, fullName, shopName, phone, address, role, profileImage')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Auth] Profile fetch error:', error);
    return null;
  }

  return normalizeProfile(data);
}
```

### Step 1.2: Create Profile Module

**Create:** `src/profile/index.ts`

```typescript
// src/profile/index.ts
import { supabase } from '../supabase/client';
import { Profile, ProfileUpdate } from '../types';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('bexo_users')
    .select('id, email, fullName, shopName, phone, address, profileImage, balance, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Profile] Fetch error:', error);
    return null;
  }

  // Remove any password fields (safety measure)
  if (data) {
    delete (data as any).password;
    delete (data as any).enc_password;
  }

  return data as Profile || null;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<boolean> {
  // Sanitize: remove password fields
  const sanitized = { ...updates };
  delete (sanitized as any).password;
  delete (sanitized as any).enc_password;

  const { error } = await supabase
    .from('bexo_users')
    .update(sanitized)
    .eq('id', userId);

  if (error) {
    console.error('[Profile] Update error:', error);
    return false;
  }

  return true;
}

export function subscribeToProfile(
  userId: string,
  onProfileChange: (profile: Profile) => void
) {
  const channel = supabase
    .channel(`profile_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bexo_users',
        filter: `id=eq.${userId}`,
      },
      async () => {
        // Fetch fresh profile
        const profile = await fetchProfile(userId);
        if (profile) {
          onProfileChange(profile);
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
```

### Step 1.3: Create Validation Utilities

**Create:** `src/utils/validation.ts`

```typescript
// src/utils/validation.ts

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Bangladesh phone: +880XXXXXXXXXX or 01XXXXXXXXX
  const regex = /^(01|\\+8801)[3-9]\d{8}$/;
  return regex.test(phone);
}

export function validatePassword(password: string): boolean {
  // Min 8 chars, must include letter, number, special char
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
}

export function validateBDTaka(amount: number): boolean {
  return amount > 0 && amount <= 10000000; // Max 1 crore
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegisterForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'বৈধ ইমেইল প্রয়োজন' });
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push({
      field: 'password',
      message: 'পাসওয়ার্ড অন্তত ৮ অক্ষর (অক্ষর, সংখ্যা, বিশেষ চিহ্ন প্রয়োজন)',
    });
  }

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'সম্পূর্ণ নাম প্রয়োজন' });
  }

  if (!data.shopName || data.shopName.trim().length < 2) {
    errors.push({ field: 'shopName', message: 'দোকানের নাম প্রয়োজন' });
  }

  return errors;
}
```

### Step 1.4: Create Types File

**Create/Update:** `src/types.ts`

```typescript
// src/types.ts

export interface User {
  id: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  shopName: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  balance: number;
  role: 'admin' | 'user' | 'collector';
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

export interface Product {
  id: string;
  userId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category: string;
  quantity: number;
  sku?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  products: Product[];
  currentMenu: string;
  theme: 'light' | 'dark';
}
```

### Step 1.5: Update Main App File

**Update:** `src/main.ts` (create if doesn't exist)

```typescript
// src/main.ts
import { login, register, logout } from './auth';
import { fetchProfile, subscribeToProfile } from './profile';
import { supabase } from './supabase/client';
import { renderHome, renderLogin } from './ui/pages';

// Global state (will be replaced with proper state management in Phase 2)
let currentUser: any = null;
let currentProfile: any = null;
let profileUnsubscribe: (() => void) | null = null;

export async function initializeApp() {
  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    const profile = await fetchProfile(session.user.id);
    if (profile) {
      currentProfile = profile;
      setupProfileSync(session.user.id);
      renderHome();
    }
  } else {
    renderLogin();
  }

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      setupProfileSync(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      currentProfile = null;
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
      renderLogin();
    }
  });
}

function setupProfileSync(userId: string) {
  if (profileUnsubscribe) {
    profileUnsubscribe();
  }
  profileUnsubscribe = subscribeToProfile(userId, (profile) => {
    currentProfile = profile;
    updateUI(); // Re-render UI with new profile
  });
}

export async function handleLogin(email: string, password: string) {
  const result = await login({ identifier: email, password });
  if (result.success) {
    currentUser = result.user;
    currentProfile = result.profile;
    setupProfileSync(result.user.id);
    renderHome();
    return { success: true };
  } else {
    return { success: false, error: result.error };
  }
}

export async function handleRegister(data: any) {
  const result = await register(data);
  if (result.success) {
    if (result.needsEmailConfirmation) {
      return {
        success: true,
        message: 'আপনার ইমেইল নিশ্চিত করতে লিংকে ক্লিক করুন',
      };
    }
    currentUser = result.user;
    renderHome();
    return { success: true };
  } else {
    return { success: false, error: result.error };
  }
}

export async function handleLogout() {
  await logout();
  if (profileUnsubscribe) {
    profileUnsubscribe();
  }
  renderLogin();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## Phase 2: State Management (Week 3-4)

### Goal
Replace global variables with proper state management using Zustand.

### Step 2.1: Install Zustand

```bash
npm install zustand
```

### Step 2.2: Create Auth Store

**Create:** `src/store/authStore.ts`

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { User, Profile, AuthState } from '../types';
import { login, logout } from '../auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  performLogin: (email: string, password: string) => Promise<boolean>;
  performLogout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  performLogin: async (email, password) => {
    set({ loading: true, error: null });
    const result = await login({ identifier: email, password });
    if (result.success) {
      set({
        isAuthenticated: true,
        user: result.user,
        profile: result.profile,
        loading: false,
      });
      return true;
    } else {
      set({
        isAuthenticated: false,
        error: result.error,
        loading: false,
      });
      return false;
    }
  },

  performLogout: async () => {
    set({ loading: true });
    await logout();
    set({
      isAuthenticated: false,
      user: null,
      profile: null,
      loading: false,
      error: null,
    });
  },
}));
```

### Step 2.3: Update UI Components to Use Store

```typescript
// src/ui/pages/login.ts
import { useAuthStore } from '../../store/authStore';
import { validateEmail, validatePassword } from '../../utils/validation';

export function renderLoginPage() {
  const { performLogin, error, loading } = useAuthStore();

  // Create form
  const form = document.createElement('form');

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'ইমেইল';
  emailInput.required = true;

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'পাসওয়ার্ড';
  passwordInput.required = true;

  const submitButton = document.createElement('button');
  submitButton.textContent = loading ? 'লগইন হচ্ছে...' : 'লগইন';
  submitButton.disabled = loading;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = await performLogin(emailInput.value, passwordInput.value);
    if (!success) {
      alert(error || 'লগইন ব্যর্থ');
    }
  });

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);

  if (error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = error;
    form.insertBefore(errorDiv, form.firstChild);
  }

  return form;
}
```

---

## Phase 3: Component System (Week 5-6)

### Goal
Create reusable UI components with consistent styling.

### Step 3.1: Create Button Component

**Create:** `src/ui/components/Button.ts`

```typescript
// src/ui/components/Button.ts

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function createButton(props: ButtonProps): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = props.type || 'button';
  button.textContent = props.loading ? 'লোড হচ্ছে...' : props.text;
  button.disabled = props.disabled || props.loading || false;

  // Styling based on variant and size
  const variantClass = `btn-${props.variant || 'primary'}`;
  const sizeClass = `btn-${props.size || 'md'}`;
  button.className = `btn ${variantClass} ${sizeClass}`;

  if (props.onClick) {
    button.addEventListener('click', props.onClick);
  }

  return button;
}
```

### Step 3.2: Create Input Component

**Create:** `src/ui/components/Input.ts`

```typescript
// src/ui/components/Input.ts

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function createInput(props: InputProps): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'form-group';

  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    container.appendChild(label);
  }

  const input = document.createElement('input');
  input.type = props.type || 'text';
  input.placeholder = props.placeholder || '';
  input.value = props.value || '';
  input.required = props.required || false;
  input.className = props.error ? 'input input-error' : 'input';

  if (props.onChange) {
    input.addEventListener('change', (e) => {
      props.onChange?.((e.target as HTMLInputElement).value);
    });
  }

  container.appendChild(input);

  if (props.error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = props.error;
    container.appendChild(errorDiv);
  }

  return container;
}
```

---

## Phase 4: Error Handling (Week 7)

### Step 4.1: Create Error Boundary

**Create:** `src/utils/errorHandling.ts`

```typescript
// src/utils/errorHandling.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: any): string {
  console.error('[Error]', error);

  if (error instanceof AppError) {
    switch (error.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        return 'ইমেইল বা পাসওয়ার্ড ভুল';
      case 'AUTH_EMAIL_NOT_CONFIRMED':
        return 'অনুগ্রহ করে আপনার ইমেইল নিশ্চিত করুন';
      case 'PROFILE_NOT_FOUND':
        return 'প্রোফাইল পাওয়া যায়নি';
      case 'DATABASE_ERROR':
        return 'ডাটাবেস সংযোগে সমস্যা। পুনরায় চেষ্টা করুন।';
      default:
        return error.message;
    }
  }

  if (error.code === 'PGRST116') {
    return 'প্রবেশাধিকার নেই';
  }

  return 'একটি অপ্রত্যাশিত ত্রুটি হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
}

export async function withErrorBoundary<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[${context}]`, error);
    throw new AppError('UNKNOWN_ERROR', handleError(error));
  }
}
```

---

## Phase 5: Testing (Week 8)

### Step 5.1: Setup Vitest

```bash
npm install -D vitest @testing-library/dom @testing-library/user-event
```

**Create:** `vitest.config.ts`

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### Step 5.2: Write Auth Tests

**Create:** `src/auth/__tests__/auth.test.ts`

```typescript
// src/auth/__tests__/auth.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../../utils/validation';

describe('Authentication Validation', () => {
  it('validates email format', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('validates password strength', () => {
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('NoNumber!')).toBe(false);
    expect(validatePassword('SecureP@ssw0rd')).toBe(true);
  });
});
```

---

## Deployment Timeline

```
Week 1-2: Module Extraction ✅
Week 3-4: State Management
Week 5-6: Component System
Week 7: Error Handling
Week 8: Testing
Week 9: Deployment & Monitoring
```

---

## Monitoring & Logging

### Create Logging Service

**Create:** `src/utils/logging.ts`

```typescript
// src/utils/logging.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];

  log(level: LogLevel, context: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };

    this.logs.push(entry);

    // Console output
    const color = this.getColor(level);
    console.log(`%c[${context}] ${message}`, `color: ${color}`, data);

    // In production, send to logging service (e.g., Sentry, LogRocket)
    if (level >= LogLevel.WARN) {
      this.sendToRemote(entry);
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'gray';
      case LogLevel.INFO:
        return 'blue';
      case LogLevel.WARN:
        return 'orange';
      case LogLevel.ERROR:
        return 'red';
    }
  }

  private sendToRemote(entry: LogEntry) {
    // Send to Sentry, LogRocket, or your own server
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify(entry),
      }).catch(() => {}); // Silently fail
    }
  }

  debug(context: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: any) {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, context, message, data);
  }
}

export const logger = new Logger();
```

---

## Performance Optimization Checklist

- [ ] Lazy load admin panel (only load when needed)
- [ ] Code split product list (render virtual list for large datasets)
- [ ] Cache Supabase queries with SWR or React Query
- [ ] Implement service worker for offline support
- [ ] Optimize images (WebP, responsive sizes)
- [ ] Minify CSS (move from CDN to bundled)
- [ ] Implement error tracking (Sentry)
- [ ] Add performance monitoring (Web Vitals)
- [ ] Use compression (gzip, brotli)
- [ ] Implement lazy routing

---

## Security Checklist

- [x] Remove admin backdoor
- [x] Remove client-side password fallback
- [x] Remove password storage in database
- [ ] Add rate limiting
- [ ] Add CSRF protection
- [ ] Add input sanitization
- [ ] Add XSS protection
- [ ] Implement 2FA
- [ ] Add audit logging
- [ ] Regular security audits

---

## Success Metrics

By end of Phase 1-5, you should have:

✅ 60% reduction in main file size (1.5 MB → 600 KB)  
✅ 100+ unit tests with >80% coverage  
✅ <3 second page load time  
✅ Zero auth vulnerabilities  
✅ 99.5% uptime  
✅ Ability to add features in <1 day  
✅ <5 minute deployment process

---

**Ready to start modernizing?** Begin with Phase 1: Module Extraction. It takes just 2 weeks and immediately improves maintainability.
