import React, { useState } from 'react';
import { 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Banknote, 
  ClipboardList, 
  ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { 
  doc, 
  runTransaction, 
  collection 
} from 'firebase/firestore';
import { Order, Transaction } from '../types';
import { useBackButtonModal } from '../lib/utils';

interface AdminTransferPanelProps {
  orders: Order[];
}

export function AdminTransferPanel({ orders }: AdminTransferPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferNote, setTransferNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useBackButtonModal(!!selectedOrder, () => setSelectedOrder(null));

  // Filter: ONLY Delivered orders as requested (ডেলিভারি কনফার্মড)
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const filteredOrders = deliveredOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.resellerName && o.resellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.resellerShopName && o.resellerShopName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setTransferAmount(order.profit);
    setTransferNote('');
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleProcessTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (transferAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক টাকা লিখুন (Amount must be greater than 0)');
      return;
    }

    const confirmMsg = `আপনি কি নিশ্চিত যে #${selectedOrder.id.slice(-6).toUpperCase()} অর্ডারের জন্য ${transferAmount} টাকা ট্রান্সফার করতে চান?`;
    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', selectedOrder.userId);
        const userSnap = await transaction.get(userRef);

        let currentBalance = 0;
        if (userSnap.exists()) {
          currentBalance = userSnap.data().balance || 0;
        }

        const newBalance = currentBalance + transferAmount;

        // 1. Update reseller's balance
        transaction.update(userRef, { balance: newBalance });

        // 2. Add transaction record
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: selectedOrder.userId,
          amount: transferAmount,
          type: 'income',
          status: 'completed',
          description: `অর্ডার #${selectedOrder.id.slice(-6).toUpperCase()} এর জন্য মুনাফা ট্রান্সফার ${transferNote ? `(${transferNote})` : ''}`,
          date: new Date().toISOString(),
          referenceId: selectedOrder.id
        });

        // 3. Mark profit status as completed
        transaction.update(doc(db, 'orders', selectedOrder.id), { 
          profitStatus: 'completed' 
        });
      });

      alert('সফলভাবে টাকা ট্রান্সফার হয়েছে! ইউজারের ব্যালেন্স এবং অর্ডারের স্ট্যাটাস আপডেট করা হয়েছে।');
      handleCloseModal();
    } catch (err) {
      console.error('Manual payout transaction fails:', err);
      alert('টাকা ট্রান্সফার ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100/70 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-100">
            <ClipboardList size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">ডেলিভারি কনফার্মড অর্ডার ও পেমেন্ট ট্রান্সফার</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              নিচের তালিকা থেকে শুধুমাত্র ডেলিভারি কনফার্ম করা অর্ডারগুলো দেখা যাবে। এখান থেকে ম্যানুয়ালি টাকা ট্রান্সফার করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
          <span>ডেলিভারি কনফার্মড তালিকা</span>
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100 font-bold">
            {filteredOrders.length} টি অর্ডার
          </span>
        </h4>
        
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="অর্ডার আইডি, কাস্টমার বা রিসেলারের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors bg-slate-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-6 py-4">অর্ডার আইডি</th>
                <th className="px-6 py-4">ব্যবহারকারীর নাম</th>
                <th className="px-6 py-4">মোট মুনাফা</th>
                <th className="px-6 py-4">ডেলিভারি স্ট্যাটাস</th>
                <th className="px-6 py-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    কোনো ডেলিভারি কনফার্মড অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.profitStatus === 'completed';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        #{order.id.slice(-6).toUpperCase()}
                        <span className="block text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                          {new Date(order.date).toLocaleDateString('bn-BD')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{order.resellerName || 'রিসেলার'}</div>
                        <div className="text-[10px] text-slate-400">{order.resellerShopName || 'শপ নেই'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        ৳{order.profit}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          কনফার্মড
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50/80 text-emerald-600 border border-emerald-200">
                            <CheckCircle2 size={10} /> পরিশোধিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-200 animate-pulse">
                            <AlertCircle size={10} /> পেন্ডিং
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPaid ? (
                          <button 
                            disabled 
                            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[11px] font-bold cursor-not-allowed border border-slate-200/50"
                          >
                            ট্রান্সফার হয়ে গেছে
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenModal(order)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-black transition-all hover:scale-[1.03] active:scale-95 shadow-md shadow-orange-100 hover:shadow-lg"
                          >
                            <Banknote size={13} />
                            <span>টাকা ট্রান্সফার করুন</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Banknote className="text-orange-600" size={18} />
                  <span>টাকা ট্রান্সফার করুন</span>
                </h3>
                <button 
                  onClick={handleCloseModal} 
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleProcessTransfer} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">ব্যবহারকারীর নাম</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none" 
                    value={selectedOrder.resellerName || 'রিসেলার'} 
                    readOnly 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">ট্রান্সফার করার পরিমাণ (টাকা)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">৳</span>
                    <input 
                      type="number" 
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500 transition-colors" 
                      required
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">মন্তব্য (ঐচ্ছিক)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="কোনো নোট বা মন্তব্য থাকলে লিখুন..."
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-orange-100 hover:shadow-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'ট্রান্সফার কনফার্ম করুন'}</span>
                    {!isSubmitting && <ArrowUpRight size={14} />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
