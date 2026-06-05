import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Edit2, 
  ShieldAlert, 
  UserCheck, 
  Truck, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Play,
  X,
  TrendingUp,
  Settings
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

interface AdminUsersListProps {
  allUsers: UserProfile[];
  transactions: Transaction[];
}

type TabType = 'resellers' | 'suppliers' | 'admins' | 'all-transactions';

export function AdminUsersList({ allUsers, transactions }: AdminUsersListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resellers');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected user for balance editing
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  // Metrics
  const resellers = allUsers.filter(u => u.role === 'user' || !u.role);
  const suppliers = allUsers.filter(u => u.role === 'supplier');
  const admins = allUsers.filter(u => u.role === 'admin');
  const totalBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);

  // Filter users based on search and active tab
  const filteredUsers = allUsers.filter(u => {
    const isMatchedRole = activeTab === 'resellers' 
      ? (u.role === 'user' || !u.role) 
      : activeTab === 'suppliers'
        ? (u.role === 'supplier')
        : (u.role === 'admin');

    const matchesSearch = 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchTerm.toLowerCase());

    return isMatchedRole && matchesSearch;
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const userMatched = allUsers.find(u => u.uid === t.userId);
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userMatched?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userMatched?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleRoleChange = async (userId: string, targetRole: UserProfile['role']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: targetRole });
      alert(`User role updated to ${targetRole} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update user role.');
    }
  };

  const handleSaveBalance = async () => {
    if (!editingUser) return;
    setIsSavingBalance(true);
    try {
      const parsed = parseFloat(newBalance);
      if (isNaN(parsed) || parsed < 0) {
        alert('Please enter a valid positive number');
        setIsSavingBalance(false);
        return;
      }
      await updateDoc(doc(db, 'users', editingUser.uid), { balance: parsed });
      setEditingUser(null);
      setNewBalance('');
      alert('Reseller balance updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update user balance.');
    } finally {
      setIsSavingBalance(false);
    }
  };

  const getUserLabel = (userId: string) => {
    const found = allUsers.find(u => u.uid === userId);
    if (found) {
      return (
        <div>
          <span className="font-bold text-slate-800">{found.displayName}</span>
          <span className="text-[10px] text-slate-400 block">{found.email}</span>
        </div>
      );
    }
    return <span className="font-mono text-slate-500 text-xs">ID: {userId.slice(-6).toUpperCase()}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Super Admin Top Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-primary stroke-[2.5]" size={32} />
            Super Admin Control Center
          </h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Global access view of all users, reseller entities, suppliers, and payment histories.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<Users className="text-blue-500" size={24} />}
          label="Total Active Resellers"
          value={resellers.length}
          sub={`+${admins.length} administrators in backend`}
          bg="bg-blue-500/5 border-blue-100"
        />
        <MetricCard 
          icon={<Truck className="text-indigo-500" size={24} />}
          label="Dropship Suppliers"
          value={suppliers.length}
          sub="Verified wholesale suppliers"
          bg="bg-indigo-500/5 border-indigo-100"
        />
        <MetricCard 
          icon={<DollarSign className="text-emerald-500" size={24} />}
          label="Cumulative Vault Balance"
          value={`৳ ${totalBalance.toLocaleString()}`}
          sub="Total outstanding escrow funds"
          bg="bg-emerald-500/5 border-emerald-100"
        />
        <MetricCard 
          icon={<Settings className="text-slate-500" size={24} />}
          label="System Database Users"
          value={allUsers.length}
          sub="Connected across all nodes"
          bg="bg-slate-500/5 border-slate-100"
        />
      </div>

      {/* Search & Controller Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Custom Tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
            <button 
              onClick={() => { setActiveTab('resellers'); setSearchTerm(''); }}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === 'resellers' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              👥 Resellers ({resellers.length})
            </button>
            <button 
              onClick={() => { setActiveTab('suppliers'); setSearchTerm(''); }}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === 'suppliers' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              🚚 Wholesale Suppliers ({suppliers.length})
            </button>
            <button 
              onClick={() => { setActiveTab('admins'); setSearchTerm(''); }}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === 'admins' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              🔑 Admins ({admins.length})
            </button>
            <button 
              onClick={() => { setActiveTab('all-transactions'); setSearchTerm(''); }}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === 'all-transactions' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              💸 All Payments ({transactions.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'all-transactions' ? "Search transactions, amounts, descriptions..." : "Search user name, email, shop, phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-all"
            />
          </div>
        </div>

        {/* Tab content renders */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          {activeTab !== 'all-transactions' ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="px-6 py-4 text-left">UID / Name</th>
                  <th className="px-6 py-4 text-left">Shop Details</th>
                  <th className="px-6 py-4 text-left">Contact Info</th>
                  <th className="px-6 py-4 text-left">Balance (চলতি হিসাব)</th>
                  <th className="px-6 py-4 text-left">User Role Type</th>
                  <th className="px-6 py-4 text-right">Database Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredUsers.map((item) => (
                  <tr key={item.uid} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-xs">
                          {item.displayName?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 leading-none mb-1">{item.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {item.uid.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{item.shopName || 'Not Set'}</p>
                      <p className="text-[10px] text-slate-400">Owner Entity</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{item.email}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">৳ {(item.balance || 0).toLocaleString()}</span>
                        <button 
                          onClick={() => {
                            setEditingUser(item);
                            setNewBalance(item.balance.toString());
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-primary transition-colors"
                          title="Modify Wallet Balance"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={item.role || 'user'}
                        onChange={(e) => handleRoleChange(item.uid, e.target.value as UserProfile['role'])}
                        className="bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-xs font-bold text-slate-750 focus:outline-none"
                      >
                        <option value="user">👤 Reseller (User)</option>
                        <option value="supplier">🚚 Supplier</option>
                        <option value="admin">🔑 Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.email === 'bexobd@gmail.com' ? (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-black border border-red-100">ROOT OWNER</span>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleRoleChange(item.uid, 'admin')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                          >
                            Set Admin
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="px-6 py-4 text-left">Timestamp / ID</th>
                  <th className="px-6 py-4 text-left">Target User Profiling</th>
                  <th className="px-6 py-4 text-left">Transaction Details</th>
                  <th className="px-6 py-4 text-left">Cash Amount</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">#{t.id ? t.id.slice(-6).toUpperCase() : 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getUserLabel(t.userId)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-850 leading-relaxed text-xs">{t.description}</p>
                      {t.referenceId && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black mt-2 inline-block">REF: #{t.referenceId.slice(-6).toUpperCase()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900">৳ {t.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'income' ? (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 w-max">
                          <ArrowUpRight size={10} /> Profit Credit
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1 w-max">
                          <ArrowDownLeft size={10} /> Payout Withdrawal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] uppercase font-black px-2 py-0.5 rounded-full",
                        t.status === 'completed' ? "bg-emerald-100 text-emerald-800" : "",
                        t.status === 'pending' ? "bg-amber-100 text-amber-850 animate-pulse" : "",
                        t.status === 'failed' ? "bg-red-105 text-red-700 font-bold" : ""
                      )}>
                        ● {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                      No system payment logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modify Wallet Balance Sub-Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            onClick={() => setEditingUser(null)} 
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Manual Balance Override</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-50 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Adjusting cash balance directly for reseller: <strong>{editingUser.displayName}</strong> ({editingUser.email}).
              </p>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Set Balance (Bangladeshi Taka)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input 
                    type="number" 
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-black text-base"
                    placeholder="Enter amount..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveBalance}
                disabled={isSavingBalance}
                className="flex-1 py-3 bg-primary hover:bg-opacity-90 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-1 shadow-lg shadow-primary/20"
              >
                {isSavingBalance ? 'Saving...' : 'Apply Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component Helper
function MetricCard({ 
  icon, 
  label, 
  value, 
  sub, 
  bg 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  sub: string; 
  bg: string;
}) {
  return (
    <div className={cn("p-6 rounded-2xl border flex items-start gap-4 transition-all shadow-sm bg-white", bg)}>
      <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">{label}</span>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none py-1">{value}</h4>
        <span className="text-[10px] font-bold text-slate-500 block leading-tight">{sub}</span>
      </div>
    </div>
  );
}
