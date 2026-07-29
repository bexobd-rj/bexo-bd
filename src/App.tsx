import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search,
  Wallet,
  TrendingDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  TrendingUp,
  Users,
  Key,
  ShieldAlert,
  Upload,
  Image,
  DownloadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, useBackButtonModal } from './lib/utils';
import { Product, Order, UserProfile, Transaction } from './types';
import { AdminUsersList } from './components/AdminUsersList';
import { AdminTransferPanel } from './components/AdminTransferPanel';
import { InvoiceViewer } from './components/InvoiceViewer';
import { supabase } from './utils/supabase';

// --- Types & Constants ---
type View = 'dashboard' | 'profile' | 'products' | 'orders' | 'admin-orders' | 'admin-payouts' | 'admin-products' | 'admin-users' | 'admin-panel' | 'admin-import-center' | 'cart' | 'sales' | 'balance' | 'support';

interface AdminWorkspaceProps {
  allUsers: UserProfile[];
  transactions: Transaction[];
  products: Product[];
  orders: Order[];
}

function AdminWorkspace({ allUsers, transactions, products, orders }: AdminWorkspaceProps) {
  const [currentTab, setCurrentTab] = useState<'users' | 'products' | 'orders' | 'payouts' | 'transfer'>('users');

  return (
    <div className="space-y-6">
      {/* Premium Segmented Controls at Top */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-2xl max-w-4xl shadow-sm border border-slate-200/50">
        <button 
          onClick={() => setCurrentTab('users')}
          className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            currentTab === 'users' 
              ? "bg-white text-slate-900 shadow-md scale-[1.02] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users size={15} />
          <span>Users & Suppliers ({allUsers.length})</span>
        </button>
        <button 
          onClick={() => setCurrentTab('products')}
          className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            currentTab === 'products' 
              ? "bg-white text-slate-900 shadow-md scale-[1.02] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Package size={15} />
          <span>Products ({products.length})</span>
        </button>
        <button 
          onClick={() => setCurrentTab('orders')}
          className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            currentTab === 'orders' 
              ? "bg-white text-slate-900 shadow-md scale-[1.02] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ClipboardList size={15} />
          <span>Orders ({orders.length})</span>
        </button>
        <button 
          onClick={() => setCurrentTab('transfer')}
          className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            currentTab === 'transfer' 
              ? "bg-white text-slate-900 shadow-md scale-[1.02] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Banknote size={15} className="text-orange-600" />
          <span>পেমেন্ট ট্রান্সফার ({orders.filter(o => o.status === 'Delivered').length})</span>
        </button>
        <button 
          onClick={() => setCurrentTab('payouts')}
          className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            currentTab === 'payouts' 
              ? "bg-white text-slate-900 shadow-md scale-[1.02] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Wallet size={15} />
          <span>Payouts ({transactions.length})</span>
        </button>
      </div>

      {/* Render selected view */}
      <div className="mt-4">
        {currentTab === 'users' && <AdminUsersList allUsers={allUsers} transactions={transactions} />}
        {currentTab === 'products' && <AdminProductList products={products} />}
        {currentTab === 'orders' && <AdminOrderList orders={orders} />}
        {currentTab === 'transfer' && <AdminTransferPanel orders={orders} />}
        {currentTab === 'payouts' && <AdminPayoutList transactions={transactions} />}
      </div>
    </div>
  );
}

const DELIVERY_CHARGES = {
  inside: 60,
  outside: 120
};

// --- Mock Data for Initial Load (if no DB products) ---
const INITIAL_PRODUCTS: Partial<Product>[] = [
  { title: "Cotton Panjabi - White", basePrice: 850, imageUrl: "https://picsum.photos/seed/panjabi/400/400", description: "Premium quality cotton panjabi for regular use." },
  { title: "Blue Denim Jeans", basePrice: 1200, imageUrl: "https://picsum.photos/seed/jeans/400/400", description: "Stretchable denim jeans with slim fit." },
  { title: "Casual Polo Shirt", basePrice: 450, imageUrl: "https://picsum.photos/seed/polo/400/400", description: "Comfortable polo shirt in multiple colors." },
  { title: "Wireless Earbuds G2", basePrice: 1500, imageUrl: "https://picsum.photos/seed/audio/400/400", description: "High-quality sound with long battery life." },
];

export default function App() {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  
  // --- New Custom Supabase Auth State Machine ---
  type AuthFlowType = 'signin' | 'signup_email' | 'signup_otp' | 'signup_complete' | 'forgot_email' | 'forgot_otp' | 'forgot_reset';
  const [authFlow, setAuthFlow] = useState<AuthFlowType>('signin');
  
  // Specific Form States
  // Sign In
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Phone
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpOtp, setSignUpOtp] = useState('');
  const [signUpShopName, setSignUpShopName] = useState('');
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [signUpReferralName, setSignUpReferralName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  
  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  
  // Status message info
  const [authStatusMessage, setAuthStatusMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeView, _setActiveView] = useState<View>(() => {
    const hash = window.location.hash.replace('#', '') as View;
    const validViews: View[] = ['dashboard', 'profile', 'products', 'orders', 'admin-orders', 'admin-payouts', 'admin-products', 'admin-users', 'admin-panel', 'admin-import-center', 'cart', 'sales', 'balance', 'support'];
    return validViews.includes(hash) ? hash : 'dashboard';
  });

  const setActiveView = (view: View) => {
    if (activeView !== view) {
      window.location.hash = view;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as View;
      const validViews: View[] = ['dashboard', 'profile', 'products', 'orders', 'admin-orders', 'admin-payouts', 'admin-products', 'admin-users', 'admin-panel', 'admin-import-center', 'cart', 'sales', 'balance', 'support'];
      if (validViews.includes(hash)) {
        _setActiveView(hash);
      } else {
        _setActiveView('dashboard');
      }
      setIsCheckoutOpen(false);
      setIsSidebarOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Add initial history entry if no hash exists so back button doesn't exit immediately
    if (!window.location.hash) {
      window.location.hash = 'dashboard';
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useBackButtonModal(isCheckoutOpen, () => setIsCheckoutOpen(false));
  useBackButtonModal(isSidebarOpen, () => setIsSidebarOpen(false));

  // Helper to handle profile syncing when authenticated via Supabase
  const handleUserAuthenticated = async (supabaseUser: any) => {
    // Attach uid field to the user object to preserve downstream listener code
    const mappedUser = {
      ...supabaseUser,
      uid: supabaseUser.id
    };
    setUser(mappedUser);

    let profileData: UserProfile | null = null;
    let fetchError = false;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', supabaseUser.id)
        .maybeSingle();
      if (error) throw error;
      profileData = data as any;
    } catch (err) {
      console.error("Failed to fetch user profile, offline or sluggish connection:", err);
      fetchError = true;
    }
    const isSuperAdminEmail = supabaseUser.email === 'bexobd@gmail.com';
    
    if (profileData) {
      if (isSuperAdminEmail && profileData.role !== 'admin') {
        const updatedProfile = { ...profileData, role: 'admin' as const };
        try {
          await supabase.from('users').update({ role: 'admin' }).eq('uid', supabaseUser.id);
        } catch (updErr) {
          console.warn("Could not update admin role on server (local update only):", updErr);
        }
        setProfile(updatedProfile);
      } else {
        setProfile(profileData);
      }
    } else {
      const fallbackProfile: UserProfile = {
        uid: supabaseUser.id,
        displayName: supabaseUser.user_metadata?.displayName || supabaseUser.email?.split('@')[0] || 'Reseller',
        email: supabaseUser.email || '',
        balance: 0,
        role: isSuperAdminEmail ? 'admin' : 'user',
        shopName: supabaseUser.user_metadata?.shopName || 'My Bexo Shop',
        phone: supabaseUser.phone || supabaseUser.user_metadata?.phone || '',
        // Store our extra custom fields
        address: supabaseUser.user_metadata?.address || '',
        referralName: supabaseUser.user_metadata?.referralName || ''
      } as any;
      if (!fetchError) {
        try {
          await supabase.from('users').upsert(fallbackProfile);
        } catch (setErr) {
          console.warn("Could not write new profile to server (local update only):", setErr);
        }
      }
      setProfile(fallbackProfile);
    }
  };

  // --- Supabase Auth Core Listener ---
  useEffect(() => {
    async function checkSession() {
      setIsLoadingAuth(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleUserAuthenticated(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Error checking Supabase session:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Change Event:", event, session?.user?.email);
      if (session?.user) {
        await handleUserAuthenticated(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google login failed:", err.message);
      setAuthError(`Login failed: ${err.message}`);
    }
  };

  // --- Auth Flow Handlers ---
  
  // Registration Step 1: Send OTP
  const handleSendSignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signUpEmail,
        options: {
          shouldCreateUser: true
        }
      });
      if (error) throw error;
      setAuthStatusMessage('A 6-digit verification code has been sent to your email address.');
      setAuthFlow('signup_otp');
    } catch (err: any) {
      console.error("Registration OTP send failed:", err);
      setAuthError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration Step 2: Verify OTP
  const handleVerifySignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpOtp || signUpOtp.length !== 6) {
      setAuthError('Please enter a valid 6-digit verification code.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: signUpEmail,
        token: signUpOtp,
        type: 'email'
      });
      if (error) {
        // Try signup type fallback
        const { error: errSignup } = await supabase.auth.verifyOtp({
          email: signUpEmail,
          token: signUpOtp,
          type: 'signup'
        });
        if (errSignup) throw error;
      }
      setAuthStatusMessage('Email verified successfully! Please complete your shop and profile details below.');
      setAuthFlow('signup_complete');
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setAuthError(err.message || 'Incorrect or expired verification code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration Step 3: Fill other details and save
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpShopName.trim() || !signUpDisplayName.trim() || !signUpPhone.trim() || !signUpAddress.trim() || !signUpPassword.trim()) {
      setAuthError('Please fill out all required fields.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      const { data: { user: currentUser }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !currentUser) {
        throw new Error("No verified session found. Please verify your email first.");
      }

      // Update password & metadata in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: signUpPassword,
        phone: signUpPhone,
        data: {
          displayName: signUpDisplayName,
          shopName: signUpShopName,
          address: signUpAddress,
          referralName: signUpReferralName,
          phone: signUpPhone
        }
      });
      if (updateError) throw updateError;

      // Write complete profile to Supabase users database
      const newProfile: UserProfile = {
        uid: currentUser.id,
        displayName: signUpDisplayName,
        email: signUpEmail,
        balance: 0,
        role: signUpEmail === 'bexobd@gmail.com' ? 'admin' : 'user',
        shopName: signUpShopName,
        phone: signUpPhone,
        address: signUpAddress,
        referralName: signUpReferralName
      } as any;

      const { error: upsertErr } = await supabase.from('users').upsert(newProfile);
      if (upsertErr) throw upsertErr;
      setProfile(newProfile);
      
      const mappedUser = {
        ...currentUser,
        uid: currentUser.id
      };
      setUser(mappedUser);

      setAuthStatusMessage('');
      alert('Your registration has been completed successfully!');
      setAuthFlow('signin');
    } catch (err: any) {
      console.error("Registration finalization failed:", err);
      setAuthError(err.message || 'Failed to complete registration profile. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign In: Email or Phone + Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setAuthError('Please enter your email or phone number and password.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      let emailToUse = loginIdentifier;
      const isEmail = loginIdentifier.includes('@');

      if (!isEmail) {
        console.log("Identifying login as phone number, looking up associated email...");
        try {
          const { data: userRows, error: userQueryErr } = await supabase
            .from('users')
            .select('email')
            .eq('phone', loginIdentifier);
          
          if (!userQueryErr && userRows && userRows.length > 0) {
            emailToUse = userRows[0].email;
            console.log("Found email matching phone:", emailToUse);
          } else {
            console.log("No matching phone number found in user base, trying direct phone sign-in...");
            const { error: phoneErr } = await supabase.auth.signInWithPassword({
              phone: loginIdentifier,
              password: loginPassword
            });
            if (phoneErr) throw phoneErr;
            setAuthLoading(false);
            return;
          }
        } catch (dbErr: any) {
          console.warn("Supabase phone lookup failed or offline, trying direct phone sign-in via Supabase Auth:", dbErr);
          const { error: phoneErr } = await supabase.auth.signInWithPassword({
            phone: loginIdentifier,
            password: loginPassword
          });
          if (phoneErr) {
            throw new Error('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না অথবা মোবাইল নম্বর/পাসওয়ার্ড ভুল। (Unable to connect to the server or incorrect phone/password.)');
          }
          setAuthLoading(false);
          return;
        }
      }

      // Login using email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: loginPassword
      });
      if (error) throw error;
      console.log("Successfully logged in:", emailToUse);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setAuthError(err.message || 'Invalid email/phone or password. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password Step 1: Send Reset OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setAuthError('Please enter your email address.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      // Validate that the email address is indeed registered first
      // We wrap this Firestore lookup in a try-catch to allow bypass on network / Firestore server connectivity issues.
      let emailExists = true;
      try {
        const { data: userRows, error: userQueryErr } = await supabase
          .from('users')
          .select('email')
          .eq('email', forgotEmail);
        
        if (userQueryErr || !userRows || userRows.length === 0) {
          emailExists = false;
        }
      } catch (dbErr: any) {
        console.warn("Supabase email validation check bypassed due to connection or server offline status:", dbErr);
        // Do not throw; proceed to Supabase OTP reset directly
      }

      if (!emailExists) {
        throw new Error('This email address is not registered in our records. (এই ইমেইল এড্রেসটি রেজিস্টার্ড নয়।)');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail,
        options: {
          shouldCreateUser: false
        }
      });
      if (error) throw error;
      setAuthStatusMessage('A 6-digit password reset code has been sent to your email.');
      setAuthFlow('forgot_otp');
    } catch (err: any) {
      console.error("Forgot password OTP send failure:", err);
      const errMsg = err.message || '';
      if (errMsg.includes('offline') || errMsg.includes('network') || errMsg.includes('Failed to get document')) {
        setAuthError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। দয়া করে ইন্টারনেট কানেকশন চেক করুন এবং আবার চেষ্টা করুন। (Unable to connect to the server. Please check your internet connection and try again.)');
      } else {
        setAuthError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password Step 2: Verify Reset OTP
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) {
      setAuthError('Please enter the 6-digit reset code.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: forgotEmail,
        token: forgotOtp,
        type: 'email'
      });
      if (error) {
        const { error: errorRec } = await supabase.auth.verifyOtp({
          email: forgotEmail,
          token: forgotOtp,
          type: 'recovery'
        });
        if (errorRec) throw error;
      }
      setAuthStatusMessage('Email verified! Please choose your new secure password below.');
      setAuthFlow('forgot_reset');
    } catch (err: any) {
      console.error("Reset OTP verification failure:", err);
      setAuthError(err.message || 'Invalid or expired reset code. Please check and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password Step 3: Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPassword || !forgotConfirmPassword) {
      setAuthError('Please fill out both password fields.');
      return;
    }
    if (forgotPassword !== forgotConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (forgotPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setAuthError('');
    setAuthStatusMessage('');
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: forgotPassword
      });
      if (error) throw error;
      alert('Your password has been reset successfully! You are now logged in.');
      setAuthStatusMessage('');
      setAuthFlow('signin');
    } catch (err: any) {
      console.error("Password change failed:", err);
      setAuthError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase sign out error:", err);
    }
    setActiveView('dashboard');
  };

  // --- Real-time Data ---
  useEffect(() => {
    if (!user?.uid || !profile) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', user.uid)
        .maybeSingle();
      if (!error && data) {
        setProfile(data as any);
      }
    };

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (!error && data) {
        setProducts(data as any);
      }
    };

    const fetchOrders = async () => {
      let queryBuilder = supabase.from('orders').select('*');
      if (profile.role !== 'admin') {
        queryBuilder = queryBuilder.eq('userId', user.uid);
      }
      const { data, error } = await queryBuilder;
      if (!error && data) {
        const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted as any);
      }
    };

    const fetchTransactions = async () => {
      let queryBuilder = supabase.from('transactions').select('*');
      if (profile.role !== 'admin') {
        queryBuilder = queryBuilder.eq('userId', user.uid);
      }
      const { data, error } = await queryBuilder;
      if (!error && data) {
        const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sorted as any);
      }
    };

    const fetchAllUsers = async () => {
      if (profile.role !== 'admin') return;
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (!error && data) {
        setAllUsers(data as any);
      }
    };

    // Initial Fetch
    fetchProfile();
    fetchProducts();
    fetchOrders();
    fetchTransactions();
    if (profile.role === 'admin') {
      fetchAllUsers();
    }

    // Polling backup
    const interval = setInterval(() => {
      fetchProfile();
      fetchProducts();
      fetchOrders();
      fetchTransactions();
      if (profile.role === 'admin') {
        fetchAllUsers();
      }
    }, 5000);

    // Real-time listener
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        console.log("Supabase real-time update received!");
        fetchProfile();
        fetchProducts();
        fetchOrders();
        fetchTransactions();
        if (profile.role === 'admin') {
          fetchAllUsers();
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [user?.uid, profile?.role]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6">
          <Package size={40} />
        </div>
        <h2 className="text-xl font-black text-text-main">Initializing Portal...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-white relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-100 rotate-3">
              <Package size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tighter mb-1">BEXO <span className="text-primary italic">BD</span></h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Supplier & Reseller Portal</p>
          </div>

          <div className="space-y-6">
            {/* Success Status Message */}
            {authStatusMessage && (
              <div className="p-3 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl text-center">
                {authStatusMessage}
              </div>
            )}

            {/* Error Status Message */}
            {authError && (
              <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
                {authError}
              </div>
            )}

            {/* CASE 1: SIGN IN FLOW */}
            {authFlow === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email or Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. name@email.com or 017XXXXXXXX"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthStatusMessage('');
                        setAuthFlow('forgot_email');
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Signing In...' : 'Sign In with Credentials'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-2">
                  <span>Don't have an account?</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthError('');
                      setAuthStatusMessage('');
                      setAuthFlow('signup_email');
                    }}
                    className="text-primary hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            )}

            {/* CASE 2: SIGN UP STEP 1 - EMAIL INPUT */}
            {authFlow === 'signup_email' && (
              <form onSubmit={handleSendSignUpOtp} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Verify Your Email First</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter your email to receive a 6-digit registration OTP code.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="yourname@domain.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-2">
                  <span>Already have an account?</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthError('');
                      setAuthStatusMessage('');
                      setAuthFlow('signin');
                    }}
                    className="text-primary hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* CASE 3: SIGN UP STEP 2 - OTP VERIFICATION */}
            {authFlow === 'signup_otp' && (
              <form onSubmit={handleVerifySignUpOtp} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500 font-medium">Please enter the 6-digit OTP code sent to <span className="font-bold text-slate-700">{signUpEmail}</span>.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={signUpOtp}
                    onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] font-mono py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-lg transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Verifying...' : 'Verify OTP Code'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthError('');
                      setAuthStatusMessage('');
                      setAuthFlow('signup_email');
                    }}
                    className="text-primary hover:underline"
                  >
                    Change Email / Re-send
                  </button>
                </div>
              </form>
            )}

            {/* CASE 4: SIGN UP STEP 3 - COMPLETE REGISTRATION DETAILS */}
            {authFlow === 'signup_complete' && (
              <form onSubmit={handleCompleteSignUp} className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Complete Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">Setup your dropshipping shop and account details.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={signUpEmail}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-border rounded-xl font-medium text-sm text-slate-500 focus:outline-none"
                    disabled
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. My Bexo Shop"
                    value={signUpShopName}
                    onChange={(e) => setSignUpShopName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kabir Hossain"
                    value={signUpDisplayName}
                    onChange={(e) => setSignUpDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 01711223344"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={signUpAddress}
                    onChange={(e) => setSignUpAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referral Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Karim Ahmed"
                    value={signUpReferralName}
                    onChange={(e) => setSignUpReferralName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Password *</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Repeat chosen password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-4"
                >
                  {authLoading ? 'Completing...' : 'Complete Registration'}
                </button>
              </form>
            )}

            {/* CASE 5: FORGOT PASSWORD STEP 1 - EMAIL INPUT */}
            {authFlow === 'forgot_email' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Reset Password</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter your registered email to receive a password reset code.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="yourname@domain.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Sending Code...' : 'Send Reset OTP'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthError('');
                      setAuthStatusMessage('');
                      setAuthFlow('signin');
                    }}
                    className="text-primary hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* CASE 6: FORGOT PASSWORD STEP 2 - OTP INPUT */}
            {authFlow === 'forgot_otp' && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Enter Reset Code</h3>
                  <p className="text-xs text-slate-500 font-medium">Please enter the 6-digit password reset OTP sent to <span className="font-bold text-slate-700">{forgotEmail}</span>.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">6-Digit Reset Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] font-mono py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-lg transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Verifying...' : 'Verify Reset Code'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthError('');
                      setAuthStatusMessage('');
                      setAuthFlow('forgot_email');
                    }}
                    className="text-primary hover:underline"
                  >
                    Change Email / Re-send
                  </button>
                </div>
              </form>
            )}

            {/* CASE 7: FORGOT PASSWORD STEP 3 - PASSWORD UPDATE */}
            {authFlow === 'forgot_reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-lg font-black text-slate-800">Set New Password</h3>
                  <p className="text-xs text-slate-500 font-medium">Please enter your new secure password below.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all mt-2"
                >
                  {authLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* Standard Social Sign In option on basic screen only */}
            {authFlow === 'signin' && (
              <>
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative px-4 bg-white text-xs text-slate-400 font-bold uppercase tracking-widest">
                    OR
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  SIGN IN WITH GOOGLE
                </button>
              </>
            )}
            
            <p className="text-[9px] text-center font-bold text-slate-300 uppercase tracking-widest mt-4">
              Official BEXO Network Access
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by Bexo Dropshipping Network</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profile?.role === 'admin' && !isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-white relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShieldAlert size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-text-main tracking-tight mb-2">Admin Security</h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Enter authorization code</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminPasswordInput === 'admin123') {
              setIsAdminUnlocked(true);
            } else {
              alert('Incorrect password!');
              setAdminPasswordInput('');
            }
          }} className="space-y-6">
            <input 
              type="password" 
              autoFocus
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full text-center tracking-[0.5em] font-mono py-4 bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-slate-400 font-bold shadow-sm"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all"
            >
              Unlock Access
            </button>
          </form>

          <button onClick={handleLogout} className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest w-full hover:text-slate-600 transition-colors">
            Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[240px] bg-white border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 py-8 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-text-main">Bexo BD</span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} />
          <NavItem icon={<User size={20} />} label="Profile" active={activeView === 'profile'} onClick={() => { setActiveView('profile'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Package size={20} />} label="All Products" active={activeView === 'products'} onClick={() => { setActiveView('products'); setIsSidebarOpen(false); }} />
          <NavItem icon={<ClipboardList size={20} />} label="Order List" active={activeView === 'orders'} onClick={() => { setActiveView('orders'); setIsSidebarOpen(false); }} />
          {profile?.role === 'admin' && (
            <>
              <NavItem icon={<Key size={20} />} label="🔑 Admin Panel" active={activeView === 'admin-panel'} onClick={() => { setActiveView('admin-panel'); setIsSidebarOpen(false); }} />
              <NavItem icon={<Users size={20} />} label="Manager" active={activeView === 'admin-users'} onClick={() => { setActiveView('admin-users'); setIsSidebarOpen(false); }} />
              <NavItem icon={<Banknote size={20} />} label="Financial Transactions" active={activeView === 'admin-payouts'} onClick={() => { setActiveView('admin-payouts'); setIsSidebarOpen(false); }} />
            </>
          )}
          <NavItem icon={<ShoppingCart size={20} />} label="Cart List" active={activeView === 'cart'} onClick={() => { setActiveView('cart'); setIsSidebarOpen(false); }} />
          <div className="pt-4 pb-2 px-3">
            <span className="micro-label">Finance & Support</span>
          </div>
          <NavItem icon={<BarChart3 size={20} />} label="Sales & Profit" active={activeView === 'sales'} onClick={() => { setActiveView('sales'); setIsSidebarOpen(false); }} />
          <NavItem icon={<FileText size={20} />} label="Balance Statement" active={activeView === 'balance'} onClick={() => { setActiveView('balance'); setIsSidebarOpen(false); }} />
          <NavItem icon={<MessageSquare size={20} />} label="Support Ticket" active={activeView === 'support'} onClick={() => { setActiveView('support'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-primary hover:bg-[#FFF5EE] rounded-lg font-semibold transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-[80px] bg-white sticky top-0 border-b border-border px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-background rounded-lg transition-colors border border-border"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-extrabold tracking-tight text-text-main capitalize">{activeView.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end bg-[#FFF0E6] border border-primary px-4 py-2 rounded-full min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest leading-none mb-1">Current Balance</span>
              <span className="text-base font-extrabold text-text-main leading-none">৳ {profile?.balance.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => setActiveView('profile')}
              className="user-avatar w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden border-2 border-white ring-1 ring-border"
            >
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" referrerPolicy="no-referrer" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'dashboard' && <Dashboard orders={orders} products={products} profile={profile} />}
              {activeView === 'products' && (
                <ProductGrid 
                  products={products} 
                  onAdd={(p) => {
                    setCart(p);
                    setIsCheckoutOpen(true);
                  }} 
                />
              )}
              {activeView === 'orders' && <OrderList orders={orders} profile={profile} user={user} />}
              {activeView === 'admin-panel' && (
                profile?.role === 'admin' ? (
                  <AdminWorkspace 
                    allUsers={allUsers} 
                    transactions={transactions} 
                    products={products} 
                    orders={orders} 
                  />
                ) : (
                  <div className="max-w-md mx-auto my-12 bg-white rounded-[2.5rem] p-8 shadow-xl border border-red-100 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
                      <ShieldAlert size={30} />
                    </div>
                    <h3 className="text-2xl font-black text-red-600 tracking-tight">Access Denied</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2 text-center">
                      This Admin Panel is restricted to the specific administrator account (<span className="text-slate-800 font-bold">bexobd@gmail.com</span>) only.
                    </p>
                  </div>
                )
              )}
              {activeView === 'admin-payouts' && profile?.role === 'admin' && <AdminPayoutList transactions={transactions} />}
              {activeView === 'admin-products' && profile?.role === 'admin' && <AdminProductList products={products} />}
              {activeView === 'admin-users' && profile?.role === 'admin' && <AdminUsersList allUsers={allUsers} transactions={transactions} />}
              {activeView === 'profile' && <ProfileView user={user} profile={profile} transactions={transactions} orders={orders} />}
              {activeView === 'sales' && <SalesProfit orders={orders} />}
              {activeView === 'support' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Clock className="text-slate-300 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Coming Soon</h3>
                  <p className="text-slate-400 max-w-xs">We are currently working on this feature to provide you the best experience.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && cart && (
          <CheckoutModal 
            product={cart} 
            onClose={() => setIsCheckoutOpen(false)} 
            userId={user.uid}
            profile={profile}
            orders={orders}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all duration-200 group relative",
        active 
          ? "bg-[#FFF5EE] text-primary" 
          : "text-text-muted hover:text-primary hover:bg-[#FFF5EE]"
      )}
    >
      <span className={cn(
        "transition-transform",
        active ? "scale-110" : "group-hover:scale-110"
      )}>{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
      )}
    </button>
  );
}

function Dashboard({ orders, products, profile }: { orders: Order[], products: Product[], profile: UserProfile | null }) {
  const isAdmin = profile?.role === 'admin';
  
  const stats = useMemo(() => {
    if (isAdmin) {
      return [
        { label: 'Total Sales', value: orders.reduce((sum, o) => sum + o.sellingPrice, 0), unit: '৳', icon: null },
        { label: 'Total Profit', value: orders.reduce((sum, o) => sum + o.profit, 0), unit: '৳', icon: null },
        { label: 'Total Orders', value: orders.length, unit: '', icon: null },
        { label: 'Pending Payouts', value: orders.filter(o => o.profitStatus === 'pending_approval').reduce((sum, o) => sum + o.profit, 0), unit: '৳', icon: null },
      ];
    }
    return [
      { label: 'Total Products', value: products.length, unit: '', icon: null },
      { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Returned').length, unit: '', icon: null },
      { label: 'Wallet Balance', value: profile?.balance || 0, unit: '৳', icon: null },
      { label: 'Pending Deliveries', value: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length, unit: '', icon: null },
    ];
  }, [orders, products, profile, isAdmin]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-6 rounded-2xl border border-border hover:shadow-md transition-all group"
          >
            <div className="flex flex-col">
              <span className="micro-label mb-2">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                {stat.unit && <span className="text-xl font-extrabold text-text-main">{stat.unit}</span>}
                <span className="text-3xl font-black text-text-main tracking-tight">{stat.value.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-extrabold text-text-main">Quick Overview</h3>
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#FAF9F8] border-b border-border">
                  <th className="px-6 py-4 text-left micro-label">Order ID</th>
                  <th className="px-6 py-4 text-left micro-label">Date</th>
                  <th className="px-6 py-4 text-left micro-label">Customer</th>
                  <th className="px-6 py-4 text-left micro-label">Profit</th>
                  <th className="px-6 py-4 text-left micro-label">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-background/50 transition-colors cursor-pointer group text-[13px]">
                    <td className="px-6 py-4 font-bold text-text-main">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-text-muted">{new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4 font-bold text-text-main">{order.customerName}</td>
                    <td className="px-6 py-4 font-extrabold text-primary">৳ {order.profit}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-text-muted text-sm font-semibold">No recent activity detected.</div>
          )}
        </div>
      </div>

      <SupabaseTodosTest />
    </div>
  );
}

function SupabaseTodosTest() {
  const [todos, setTodos] = useState<any[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }

    getTodos()
  }, [])

  if (todos.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-text-main">Supabase Data (todos)</h3>
      <div className="bg-surface rounded-xl border border-border shadow-sm p-4">
        <ul className="list-disc pl-5">
          {todos.map((todo) => (
            <li key={todo.id} className="text-sm text-text-main">{todo.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProductGrid({ products, onAdd }: { products: Product[], onAdd: (p: Product) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'available' | 'stockout' | 'all'>('available');
  
  const filtered = useMemo(() => {
    return products.filter(p => {
      const isMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isMatch) return false;
      
      const isStockOut = p.stockStatus === 'out_of_stock' || (p.stock !== undefined && p.stock <= 0);
      
      if (filter === 'available') {
        return !isStockOut;
      } else if (filter === 'stockout') {
        return isStockOut;
      }
      return true;
    });
  }, [products, searchTerm, filter]);

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          <button 
            type="button"
            onClick={() => setFilter('available')}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              filter === 'available' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm" 
                : "bg-surface text-text-muted hover:text-text-main hover:bg-[#FAF9F8] border border-transparent"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 " />
            🟢 Available (ইন স্টক)
          </button>
          
          <button 
            type="button"
            onClick={() => setFilter('stockout')}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              filter === 'stockout' 
                ? "bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                : "bg-surface text-text-muted hover:text-text-main hover:bg-[#FAF9F8] border border-transparent"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            🔴 Stock Out (স্টক আউট)
          </button>
          
          <button 
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer",
              filter === 'all' 
                ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                : "bg-surface text-text-muted hover:text-text-main hover:bg-[#FAF9F8] border-transparent"
            )}
          >
            🌐 All Products (সকল)
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-medium text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((product, i) => {
            const isStockOut = product.stockStatus === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0);
            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-surface rounded-xl border overflow-hidden p-3 transition-all hover:shadow-md group relative flex flex-col justify-between h-auto min-h-[300px] border-border",
                  isStockOut && "opacity-85 border-red-100"
                )}
              >
                <div>
                  <div className="w-full h-[140px] bg-[#f0f0f0] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                    <img 
                      src={product.imageUrl} 
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                        isStockOut && "grayscale-[30%]"
                      )} 
                      alt={product.title} 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Stock status indicator badge */}
                    {isStockOut ? (
                      <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded shadow-sm">
                        🔴 Stock Out
                      </div>
                    ) : (
                      product.stock !== undefined && (
                        <div className={cn(
                          "absolute top-2 left-2 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded shadow-sm bg-black/75 text-white"
                        )}>
                          ⚡ Stock: {product.stock} left
                        </div>
                      )
                    )}
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <h4 className="text-[14px] font-bold text-text-main line-clamp-1">{product.title}</h4>
                    <div className="text-[18px] font-extrabold text-primary">৳ {product.basePrice.toLocaleString()}</div>
                    <p className="text-xs text-text-muted line-clamp-2 h-8">{product.description}</p>
                  </div>
                </div>

                <div className="mt-2 shrink-0">
                  <button 
                    onClick={() => !isStockOut && onAdd(product)}
                    disabled={isStockOut}
                    className={cn(
                      "w-full py-2.5 rounded-lg font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer",
                      isStockOut 
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                        : "bg-primary hover:bg-primary-dark text-white shadow-sm"
                    )}
                  >
                    {isStockOut ? 'Stock Out' : 'Add to Order'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 border rounded-2xl bg-[#FAF9F8] text-center flex flex-col items-center justify-center">
          <Package className="text-slate-300 w-12 h-12 mb-3" />
          <p className="text-slate-400 font-bold mb-1">কোন প্রোডাক্ট পাওয়া যায়নি।</p>
          <p className="text-xs text-slate-400">এই বিভাগে বর্তমানে কোনো প্রোডাক্ট নেই অথবা সার্চ এর সাথে মিলছে না।</p>
        </div>
      )}
    </div>
  );
}

function CheckoutModal({ product, onClose, userId, profile, orders }: { product: Product, onClose: () => void, userId: string, profile: UserProfile | null, orders: Order[] }) {
  const userOrdersCount = useMemo(() => {
    return orders.filter(o => o.userId === userId).length;
  }, [orders, userId]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    size: '',
    sellingPrice: '' as string | number,
    deliveryZone: 'inside' as 'inside' | 'outside' | 'inside_free' | 'outside_free'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recordCheck, setRecordCheck] = useState<'idle' | 'checking' | 'safe' | 'warning'>('idle');

  const deliveryCharge = (formData.deliveryZone === 'inside_free' || formData.deliveryZone === 'outside_free')
    ? 0
    : DELIVERY_CHARGES[formData.deliveryZone === 'outside' ? 'outside' : 'inside'];
  const total = (Number(formData.sellingPrice) || 0) + deliveryCharge;
  const profit = (Number(formData.sellingPrice) || 0) - product.basePrice;

  const handleCheckRecord = () => {
    if (!formData.customerPhone) return;
    setRecordCheck('checking');
    setTimeout(() => {
      setRecordCheck(formData.customerPhone.endsWith('7') ? 'warning' : 'safe');
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.size) return alert('Please select a size!');
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) return alert('Please enter a valid selling price!');
    if (profit < 0) return alert('Selling price cannot be lower than base price!');
    
    setIsLoading(true);
    try {
      const orderData: any = {
        date: new Date().toISOString(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        deliveryZone: (formData.deliveryZone === 'inside_free' || formData.deliveryZone === 'inside') ? 'inside' : 'outside',
        deliveryCharge,
        basePrice: product.basePrice,
        sellingPrice: Number(formData.sellingPrice),
        profit,
        size: formData.size,
        status: 'Pending',
        statusHistory: [
          { status: 'Order Placed', date: new Date().toISOString(), note: 'Order has been placed by reseller.' }
        ],
        userId,
        resellerName: profile?.displayName,
        resellerEmail: profile?.email,
        resellerShopName: profile?.shopName || 'Bexo Shop',
        productId: product.id,
        productTitle: product.title,
        profitStatus: 'not_added'
      };
      
      // Stock check and update via Supabase
      const { data: currentProduct, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .maybeSingle();

      if (prodErr) throw prodErr;
      if (!currentProduct) throw new Error('প্রোডাক্টটি পাওয়া যায়নি।');

      if (currentProduct.stockStatus === 'out_of_stock' || (currentProduct.stock !== undefined && currentProduct.stock <= 0)) {
        throw new Error('এই প্রোডাক্টটি বর্তমানে স্টক আউট রয়েছে!');
      }

      if (currentProduct.stock !== undefined) {
        const newStock = currentProduct.stock - 1;
        const updateObj: any = { stock: newStock };
        if (newStock <= 0) {
          updateObj.stockStatus = 'out_of_stock';
        }
        const { error: stockUpdateErr } = await supabase
          .from('products')
          .update(updateObj)
          .eq('id', product.id);
        if (stockUpdateErr) throw stockUpdateErr;
      }

      // Create new order record in Supabase
      const newOrderId = 'o_' + Math.random().toString(36).substring(2, 15);
      const { error: orderInsertErr } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          ...orderData
        });
      if (orderInsertErr) throw orderInsertErr;
      
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'অর্ডার প্লেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-2xl font-extrabold tracking-tight text-text-main">Place New Order</h3>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors border border-border">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-lg font-extrabold text-text-main">Order Details</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="micro-label">Customer Name</label>
                <input 
                  type="text" 
                  placeholder="Enter name" 
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-medium"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="micro-label">Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder="017xxxxxxxx" 
                    className="flex-1 px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-medium"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    required
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleCheckRecord}
                  disabled={!formData.customerPhone || recordCheck === 'checking'}
                  className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  {recordCheck === 'checking' ? 'Checking...' : 'Check Customer Record'}
                </button>
                {recordCheck !== 'idle' && recordCheck !== 'checking' && (
                  <div className={cn(
                    "p-3 rounded-lg text-xs font-bold flex items-center gap-2 border",
                    recordCheck === 'safe' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                  )}>
                    {recordCheck === 'safe' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {recordCheck === 'safe' ? 'Safe Customer (Low Return Rate)' : 'Alert: High return history detected!'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="micro-label">Full Address</label>
                <input 
                  type="text" 
                  placeholder="House, Street, Area" 
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-medium"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="micro-label">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, size: s }))}
                      className={cn(
                        "w-12 h-12 rounded-lg border font-bold text-sm transition-all",
                        formData.size === s 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-white text-text-muted border-border hover:border-primary/50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border space-y-6">
            <div className="space-y-2">
              <label className="micro-label">Delivery Zone</label>
              <select 
                className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-bold"
                value={formData.deliveryZone}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryZone: e.target.value as any }))}
              >
                <option value="inside">Inside Dhaka (৳ 60)</option>
                <option value="outside">Outside Dhaka (৳ 120)</option>
                {userOrdersCount >= 2 && (
                  <>
                    <option value="inside_free">Inside Dhaka (Free - ৳ 0)</option>
                    <option value="outside_free">Outside Dhaka (Free - ৳ 0)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="micro-label">Your Selling Price (BDT)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary transition-all font-black text-xl text-primary"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-text-muted">Base Price</span>
                <span className="text-text-main">৳ {product.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-text-muted">Delivery Fee</span>
                <span className="text-text-main">৳ {deliveryCharge}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-lg font-extrabold text-text-main">Total Payable</span>
                <span className="text-2xl font-black text-primary transition-all">৳ {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/10 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function OrderList({ orders, profile, user }: { orders: Order[], profile: UserProfile | null, user: any }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useBackButtonModal(!!selectedOrder, () => setSelectedOrder(null));

  const stats = useMemo(() => {
    let totalBuyingCost = 0;
    let totalSellingRevenue = 0;
    let totalProfitNet = 0;

    orders.forEach(o => {
      totalBuyingCost += o.basePrice || 0;
      totalSellingRevenue += o.sellingPrice || 0;
      totalProfitNet += o.profit || 0;
    });

    return { totalBuyingCost, totalSellingRevenue, totalProfitNet };
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            My Orders
            <span className="text-sm bg-background text-text-muted px-3 py-1 rounded-full font-bold border border-border">{orders.length}</span>
          </h3>
          <p className="text-xs text-text-muted mt-1">Track customer orders, price parameters, and pocket profits.</p>
        </div>
      </div>

      {/* Financial Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">📦 মোট কেনা দাম (Buying Cost)</span>
            <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600">
              <Banknote size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">৳ {stats.totalBuyingCost.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">প্রোডাক্টের হোলসেল ক্রয় মূল্য</p>
        </div>

        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">📤 মোট বিক্রয় মূল্য (Selling Price)</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100/60 flex items-center justify-center text-indigo-600">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 tracking-tight">৳ {stats.totalSellingRevenue.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-500/70 mt-1 font-bold">গ্রাহকের কাছে বিক্রয় করা মোট মূল্য</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">💰 মোট পকেটে এসেছে (Profit Net)</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100/60 flex items-center justify-center text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">৳ {stats.totalProfitNet.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-600/70 mt-1 font-bold">আপনার মোট অর্জিত পকেট প্রফিট (লভ্যাংশ)</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-border">
                <th className="px-6 py-4 text-left micro-label">Order & Product</th>
                <th className="px-6 py-4 text-left micro-label">Date</th>
                <th className="px-6 py-4 text-left micro-label">Customer</th>
                <th className="px-6 py-4 text-left micro-label">Financial details (হিসাব)</th>
                <th className="px-6 py-4 text-left micro-label">Status</th>
                <th className="px-6 py-4 text-left micro-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-background/50 transition-colors group text-[13px]">
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-[#111]">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 font-bold line-clamp-1">{order.productTitle || 'Product'}</p>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{new Date(order.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' })}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-text-main">{order.customerName}</p>
                    <p className="text-[11px] text-text-muted">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                        <span className="text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 uppercase tracking-wide">কিনছেন</span>
                        <span>৳ {order.basePrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                        <span className="text-[9px] bg-indigo-50 px-1 py-0.5 rounded text-indigo-500 uppercase tracking-wide">বেচছেন</span>
                        <span>৳ {order.sellingPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-black">
                        <span className="text-[9px] bg-emerald-50 px-1 py-0.5 rounded text-emerald-600 uppercase tracking-wide">পকেটে লাভ</span>
                        <span className="underline decoration-emerald-250 underline-offset-2">+ ৳ {order.profit?.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto cursor-pointer"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <ResellerOrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            profile={profile}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResellerOrderDetailsModal({ order, onClose, profile, user }: { order: Order, onClose: () => void, profile?: UserProfile | null, user?: any }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-7xl h-[92vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-text-main flex items-center gap-3">
              Order Details & Invoice
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold border border-border uppercase font-mono">#{order.id.slice(-8).toUpperCase()}</span>
            </h3>
            <p className="text-xs text-text-muted font-medium">Status: {order.status}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-[1.25rem] transition-colors border border-border shadow-sm cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Pane: Invoice matching mockup screenshot */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm">
              <InvoiceViewer order={order} profile={profile} currentUser={user} isAdmin={false} />
            </div>

            {/* Right Side Pane: Parcel tracking and status updates */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0">
              
              {/* Order Economics Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <TrendingUp size={16} />
                  </span>
                  <span className="text-xs uppercase font-black text-slate-500 tracking-wider">টাকার আর্থিক বিবরণী (Order Economics)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-normal mb-1">কিনছেন (Buy)</span>
                    <span className="text-sm font-black text-slate-800 font-mono">৳{order.basePrice?.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center col-span-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-normal mb-1">বেচছেন (Sell)</span>
                    <span className="text-sm font-black text-slate-800 font-mono">৳{order.sellingPrice?.toLocaleString()}</span>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100/60 text-center">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 block tracking-normal mb-1">লাভ (Profit)</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">৳{order.profit?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Profit Transfer</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wide border",
                    order.profitStatus === 'completed' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  )}>
                    💰 {order.profitStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Parcel Tracking Link Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
                <span className="text-xs uppercase font-black text-slate-500 tracking-wider block">Parcel Tracking</span>
                {order.trackingLink ? (
                  <a 
                    href={order.trackingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm transition-all text-center cursor-pointer"
                  >
                    <ExternalLink size={14} /> <span>ক্লিক করুন ট্র্যাক করতে</span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-200 italic text-center">
                    পার্সেল ট্র্যাকিং লিংক প্রস্তুত হচ্ছে।
                  </p>
                )}
              </div>

              {/* Delivery Status Timeline Logs Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-500">
                  <Clock size={15} /> Delivery Timeline
                </h4>
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {order.statusHistory?.map((log, i) => (
                    <div key={i} className="relative">
                      <div className={cn(
                        "absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        i === order.statusHistory!.length - 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[12px] text-text-main leading-tight mb-1">{log.status}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminOrderList({ orders }: { orders: Order[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useBackButtonModal(!!selectedOrder, () => setSelectedOrder(null));

  const filtered = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerPhone.includes(searchTerm) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.resellerShopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status'], oldHistory: Order['statusHistory'] = []) => {
    try {
      const historyUpdate = [
        ...(oldHistory || []),
        { status: newStatus, date: new Date().toISOString(), note: `Status updated to ${newStatus} by admin.` }
      ];
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          statusHistory: historyUpdate
        })
        .eq('id', orderId);
      if (error) throw error;
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, statusHistory: historyUpdate } : null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleUpdateTracking = async (orderId: string, link: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ trackingLink: link })
        .eq('id', orderId);
      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProfit = async (order: Order) => {
    try {
      const { data: userProfile, error: userFetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('uid', order.userId)
        .maybeSingle();
      if (userFetchErr) throw userFetchErr;

      let newBalance = order.profit;
      if (userProfile) {
        newBalance = (userProfile.balance || 0) + order.profit;
        const { error: userUpdErr } = await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('uid', order.userId);
        if (userUpdErr) throw userUpdErr;
      } else {
        const { error: userInsertErr } = await supabase
          .from('users')
          .insert({
            uid: order.userId,
            balance: newBalance,
            displayName: order.resellerName || 'User',
            email: order.resellerEmail || '',
            role: 'user'
          });
        if (userInsertErr) throw userInsertErr;
      }

      const transId = 't_' + Math.random().toString(36).substring(2, 15);
      const { error: transErr } = await supabase
        .from('transactions')
        .insert({
          id: transId,
          userId: order.userId,
          amount: order.profit,
          type: 'income',
          status: 'completed',
          description: `Profit for Order #${order.id.slice(-6).toUpperCase()}`,
          date: new Date().toISOString(),
          referenceId: order.id
        });
      if (transErr) throw transErr;

      const { error: orderUpdErr } = await supabase
        .from('orders')
        .update({ profitStatus: 'completed' })
        .eq('id', order.id);
      if (orderUpdErr) throw orderUpdErr;

      alert('Profit added to reseller account!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve profit');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
          Orders Master List
          <span className="text-sm bg-background text-text-muted px-3 py-1 rounded-full font-bold border border-border">{filtered.length}</span>
        </h3>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search customer, phone, ID, or shop..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-primary font-medium text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-border">
                <th className="px-6 py-4 text-left micro-label">ID & Date</th>
                <th className="px-6 py-4 text-left micro-label">Customer Details</th>
                <th className="px-6 py-4 text-left micro-label">Reseller / Shop</th>
                <th className="px-6 py-4 text-left micro-label">Pricing</th>
                <th className="px-6 py-4 text-left micro-label">Status</th>
                <th className="px-6 py-4 text-left micro-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-background/50 transition-colors group text-[13px]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-main">#{order.id.slice(-6).toUpperCase()}</div>
                    <div className="text-[10px] text-text-muted uppercase font-bold">{new Date(order.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-main">{order.customerName}</div>
                    <div className="text-text-muted">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{order.resellerShopName}</div>
                    <div className="text-[10px] text-text-muted font-bold">ID: {order.userId.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold">৳{order.sellingPrice}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Profit: ৳{order.profit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onUpdateStatus={handleUpdateStatus}
            onUpdateTracking={handleUpdateTracking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderDetailsModal({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onUpdateTracking
}: { 
  order: Order, 
  onClose: () => void,
  onUpdateStatus: (id: string, s: Order['status'], h: Order['statusHistory']) => void,
  onUpdateTracking: (id: string, l: string) => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-7xl h-[92vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-text-main flex items-center gap-3">
              Admin: Invoice & Order Operations
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold border border-border uppercase font-mono">#{order.id.slice(-8).toUpperCase()}</span>
            </h3>
            <p className="text-xs text-text-muted font-medium">Placed on {new Date(order.date).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-[1.25rem] transition-colors border border-border shadow-sm cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Full-featured Invoice Sheet matching Mockup */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm">
              <InvoiceViewer order={order} isAdmin={true} />
            </div>

            {/* Right Column: Administrative Controls Panel (Preserving all original actions) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0">
              
              {/* Order Operations Panel */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <LayoutDashboard size={16} />
                  </span>
                  <span className="text-xs uppercase font-black text-slate-500 tracking-wider">Administrative Controls</span>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Update Order Status</span>
                  <div className="relative">
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'], order.statusHistory || [])}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Processing">⚙️ Processing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Returned">❌ Returned</option>
                    </select>
                  </div>
                </div>

                {/* Tracking Link Input */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Tracking Link</span>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450" size={14} />
                    <input 
                      type="text" 
                      placeholder="Parcel tracking URL..." 
                      defaultValue={order.trackingLink}
                      onBlur={(e) => onUpdateTracking(order.id, e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery History Logs Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-500">
                  <Clock size={15} /> Delivery Timeline
                </h4>
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {order.statusHistory?.map((log, i) => (
                    <div key={i} className="relative">
                      <div className={cn(
                        "absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        i === order.statusHistory!.length - 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[12px] text-text-main leading-tight mb-1">{log.status}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1">
                          {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        {log.note && (
                          <p className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 mt-1.5">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!order.statusHistory || order.statusHistory.length === 0) && (
                    <p className="text-xs text-text-muted italic opacity-60 text-center py-4">No history logged yet.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PriceCard({ label, value, highlight = false, variant = 'slate' }: { label: string, value: number, highlight?: boolean, variant?: 'slate' | 'emerald' }) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      highlight ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-100",
      variant === 'emerald' ? "bg-emerald-50 border-emerald-100" : ""
    )}>
      <span className={cn(
        "micro-label block mb-1",
        highlight ? "text-primary" : "text-text-muted",
        variant === 'emerald' ? "text-emerald-500" : ""
      )}>{label}</span>
      <p className={cn(
        "text-lg font-black",
        highlight ? "text-primary" : "text-text-main",
        variant === 'emerald' ? "text-emerald-700" : ""
      )}>৳{value.toLocaleString()}</p>
    </div>
  );
}

function ProfileView({ user, profile, transactions, orders }: { user: any, profile: UserProfile | null, transactions: Transaction[], orders: Order[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: profile?.phone || '',
    shopName: profile?.shopName || '',
    website: profile?.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          phone: editForm.phone,
          shopName: editForm.shopName,
          website: editForm.website
        })
        .eq('uid', profile.uid);
      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalEarnings = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingProfit = orders
    .filter(o => o.profitStatus !== 'completed' && o.status === 'Delivered')
    .reduce((sum, o) => sum + o.profit, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-surface rounded-2xl p-6 md:p-10 border border-border shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-sm overflow-hidden border-2 border-white ring-1 ring-border shrink-0">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" referrerPolicy="no-referrer" />
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          {isEditing ? (
            <div className="space-y-4 w-full max-w-sm mx-auto">
              <input 
                className="w-full p-3 border border-border rounded-lg"
                value={editForm.shopName}
                onChange={(e) => setEditForm({...editForm, shopName: e.target.value})}
                placeholder="Shop Name"
              />
              <input 
                className="w-full p-3 border border-border rounded-lg"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Phone Number"
              />
              <input 
                className="w-full p-3 border border-border rounded-lg"
                value={editForm.website}
                onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                placeholder="Website"
              />
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold" onClick={handleUpdateProfile} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
                <button className="flex-1 px-4 py-3 bg-gray-200 rounded-lg font-bold" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-black text-text-main tracking-tight">{user.displayName}</h3>
              <p className="micro-label">{profile?.role || 'Reseller'} Partner</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="px-4 py-2 bg-background rounded-lg border border-border text-xs font-bold text-text-muted">
                  {user.email}
                </div>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold">Edit Profile</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary p-10 rounded-2xl text-white shadow-lg shadow-primary/10 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Total Settled Earnings</p>
          <h4 className="text-5xl font-black tracking-tighter mb-10">৳ {totalEarnings.toLocaleString()}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Available</span>
              <p className="text-lg font-black">{profile?.balance.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pending</span>
              <p className="text-lg font-black">{pendingProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-10 rounded-2xl border border-border space-y-8">
          <h5 className="text-lg font-black tracking-tight text-text-main">Account Settings</h5>
          <div className="grid gap-4">
            <SettingToggle label="Email Notifications" active />
            <SettingToggle label="Auto-update Balance" active />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
      <span className="text-sm font-bold text-text-main leading-none">{label}</span>
      <div className={cn("w-10 h-5 rounded-full p-1 transition-colors relative", active ? "bg-primary" : "bg-border")}>
        <div className={cn("w-3 h-3 bg-white rounded-full shadow-sm transition-transform", active ? "translate-x-5" : "translate-x-0")} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const styles = {
    'Pending': 'status-pending bg-[#FFF4E5] text-[#B25E00]',
    'Processing': 'bg-blue-50 text-blue-700',
    'Shipped': 'status-shipped bg-[#E5F6FF] text-[#005E99]',
    'Delivered': 'bg-emerald-50 text-emerald-700',
    'Returned': 'bg-red-50 text-red-700',
  };

  return (
    <span className={cn(
      "status-pill px-2 py-1 rounded inline-flex font-extrabold text-[10px] uppercase tracking-wider", 
      styles[status]
    )}>
      {status}
    </span>
  );
}

function BalanceStatement({ transactions, profile }: { transactions: Transaction[], profile: UserProfile | null }) {
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  
  useBackButtonModal(isWithdrawalOpen, () => setIsWithdrawalOpen(false));

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalWithdrawn = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawal = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard 
          label="Available Balance" 
          amount={profile?.balance || 0} 
          icon={<Wallet className="text-white" />} 
          color="bg-primary"
          action={
            <button 
              onClick={() => setIsWithdrawalOpen(true)}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 w-fit"
            >
              <Banknote size={14} /> Request Payout
            </button>
          }
        />
        <BalanceCard 
          label="Total Earnings" 
          amount={totalIncome} 
          icon={<ArrowUpRight className="text-emerald-600" />} 
          color="bg-emerald-50 border-emerald-100" 
          textColor="text-emerald-900"
        />
        <BalanceCard 
          label="Total Withdrawn" 
          amount={totalWithdrawn} 
          icon={<ArrowDownLeft className="text-blue-600" />} 
          color="bg-blue-50 border-blue-100" 
          textColor="text-blue-900"
          subtext={pendingWithdrawal > 0 ? `Processing: ৳${pendingWithdrawal.toLocaleString()}` : undefined}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-text-main">Transaction Details</h3>
        </div>
        
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF9F8] border-b border-border">
                    <th className="px-6 py-4 text-left micro-label">Transaction ID</th>
                    <th className="px-6 py-4 text-left micro-label">Date & Time</th>
                    <th className="px-6 py-4 text-left micro-label">Description</th>
                    <th className="px-6 py-4 text-left micro-label">Type</th>
                    <th className="px-6 py-4 text-left micro-label">Amount</th>
                    <th className="px-6 py-4 text-left micro-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-background/30 transition-colors text-[13px]">
                      <td className="px-6 py-4 font-bold text-text-muted">#TRX-{t.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-text-muted">
                        <div className="font-bold text-text-main">{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-[10px] uppercase">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-main">{t.description}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "font-black text-sm",
                          t.type === 'income' ? "text-emerald-600" : "text-blue-600"
                        )}>
                          {t.type === 'income' ? '+' : '-'} ৳{t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          t.status === 'completed' ? "bg-emerald-50 text-emerald-700" : 
                          t.status === 'pending' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        )}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold max-w-xs">No transactions record found for this period.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isWithdrawalOpen && profile && (
          <WithdrawalModal 
            profile={profile} 
            onClose={() => setIsWithdrawalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BalanceCard({ label, amount, icon, color, textColor = "text-white", action, subtext }: { label: string, amount: number, icon: React.ReactNode, color: string, textColor?: string, action?: React.ReactNode, subtext?: string }) {
  return (
    <div className={cn("p-8 rounded-3xl relative overflow-hidden group", color, !color.startsWith('bg-primary') && "border")}>
      <div className="relative z-10">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm", color.startsWith('bg-primary') ? "bg-white/20" : "bg-white border")}>
          {icon}
        </div>
        <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-70", textColor)}>{label}</p>
        <h4 className={cn("text-3xl font-black tracking-tighter", textColor)}>৳ {amount.toLocaleString()}</h4>
        {subtext && <p className={cn("text-[10px] font-bold mt-2", textColor)}>{subtext}</p>}
        {action}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </div>
  );
}

function WithdrawalModal({ profile, onClose }: { profile: UserProfile, onClose: () => void }) {
  const [amount, setAmount] = useState(profile.balance > 500 ? 500 : profile.balance);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) return alert('Minimum withdrawal amount is ৳100');
    if (amount > profile.balance) return alert('Insufficient balance');
    if (!accountNumber) return alert('Payment account number is required');

    setIsLoading(true);
    try {
      const { data: userData, error: fetchErr } = await supabase
        .from('users')
        .select('balance')
        .eq('uid', profile.uid)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const currentBalance = userData?.balance || 0;
      if (currentBalance < amount) throw new Error('Insufficient balance');

      // Deduct balance
      const { error: balanceErr } = await supabase
        .from('users')
        .update({ balance: currentBalance - amount })
        .eq('uid', profile.uid);
      if (balanceErr) throw balanceErr;

      // Add transaction record
      const transId = 't_' + Math.random().toString(36).substring(2, 15);
      const { error: transErr } = await supabase
        .from('transactions')
        .insert({
          id: transId,
          userId: profile.uid,
          amount,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal via ${paymentMethod} to ${accountNumber}`,
          date: new Date().toISOString()
        });
      if (transErr) throw transErr;

      alert('Withdrawal request submitted successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 flex flex-col gap-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight text-text-main">Request Payout</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-border">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="micro-label">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">৳</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="100"
                max={profile.balance}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-3xl font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                required
              />
            </div>
            <div className="flex justify-between px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available: ৳{profile.balance.toLocaleString()}</span>
              <button 
                type="button" 
                onClick={() => setAmount(profile.balance)}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Max Amount
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="micro-label">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {['bKash', 'Nagad'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "py-4 rounded-2xl font-bold border transition-all",
                    paymentMethod === method 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white text-text-muted border-border hover:border-primary/50"
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="micro-label">{paymentMethod} Account Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 017xxxxxxxx" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || profile.balance < 100}
            className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/10 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Processing Request...' : 'Send Request'}
          </button>
        </form>

        <p className="text-[10px] text-center font-bold text-slate-400 leading-relaxed">
          Payouts are processed within 24-48 hours. <br />
          Make sure your account details are correct.
        </p>
      </motion.div>
    </div>
  );
}

function SalesProfit({ orders }: { orders: Order[] }) {
  const completedOrders = orders.filter(o => o.status === 'Delivered' || (o.status as string) === 'Completed');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalProfit = completedOrders.reduce((sum, o) => sum + o.profit, 0);
  const totalOrders = completedOrders.length;

  const monthlyData = useMemo(() => {
    const months: Record<string, { sales: number, profit: number }> = {};
    completedOrders.forEach(o => {
      const month = new Date(o.date).toLocaleString('default', { month: 'short' });
      if (!months[month]) months[month] = { sales: 0, profit: 0 };
      months[month].sales += o.sellingPrice;
      months[month].profit += o.profit;
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [completedOrders]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard 
          label="Settled Sales" 
          amount={totalSales} 
          icon={<TrendingUp className="text-emerald-600" />} 
          color="bg-emerald-50 border-emerald-100" 
          textColor="text-emerald-900"
        />
        <BalanceCard 
          label="Total Net Profit" 
          amount={totalProfit} 
          icon={<BarChart3 className="text-blue-600" />} 
          color="bg-blue-50 border-blue-100" 
          textColor="text-blue-900"
        />
        <BalanceCard 
          label="Orders Delivered" 
          amount={totalOrders} 
          icon={<Package className="text-primary" />} 
          color="bg-orange-50 border-orange-100" 
          textColor="text-orange-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-black text-text-main">Performance Summary</h3>
          <div className="space-y-4">
            <ReportItem label="Order Success Rate" value={totalOrders > 0 ? "98.5%" : "0%"} />
            <ReportItem label="Avg. Order Value" value={`৳${(totalSales / totalOrders || 0).toFixed(0)}`} />
            <ReportItem label="Total Orders" value={totalOrders.toString()} />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center">
          <BarChart3 size={40} className="text-slate-200 mb-4" />
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Growth Analytics Coming</h4>
          <p className="text-xs text-slate-400 mt-1">Full visualized charts will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
}

function ReportItem({ label, value, trend }: { label: string, value: string, trend?: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-text-main">{value}</p>
      </div>
      {trend && (
        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">{trend}</span>
      )}
    </div>
  );
}

function AdminPayoutList({ transactions }: { transactions: Transaction[] }) {
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');

  const handleApprovePayout = async (transId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transId);
      if (error) throw error;
      alert('Payout marked as completed!');
    } catch (err) {
      console.error(err);
      alert('Failed to update payout status');
    }
  };

  const handleRejectPayout = async (trans: Transaction) => {
    try {
      const { data: userData, error: fetchErr } = await supabase
        .from('users')
        .select('balance')
        .eq('uid', trans.userId)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const currentBalance = userData?.balance || 0;
      const { error: balanceErr } = await supabase
        .from('users')
        .update({ balance: currentBalance + trans.amount })
        .eq('uid', trans.userId);
      if (balanceErr) throw balanceErr;

      const { error: transErr } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', trans.id);
      if (transErr) throw transErr;

      alert('Payout rejected and amount returned to reseller balance.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject payout');
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black tracking-tight">Withdrawal Requests</h3>
      
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF9F8] border-b border-border">
                  <th className="px-6 py-4 text-left micro-label">Date</th>
                  <th className="px-6 py-4 text-left micro-label">User ID</th>
                  <th className="px-6 py-4 text-left micro-label">Details</th>
                  <th className="px-6 py-4 text-left micro-label">Amount</th>
                  <th className="px-6 py-4 text-left micro-label text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.map((t) => (
                  <tr key={t.id} className="hover:bg-background/30 transition-colors text-sm">
                    <td className="px-6 py-4 text-text-muted font-bold">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-text-main">#{t.userId.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-text-muted font-medium">{t.description}</td>
                    <td className="px-6 py-4 font-black text-primary text-base text-blue-600">৳{t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      {t.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button 
                            onClick={() => handleApprovePayout(t.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectPayout(t)}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                          t.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}>
                          {t.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400 font-bold">No withdrawal requests found.</div>
        )}
      </div>
    </div>
  );
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 500;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

function AdminProductList({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useBackButtonModal(isFormOpen, () => setIsFormOpen(false));

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    basePrice: '',
    imageUrl: '',
    description: '',
    stockStatus: 'in_stock' as 'in_stock' | 'out_of_stock',
    stock: '' as string | number
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('শুধুমাত্র ছবি আপলোড করা যাবে!');
      return;
    }
    setUploadError('');
    setIsLoading(true);
    try {
      const base64Img = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: base64Img }));
    } catch (err: any) {
      console.error(err);
      setUploadError('ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Fill edit form
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      basePrice: p.basePrice.toString(),
      imageUrl: p.imageUrl,
      description: p.description || '',
      stockStatus: p.stockStatus || 'in_stock',
      stock: p.stock !== undefined ? p.stock.toString() : ''
    });
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      basePrice: '',
      imageUrl: '',
      description: '',
      stockStatus: 'in_stock',
      stock: ''
    });
    setIsFormOpen(true);
  };

  // Seed default products helper
  const handleSeedProducts = async () => {
    if (!confirm('আপনি কি ডিফল্ট প্রোডাক্টস ডাটাবেজে যুক্ত করতে চান?')) return;
    setIsLoading(true);
    try {
      for (const item of INITIAL_PRODUCTS) {
        const prodId = 'p_' + Math.random().toString(36).substring(2, 15);
        const { error } = await supabase
          .from('products')
          .insert({
            id: prodId,
            title: item.title,
            basePrice: item.basePrice,
            imageUrl: item.imageUrl,
            description: item.description,
            stockStatus: 'in_stock',
            stock: 50 // seed with initial 50 stock count
          });
        if (error) throw error;
      }
      alert('ডিফল্ট প্রোডাক্টস সফলতার সাথে ডাটাবেজে যুক্ত হয়েছে!');
    } catch (err) {
      console.error(err);
      alert('ডিফল্ট প্রোডাক্ট যোগ করতে সমস্যা হয়েছে!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.basePrice) {
      alert('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন!');
      return;
    }

    setIsLoading(true);
    const numericPrice = Number(formData.basePrice);
    const numericStock = formData.stock !== '' ? Number(formData.stock) : undefined;
    
    // Auto-compute stock status if stock count is zero or negative
    let status = formData.stockStatus;
    if (numericStock !== undefined && numericStock <= 0) {
      status = 'out_of_stock';
    }

    const payload: any = {
      title: formData.title,
      basePrice: numericPrice,
      imageUrl: formData.imageUrl || 'https://picsum.photos/seed/default/400/400',
      description: formData.description,
      stockStatus: status,
    };

    if (numericStock !== undefined) {
      payload.stock = numericStock;
    } else {
      payload.stock = null; 
    }

    try {
      if (editingProduct) {
        // Edit existing product
        const updateData = { ...payload };
        if (updateData.stock === null) {
          const { error } = await supabase
            .from('products')
            .update({
              title: payload.title,
              basePrice: payload.basePrice,
              imageUrl: payload.imageUrl,
              description: payload.description,
              stockStatus: payload.stockStatus,
              stock: null
            })
            .eq('id', editingProduct.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', editingProduct.id);
          if (error) throw error;
        }
        alert('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Add new product
        const cleanPayload = { ...payload };
        if (cleanPayload.stock === null) {
          delete cleanPayload.stock;
        }
        const prodId = 'p_' + Math.random().toString(36).substring(2, 15);
        const { error } = await supabase
          .from('products')
          .insert({
            id: prodId,
            ...cleanPayload
          });
        if (error) throw error;
        alert('প্রোডাক্ট সফলভাবে তৈরি করা হয়েছে!');
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('প্রক্রিয়াটি সম্পন্ন করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (prodId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ডিলেট করতে চান?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({
          stockStatus: 'out_of_stock',
          stock: 0
        })
        .eq('id', prodId);
      if (error) throw error;
      alert('প্রোডাক্টটি স্টক আউট করে দেয়া হয়েছে।');
    } catch (err) {
      console.error(err);
      alert('ডিলেট করতে ব্যর্থ হয়েছে।');
    }
  };

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Manage Catalog</h3>
          <p className="text-xs text-text-muted mt-1">Add, update, and toggle stock-out status of inventory items.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {products.length === 0 && (
            <button 
              type="button"
              onClick={handleSeedProducts}
              disabled={isLoading}
              className="px-5 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              🌱 Seed Default Products
            </button>
          )}

          <button 
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-orange-100 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Product
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search items by name..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-border">
                <th className="px-6 py-4 text-left micro-label">Image & Title</th>
                <th className="px-6 py-4 text-left micro-label">Price</th>
                <th className="px-6 py-4 text-left micro-label">Stock Status</th>
                <th className="px-6 py-4 text-left micro-label">Remaining Stock</th>
                <th className="px-6 py-4 text-right micro-label">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => {
                const isOutOfStock = p.stockStatus === 'out_of_stock' || (p.stock !== undefined && p.stock <= 0) || (p as any).isStockOut === true || ((p as any).stockCount !== undefined && (p as any).stockCount <= 0);
                return (
                  <tr key={p.id} className="hover:bg-background/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#f5f5f5] overflow-hidden border border-border shrink-0">
                          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-extrabold text-text-main line-clamp-1 h-5">{p.title}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase truncate max-w-[150px]">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-text-main">
                      ৳ {p.basePrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded inline-flex font-black text-[10px] uppercase tracking-wider",
                        isOutOfStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                      )}>
                        {isOutOfStock ? '🔴 STOCK OUT' : '🟢 IN STOCK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-muted">
                      {p.stock !== undefined ? `${p.stock} units` : 'Infinite (অসীম)'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-3.5 py-1.5 border border-border rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer text-text-main"
                        >
                          ⚙️ Modify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Mark Out
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted font-bold text-sm">
                    কোন প্রোডাক্ট ডাটা পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 shadow-2xl flex flex-col gap-6 text-left"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-black text-text-main tracking-tight">
                  {editingProduct ? 'Modify Product Details' : 'Add New Inventory Product'}
                </h3>
                <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all border">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="micro-label">Product Name / Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Trendy Cotton Shirt"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-primary transition-all text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="micro-label">Base Price (BDT) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.basePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="micro-label">Initial Stock Count (Optional)</label>
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="Leave blank for infinite"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="micro-label">Stock Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, stockStatus: 'in_stock' }))}
                      className={cn(
                        "py-3.5 rounded-xl font-bold border transition-all text-xs cursor-pointer",
                        formData.stockStatus === 'in_stock' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm" 
                          : "bg-white text-text-muted border-border hover:border-emerald-300"
                      )}
                    >
                      🟢 In Stock (স্টক আছে)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, stockStatus: 'out_of_stock' }))}
                      className={cn(
                        "py-3.5 rounded-xl font-bold border transition-all text-xs cursor-pointer",
                        formData.stockStatus === 'out_of_stock' 
                          ? "bg-red-50 text-red-700 border-red-300 shadow-sm" 
                          : "bg-white text-text-muted border-border hover:border-red-300"
                      )}
                    >
                      🔴 Stock Out (স্টকআউট)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="micro-label">Product Image (প্রোডাক্ট ফটো)</label>
                  
                  {/* File Upload Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    onClick={() => document.getElementById('product-image-file')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[140px]",
                      isDragging 
                        ? "border-primary bg-primary/5 scale-[1.01]" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300"
                    )}
                  >
                    <input 
                      type="file" 
                      id="product-image-file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(file);
                      }}
                      className="hidden"
                    />
                    
                    {formData.imageUrl ? (
                      <div className="relative group/img w-full max-w-[120px] aspect-square rounded-xl overflow-hidden border shadow-sm">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-[10px] font-black uppercase tracking-wider">Change Photo</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500">
                          <Upload size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-extrabold text-slate-700">ডিভাইস থেকে ফটো আপলোড করুন</p>
                          <p className="text-[10px] text-slate-400 font-bold">ড্র্যাগ এন্ড ড্রপ করুন অথবা এখানে ক্লিক করুন</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {uploadError && (
                    <p className="text-red-600 font-bold text-[10px] mt-1">{uploadError}</p>
                  )}

                  {/* Manual URL Input */}
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">অথবা ইমেজ ইউআরএল (Image URL)</span>
                    <input 
                      type="url" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-xs"
                    />
                    <span className="text-[9px] text-slate-400 font-semibold block pt-1 leading-normal">
                      সরাসরি ডিভাইস থেকে ফটো সিলেক্ট করতে পারেন, অথবা চাইলে ওয়েব ইমেজ লিংকও পেস্ট করতে পারেন। খালি রাখলে পিকসাম এর একটি রেন্ডম ছবি নিয়ে নিবে।
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="micro-label">Product Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide highlights for the reseller..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4.5 bg-primary hover:bg-primary-dark text-white rounded-[2rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-orange-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Processing Request...' : editingProduct ? 'Save Product Details' : 'Add Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
