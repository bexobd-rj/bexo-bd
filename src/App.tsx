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
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc, 
  orderBy,
  updateDoc,
  runTransaction
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { Product, Order, UserProfile, Transaction } from './types';
import { AdminUsersList } from './components/AdminUsersList';

// --- Types & Constants ---
type View = 'dashboard' | 'profile' | 'products' | 'orders' | 'admin-orders' | 'admin-payouts' | 'admin-products' | 'admin-users' | 'admin-panel' | 'cart' | 'sales' | 'balance' | 'support';

interface AdminWorkspaceProps {
  allUsers: UserProfile[];
  transactions: Transaction[];
  products: Product[];
  orders: Order[];
}

function AdminWorkspace({ allUsers, transactions, products, orders }: AdminWorkspaceProps) {
  const [currentTab, setCurrentTab] = useState<'users' | 'products' | 'orders' | 'payouts'>('users');

  return (
    <div className="space-y-6">
      {/* Premium Segmented Controls at Top */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-2xl max-w-2xl shadow-sm border border-slate-200/50">
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
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // --- Auth & Profile ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(true);
      try {
        if (currentUser) {
          // Ensure profile exists
          const userRef = doc(db, 'users', currentUser.uid);
          let snap = null;
          let fetchError = false;
          try {
            snap = await getDoc(userRef);
          } catch (err) {
            console.error("Failed to fetch user profile, offline or sluggish connection:", err);
            fetchError = true;
          }
          const isSuperAdminEmail = currentUser.email === 'bexobd@gmail.com';
          
          if (snap && snap.exists()) {
            const existingData = snap.data() as UserProfile;
            if (isSuperAdminEmail && existingData.role !== 'admin') {
              const updatedProfile = { ...existingData, role: 'admin' as const };
              try {
                await updateDoc(userRef, { role: 'admin' });
              } catch (updErr) {
                console.warn("Could not update admin role on server (local update only):", updErr);
              }
              setProfile(updatedProfile);
            } else {
              setProfile(existingData);
            }
          } else {
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Reseller',
              email: currentUser.email || '',
              balance: 0,
              role: isSuperAdminEmail ? 'admin' : 'user',
              shopName: 'My Bexo Shop',
              phone: ''
            };
            if (fetchError) {
              setProfile(fallbackProfile);
            } else {
              try {
                await setDoc(userRef, fallbackProfile);
              } catch (setErr) {
                console.warn("Could not write new profile to server (local update only):", setErr);
              }
              setProfile(fallbackProfile);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth status sync sequence exception:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveView('dashboard');
  };

  // --- Real-time Data ---
  useEffect(() => {
    if (!user?.uid || !profile) return;

    // Listen for current user profile changes
    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
        }
      },
      (err) => {
        console.error("Profile onSnapshot error:", err);
      }
    );

    // Listen for products
    const qProducts = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(
      qProducts, 
      (snap) => {
        const p = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(p);
      },
      (err) => {
        console.error("Products onSnapshot error:", err);
      }
    );

    // Listen for orders
    console.log("Setting up orders listener for", user.uid, "Role:", profile.role);
    let qOrders;
    if (profile.role === 'admin') {
      qOrders = query(collection(db, 'orders'), orderBy('date', 'desc'));
    } else {
      qOrders = query(collection(db, 'orders'), where('userId', '==', user.uid));
    }

    const unsubOrders = onSnapshot(qOrders, 
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        if (profile.role !== 'admin') {
          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        setOrders(items);
      },
      (err) => {
        console.error("Orders listener error:", err);
      }
    );

    // Listen for transactions
    let qTrans;
    if (profile.role === 'admin') {
      qTrans = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    } else {
      qTrans = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    }
    
    const unsubTrans = onSnapshot(qTrans, 
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        if (profile.role !== 'admin') {
          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        setTransactions(items);
      },
      (err) => {
        console.error("Transactions listener error:", err);
      }
    );

    // Listen for all users if admin
    let unsubUsers = () => {};
    if (profile.role === 'admin') {
      const qUsers = query(collection(db, 'users'));
      unsubUsers = onSnapshot(qUsers, 
        (snap) => {
          setAllUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        },
        (err) => {
          console.error("Users listener error:", err);
        }
      );
    }

    return () => {
      unsubProfile();
      unsubProducts();
      unsubOrders();
      unsubTrans();
      unsubUsers();
    };
  }, [user?.uid, profile?.role]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 animate-pulse">
          <Package size={40} />
        </div>
        <h2 className="text-xl font-black text-text-main animate-pulse">Initializing Portal...</h2>
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
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100 rotate-3">
              <Package size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-2">BEXO <span className="text-primary italic">BD</span></h1>
            <p className="micro-label">Supplier & Reseller Portal</p>
          </div>

          <div className="space-y-6">
            <p className="text-center text-sm font-bold text-text-muted mb-8 italic">
              Empowering local resellers with high-quality inventory and seamless fulfillment.
            </p>

            <button 
              onClick={handleLogin}
              className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-orange-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              SIGN IN WITH GOOGLE <ChevronRight size={18} />
            </button>
            
            <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest mt-6">
              Official BEXO Network Access
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Bexo Dropshipping Network</p>
          </div>
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
            <NavItem icon={<Key size={20} />} label="🔑 Admin Panel" active={activeView === 'admin-panel'} onClick={() => { setActiveView('admin-panel'); setIsSidebarOpen(false); }} />
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
              {activeView === 'orders' && <OrderList orders={orders} />}
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
              {activeView === 'admin-orders' && profile?.role === 'admin' && <AdminOrderList orders={orders} />}
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
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          {orders.length > 0 ? (
            <table className="w-full border-collapse">
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
    </div>
  );
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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

function CheckoutModal({ product, onClose, userId, profile }: { product: Product, onClose: () => void, userId: string, profile: UserProfile | null }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    size: '',
    sellingPrice: '' as string | number,
    deliveryZone: 'inside' as 'inside' | 'outside'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recordCheck, setRecordCheck] = useState<'idle' | 'checking' | 'safe' | 'warning'>('idle');

  const deliveryCharge = DELIVERY_CHARGES[formData.deliveryZone];
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
        deliveryZone: formData.deliveryZone,
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
      
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', product.id);
        const productSnap = await transaction.get(productRef);
        
        if (productSnap.exists()) {
          const currentProduct = productSnap.data() as Product;
          
          if (currentProduct.stockStatus === 'out_of_stock' || (currentProduct.stock !== undefined && currentProduct.stock <= 0)) {
            throw new Error('এই প্রোডাক্টটি বর্তমানে স্টক আউট রয়েছে!');
          }
          
          if (currentProduct.stock !== undefined) {
            const newStock = currentProduct.stock - 1;
            const updateObj: any = { stock: newStock };
            if (newStock <= 0) {
              updateObj.stockStatus = 'out_of_stock';
            }
            transaction.update(productRef, updateObj);
          }
        }
        
        const newOrderRef = doc(collection(db, 'orders'));
        transaction.set(newOrderRef, orderData);
      });
      
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

function OrderList({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResellerOrderDetailsModal({ order, onClose }: { order: Order, onClose: () => void }) {
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
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-text-main flex items-center gap-3">
              Order Tracking
              <span className="text-sm bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold border border-border uppercase">#{order.id.slice(-6)}</span>
            </h3>
            <p className="text-xs text-text-muted font-medium">Status: {order.status}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-[1.25rem] transition-colors border border-border shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h4 className="micro-label">Customer Info</h4>
                <p className="font-bold">{order.customerName}</p>
                <p className="text-sm">{order.customerAddress}</p>
              </div>

              <div className="space-y-3">
                <h4 className="micro-label">Tracking URL</h4>
                {order.trackingLink ? (
                  <a 
                    href={order.trackingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-primary/5 text-primary border border-primary/20 rounded-xl font-bold text-sm"
                  >
                    <ExternalLink size={16} /> Click here to track parcel
                  </a>
                ) : (
                  <p className="text-sm text-text-muted italic bg-slate-50 p-4 rounded-xl border border-border">Parcel tracking link will be updated soon.</p>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-4">
                <span className="micro-label text-slate-500">টাকার আর্থিক বিবরণী (Order Economics)</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-normal mb-1">কিনছেন (Buy)</span>
                    <span className="text-sm font-black text-slate-800">৳{order.basePrice?.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                    <span className="text-[9px] uppercase font-black text-indigo-400 block tracking-normal mb-1">বেচছেন (Sell)</span>
                    <span className="text-sm font-black text-indigo-700">৳{order.sellingPrice?.toLocaleString()}</span>
                  </div>

                  <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-100/50 shadow-sm text-center">
                    <span className="text-[9px] uppercase font-black text-emerald-600 block tracking-normal mb-2">লাভ (Pocket)</span>
                    <span className="text-sm font-black text-emerald-700">৳{order.profit?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-250 pt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Profit Transfer</span>
                  <span className={cn(
                    "px-2.5 py-1 rounded font-black text-[10px] uppercase tracking-wide border",
                    order.profitStatus === 'completed' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                  )}>
                    💰 {order.profitStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Delivery Status Details
              </h4>
              <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {order.statusHistory?.map((log, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-8 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                      i === order.statusHistory!.length - 1 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[13px] text-text-main leading-none mb-1">{log.status}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                ))}
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
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        statusHistory: historyUpdate
      });
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
      await updateDoc(doc(db, 'orders', orderId), { trackingLink: link });
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProfit = async (order: Order) => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', order.userId);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) {
          transaction.set(userRef, { 
            balance: order.profit,
            uid: order.userId,
            displayName: order.resellerName || 'User',
            email: order.resellerEmail || '',
            role: 'user'
          }, { merge: true });
        } else {
          const newBalance = (userSnap.data().balance || 0) + order.profit;
          transaction.update(userRef, { balance: newBalance });
        }
        
        // Add transaction record
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: order.userId,
          amount: order.profit,
          type: 'income',
          status: 'completed',
          description: `Profit for Order #${order.id.slice(-6).toUpperCase()}`,
          date: new Date().toISOString(),
          referenceId: order.id
        });
        
        transaction.update(doc(db, 'orders', order.id), { profitStatus: 'completed' });
      });
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
            onApproveProfit={handleApproveProfit}
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
  onUpdateTracking,
  onApproveProfit
}: { 
  order: Order, 
  onClose: () => void,
  onUpdateStatus: (id: string, s: Order['status'], h: Order['statusHistory']) => void,
  onUpdateTracking: (id: string, l: string) => void,
  onApproveProfit: (o: Order) => void
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
        className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-text-main flex items-center gap-3">
              Order Details
              <span className="text-sm bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold border border-border uppercase">#{order.id.slice(-6)}</span>
            </h3>
            <p className="text-xs text-text-muted font-medium">Placed on {new Date(order.date).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-[1.25rem] transition-colors border border-border shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Customer & Reseller Info */}
            <div className="lg:col-span-2 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <User size={20} className="stroke-[3]" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Customer Information</h4>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <div>
                      <span className="micro-label block mb-1">Name</span>
                      <p className="font-bold text-text-main">{order.customerName}</p>
                    </div>
                    <div>
                      <span className="micro-label block mb-1">Mobile</span>
                      <p className="font-bold text-text-main tracking-tight">{order.customerPhone}</p>
                    </div>
                    <div>
                      <span className="micro-label block mb-1">Address</span>
                      <p className="font-medium text-text-muted text-sm leading-relaxed">{order.customerAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <ShoppingCart size={20} className="stroke-[3]" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Reseller / Shop</h4>
                  </div>
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 space-y-4">
                    <div>
                      <span className="micro-label block mb-1 text-indigo-400">Shop Name</span>
                      <p className="font-black text-indigo-900">{order.resellerShopName}</p>
                    </div>
                    <div>
                      <span className="micro-label block mb-1 text-indigo-400">Owner Name</span>
                      <p className="font-bold text-indigo-900">{order.resellerName}</p>
                    </div>
                    <div>
                      <span className="micro-label block mb-1 text-indigo-400">Reseller Email</span>
                      <p className="font-medium text-indigo-700 text-xs">{order.resellerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600">
                  <Package size={20} className="stroke-[3]" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Product & Pricing</h4>
                </div>
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-border shrink-0">
                      <img src={`https://picsum.photos/seed/${order.productId}/100/100`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-text-main">{order.productTitle}</h5>
                      <p className="text-xs text-text-muted">ID: {order.productId.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <PriceCard label="Base Price" value={order.basePrice} />
                    <PriceCard label="Selling Price" value={order.sellingPrice} highlight />
                    <PriceCard label="Delivery" value={order.deliveryCharge} />
                    <PriceCard label="Reseller Profit" value={order.profit} variant="emerald" />
                  </div>
                </div>
              </div>

              {/* Profit Management Card */}
              {order.status === 'Delivered' && (
                <div className={cn(
                  "p-8 rounded-[2rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6",
                  order.profitStatus === 'completed' 
                    ? "bg-emerald-50 border-emerald-100" 
                    : "bg-orange-50 border-orange-100"
                )}>
                  <div>
                    <h4 className={cn("text-lg font-black tracking-tight", order.profitStatus === 'completed' ? "text-emerald-900" : "text-orange-900")}>
                      {order.profitStatus === 'completed' ? 'Profit Successfully Added' : 'Pending Profit Approval'}
                    </h4>
                    <p className={cn("text-sm font-medium", order.profitStatus === 'completed' ? "text-emerald-600" : "text-orange-600")}>
                      ৳{order.profit} profit is ready to be added to {order.resellerShopName}'s account.
                    </p>
                  </div>
                  {order.profitStatus !== 'completed' && (
                    <button 
                      onClick={() => onApproveProfit(order)}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all active:scale-95"
                    >
                      Accept & Add Profit
                    </button>
                  )}
                  {order.profitStatus === 'completed' && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-white/50 rounded-full border border-emerald-200 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 size={18} /> Profit Settled
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Order Management & Timeline */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800">
                  <LayoutDashboard size={20} className="stroke-[3]" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Order Control</h4>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="micro-label">Update Status</label>
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'], order.statusHistory || [])}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Processing">⚙️ Processing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Returned">❌ Returned</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="micro-label">Tracking Link</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Parcel tracking URL..." 
                        defaultValue={order.trackingLink}
                        onBlur={(e) => onUpdateTracking(order.id, e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl font-medium text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-800">
                  <Clock size={20} className="stroke-[3]" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Delivery Status Details</h4>
                </div>
                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {order.statusHistory?.map((log, i) => (
                    <div key={i} className="relative">
                      <div className={cn(
                        "absolute -left-8 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        i === order.statusHistory!.length - 1 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[13px] text-text-main leading-none mb-1">{log.status}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">{new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        {log.note && <p className="text-xs text-text-muted font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                  {(!order.statusHistory || order.statusHistory.length === 0) && (
                    <p className="text-xs text-text-muted italic opacity-60">No history available yet.</p>
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
  const totalEarnings = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingProfit = orders
    .filter(o => o.profitStatus !== 'completed' && o.status === 'Delivered')
    .reduce((sum, o) => sum + o.profit, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-surface rounded-2xl p-10 border border-border shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-sm overflow-hidden border-2 border-white ring-1 ring-border shrink-0">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" referrerPolicy="no-referrer" />
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-3xl font-black text-text-main tracking-tight">{user.displayName}</h3>
          <p className="micro-label">{profile?.role || 'Reseller'} Partner</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="px-4 py-2 bg-background rounded-lg border border-border text-xs font-bold text-text-muted">
              {user.email}
            </div>
          </div>
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
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', profile.uid);
        const userSnap = await transaction.get(userRef);
        
        const currentBalance = userSnap.data()?.balance || 0;
        if (currentBalance < amount) throw new Error('Insufficient balance');

        // Deduct balance
        transaction.update(userRef, { balance: currentBalance - amount });

        // Add transaction record
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: profile.uid,
          amount,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal via ${paymentMethod} to ${accountNumber}`,
          date: new Date().toISOString()
        });
      });
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
      await updateDoc(doc(db, 'transactions', transId), { status: 'completed' });
      alert('Payout marked as completed!');
    } catch (err) {
      console.error(err);
      alert('Failed to update payout status');
    }
  };

  const handleRejectPayout = async (trans: Transaction) => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', trans.userId);
        const userSnap = await transaction.get(userRef);
        
        // Return money to balance
        const currentBalance = userSnap.data()?.balance || 0;
        transaction.update(userRef, { balance: currentBalance + trans.amount });
        
        // Update transaction status
        transaction.update(doc(db, 'transactions', trans.id), { status: 'failed' });
      });
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

function AdminProductList({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        await addDoc(collection(db, 'products'), {
          ...item,
          stockStatus: 'in_stock',
          stock: 50 // seed with initial 50 stock count
        });
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
        const prRef = doc(db, 'products', editingProduct.id);
        const updateData = { ...payload };
        if (updateData.stock === null) {
          await setDoc(prRef, {
            title: payload.title,
            basePrice: payload.basePrice,
            imageUrl: payload.imageUrl,
            description: payload.description,
            stockStatus: payload.stockStatus
          });
        } else {
          await updateDoc(prRef, updateData);
        }
        alert('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Add new product
        const cleanPayload = { ...payload };
        if (cleanPayload.stock === null) {
          delete cleanPayload.stock;
        }
        await addDoc(collection(db, 'products'), cleanPayload);
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
      await updateDoc(doc(db, 'products', prodId), {
        stockStatus: 'out_of_stock',
        stock: 0
      });
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
                const isOutOfStock = p.stockStatus === 'out_of_stock' || (p.stock !== undefined && p.stock <= 0);
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

                <div className="space-y-1">
                  <label className="micro-label">Image URL</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://picsum.photos/seed/... "
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary transition-all text-sm"
                  />
                  <span className="text-[10px] text-slate-400 font-bold block pt-1">
                    আপনি placeholder image দিতে পারেন, অথবা খালি রাখলে পিকসাম এর একটি রেন্ডম ছবি নিয়ে নিবে।
                  </span>
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
