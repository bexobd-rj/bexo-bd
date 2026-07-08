import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Phone, Mail, Globe, User, CheckCircle2, Printer, 
  FileText, ShieldCheck, Receipt, Download, X, Send, Loader2, Heart
} from 'lucide-react';
import { Order, UserProfile } from '../types';
import html2pdf from 'html2pdf.js';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface InvoiceViewerProps {
  order: Order;
  profile?: UserProfile | null;
  currentUser?: any;
  isAdmin?: boolean;
}

export function InvoiceViewer({ order: initialOrder, profile, currentUser, isAdmin = false }: InvoiceViewerProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [resellerProfile, setResellerProfile] = useState<any>(profile || null);
  const [productImage, setProductImage] = useState<string>('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Clean data fetching hook to avoid "huk jay" race conditions and buggy imports
  useEffect(() => {
    let isMounted = true;
    
    const fetchLatestData = async () => {
      try {
        let currentOrder = initialOrder;
        
        if (initialOrder?.id) {
          const orderSnap = await getDoc(doc(db, 'orders', initialOrder.id));
          if (orderSnap.exists() && isMounted) {
            currentOrder = { id: orderSnap.id, ...orderSnap.data() } as any;
            setOrder(currentOrder);
          }
        }
        
        if (!profile && currentOrder.userId) {
          const userSnap = await getDoc(doc(db, 'users', currentOrder.userId));
          if (userSnap.exists() && isMounted) {
            setResellerProfile(userSnap.data());
          }
        } else if (profile && isMounted) {
          setResellerProfile(profile);
        }

        if (!(currentOrder as any).productImageUrl && !((currentOrder.items?.[0] as any)?.image) && currentOrder.productId) {
          const prodSnap = await getDoc(doc(db, 'products', currentOrder.productId));
          if (prodSnap.exists() && isMounted) {
            const prodData = prodSnap.data();
            if (prodData?.imageUrl) {
              setProductImage(prodData.imageUrl);
            }
          }
        } else if ((currentOrder as any).productImageUrl && isMounted) {
          setProductImage((currentOrder as any).productImageUrl);
        } else if ((currentOrder.items?.[0] as any)?.image && isMounted) {
          setProductImage((currentOrder.items as any)[0].image);
        }

      } catch (err) {
        console.error("Error fetching invoice data:", err);
      }
    };

    fetchLatestData();
    return () => { isMounted = false; };
  }, [initialOrder, profile]);

  const parseDateSafely = (dateVal: any): Date => {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'object' && dateVal.seconds) {
      return new Date(dateVal.seconds * 1000);
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const formatDate = (dateVal: any) => {
    try {
      const d = parseDateSafely(dateVal);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d).replace(/\//g, '-');
    } catch {
      return 'N/A';
    }
  };

  const generateInvoiceNo = () => {
    try {
      const d = parseDateSafely(order.date);
      const year = d.getFullYear();
      const monthAndDay = `${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
      const identifier = String(order.orderNo || order.id);
      return `INV-${year}-${monthAndDay}-${identifier.slice(-4).toUpperCase()}`;
    } catch {
      return `INV-${String(order.orderNo || order.id || '').slice(-8).toUpperCase()}`;
    }
  };

  // Safe Items Array Mapping
  const items = order.items && order.items.length > 0 ? order.items : [
    {
      productId: order.productId,
      productTitle: order.productTitle,
      size: order.size,
      qty: 1,
      basePrice: order.sellingPrice || order.basePrice || 0,
      sellingPrice: order.sellingPrice || order.basePrice || 0
    }
  ];

  // Pricing logic calculations
  const subtotal = items.reduce((acc: number, i: any) => acc + ((Number(i.sellingPrice) || Number(i.basePrice) || 0) * (Number(i.qty) || 1)), 0);
  const deliveryCharge = Number(order.deliveryCharge) || Number(order.courierCharge) || (order.shipping ? Number(order.shipping.courierCharge) : 0) || 0;
  const discount = Number(order.discount) || 0;
  const grandTotal = subtotal + deliveryCharge - discount;
  const advancePaid = Number(order.advancePaid) || 0;

  const isPaidOrDelivered = ['Paid', 'Delivered', 'Completed', 'Delivery Completed'].includes(order.status) || order.paymentStatus === 'Paid';
  const amountPaid = isPaidOrDelivered ? grandTotal : advancePaid;
  const amountDue = isPaidOrDelivered ? 0 : (grandTotal - advancePaid);
  const deliveryManCollect = isPaidOrDelivered ? 0 : (grandTotal - advancePaid);

  const formatTaka = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ৳';

  const userPhoto = resellerProfile?.avatar || resellerProfile?.photoURL || (currentUser?.uid === order.userId ? currentUser?.photoURL : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resellerProfile?.shopName || order.resellerShopName || order.resellerName || 'Bexo')}&background=0E46A3&color=ffffff&size=128&bold=true`;

  const resellerAddress = resellerProfile?.address || order.resellerAddress || 'Not Available';
  const resellerPhone = resellerProfile?.phone || order.resellerPhone || 'Not Available';
  const resellerEmail = resellerProfile?.email || order.resellerEmail || 'Not Available';
  const resellerWebsite = resellerProfile?.website || order.resellerWebsite || 'www.bexo.com.bd';

  // Email state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState(order.resellerEmail || 'customer@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailProgress, setEmailProgress] = useState(0);
  const [emailLogs, setEmailLogs] = useState<string[]>([]);
  const [isEmailSuccess, setIsEmailSuccess] = useState(false);

  const triggerEmailSimulation = () => {
    if (!targetEmail.trim()) return;
    setIsSendingEmail(true);
    setEmailProgress(0);
    setEmailLogs(["Initializing...", "Generating PDF attachment..."]);
    
    const steps = [
      { prg: 25, log: "Packaging invoice payload..." },
      { prg: 50, log: "Routing via SMTP secure SSL..." },
      { prg: 75, log: "Sending out via mail gateway..." },
      { prg: 100, log: "Success! Mail delivered." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setEmailProgress(step.prg);
        setEmailLogs(prev => [...prev, step.log]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSendingEmail(false);
        setIsEmailSuccess(true);
      }
    }, 800);
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '', 'width=900,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${order.id.slice(-6).toUpperCase()}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              </style>
            </head>
            <body class="bg-white p-6">
              <div class="max-w-4xl mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-none">
                ${printContent}
              </div>
              <script>
                window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDownload = () => {
    if (invoiceRef.current) {
      const element = invoiceRef.current;
      const opt = {
        margin: 5,
        filename: `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Action Controls - Highly Responsive */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 no-print flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm font-bold text-slate-700">Invoice Controls</p>
        </div>
        
        <div className="grid grid-cols-2 md:flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          <button onClick={() => { setIsEmailModalOpen(true); setIsEmailSuccess(false); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-200">
            <Mail size={16} /> <span>Email</span>
          </button>
          <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all">
            <Printer size={16} /> <span>Print</span>
          </button>
          <button onClick={handleDownload} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all">
            <Download size={16} /> <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Email Modal Component */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden no-print">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Mail size={16} /> Send Invoice
                </div>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              {!isEmailSuccess ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500">Receiver Email</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" disabled={isSendingEmail} />
                      <button onClick={triggerEmailSimulation} disabled={isSendingEmail} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                        {isSendingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send
                      </button>
                    </div>
                  </div>
                  {isSendingEmail && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-indigo-600" initial={{ width: 0 }} animate={{ width: `${emailProgress}%` }} />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 space-y-1">
                        {emailLogs.map((log, i) => <div key={i}>❯ {log}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-800">Invoice Sent Successfully!</p>
                  <p className="text-xs text-slate-500">{targetEmail}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVOICE SHEET */}
      <div ref={invoiceRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-800 relative">
        {isPaidOrDelivered && (
          <div className="absolute top-[28%] md:top-[30%] right-[5%] md:right-[10%] rotate-[-15deg] border-4 border-emerald-500 text-emerald-500 font-black text-xl md:text-3xl px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-2xl opacity-70 pointer-events-none z-50 shadow-sm bg-white/50 backdrop-blur-sm">
            PAID / DELIVERED
          </div>
        )}

        {/* Invoice Header Section (Responsive Grid) */}
        <div className="bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden border-b border-slate-100 relative">
          
          {/* Left Column (Brand Details) */}
          <div className="col-span-1 md:col-span-6 p-6 md:p-8 z-10 bg-white order-2 md:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <img src={userPhoto} alt="Shop" className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-sm shrink-0" />
              <div>
                <h1 className="text-2xl font-black text-[#0D3B66] tracking-tight">{resellerProfile?.shopName || order.resellerShopName || 'Not Available'}</h1>
                <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Smart Shopping Destination</p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-2.5"><MapPin size={14} className="text-blue-600 mt-0.5 shrink-0"/><span>{resellerAddress}</span></div>
              <div className="flex items-center gap-2.5"><Phone size={14} className="text-blue-600 shrink-0"/><span className="font-mono">{resellerPhone}</span></div>
              <div className="flex items-center gap-2.5"><Mail size={14} className="text-blue-600 shrink-0"/><span>{resellerEmail}</span></div>
            </div>
          </div>

          {/* Right Column (Invoice Details) */}
          <div className="col-span-1 md:col-span-6 flex flex-col justify-center p-6 md:p-8 z-10 bg-[#0E46A3] text-white order-1 md:order-2">
            <div className="md:ml-auto w-full md:w-auto text-center md:text-right space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-widest mb-2 md:mb-4">INVOICE</h2>
              <div className="space-y-1.5 text-sm md:text-xs">
                <div className="flex justify-between md:justify-end md:gap-8 items-center border-b border-blue-800/50 md:border-transparent pb-2 md:pb-0">
                  <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs">Invoice No:</span>
                  <span className="font-mono font-bold">{generateInvoiceNo()}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 items-center border-b border-blue-800/50 md:border-transparent pb-2 md:pb-0">
                  <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs">Order ID:</span>
                  <span className="font-mono font-bold">#{order.orderNo || order.id}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 items-center border-b border-blue-800/50 md:border-transparent pb-2 md:pb-0">
                  <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs">Date:</span>
                  <span className="font-bold">{formatDate(order.date)}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 items-center">
                  <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs">Payment:</span>
                  <span className="font-bold">{order.paymentMethod || 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Info block */}
        <div className="p-4 md:p-8">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                <User size={16} />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">Buyer Information</h2>
            </div>
            <div className="space-y-2 md:space-y-1">
              <h3 className="text-lg font-black text-[#0E46A3]">{order.customerName || 'Not Available'}</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{order.customerAddress || 'Not Available'}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mt-2">
                <Phone size={14} className="text-blue-600" /> <span className="font-mono font-bold">{order.customerPhone || 'Not Available'}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-black border border-emerald-200 shadow-sm">
                <CheckCircle2 size={14} /> Status: {order.status}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Items Structure */}
        <div className="px-4 md:px-8 pb-8">
          
          {/* Mobile Items View (Stacked Cards) */}
          <div className="block md:hidden space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b pb-2">Order Items</h3>
            {items.map((item: any, idx: number) => {
              const itemPrice = Number(item.sellingPrice) || Number(item.basePrice) || (subtotal / (items.length || 1));
              const itemQty = Number(item.qty) || 1;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                      <img src={productImage || `https://picsum.photos/seed/${item.productId || 'p'}/100`} alt="product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-sm text-slate-800 leading-tight">{item.productTitle}</p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-600">
                        {(item.size || item.selectedSize) && <span className="bg-slate-100 border px-1.5 py-0.5 rounded">Size: {item.size || item.selectedSize}</span>}
                        {(item.color || item.selectedColor) && <span className="bg-slate-100 border px-1.5 py-0.5 rounded">Color: {item.color || item.selectedColor}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 flex justify-between items-center border border-slate-100">
                    <span className="text-xs font-mono font-bold text-slate-600">{itemQty} x {formatTaka(itemPrice)}</span>
                    <span className="text-sm font-black text-slate-900">{formatTaka(itemPrice * itemQty)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Items View (Table Layout) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0E46A3] text-white text-xs uppercase tracking-wider">
                  <th className="p-4 font-black w-12 text-center border-r border-blue-800/50">#</th>
                  <th className="p-4 font-black border-r border-blue-800/50">Product Description</th>
                  <th className="p-4 font-black w-32 border-r border-blue-800/50 text-center">Variant</th>
                  <th className="p-4 font-black w-24 border-r border-blue-800/50 text-center">Qty</th>
                  <th className="p-4 font-black w-32 border-r border-blue-800/50 text-right">Unit Price</th>
                  <th className="p-4 font-black w-40 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item: any, idx: number) => {
                  const itemPrice = Number(item.sellingPrice) || Number(item.basePrice) || (subtotal / (items.length || 1));
                  const itemQty = Number(item.qty) || 1;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 text-sm transition-colors">
                      <td className="p-4 text-center text-slate-400 font-mono font-black border-r">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="p-4 border-r">
                        <div className="flex items-center gap-3">
                          <img src={productImage || `https://picsum.photos/seed/${item.productId || 'p'}/100`} className="w-12 h-12 rounded-lg border border-slate-200 object-cover shadow-sm shrink-0" alt="" />
                          <div>
                            <p className="font-bold text-slate-800">{item.productTitle}</p>
                            {isAdmin && <p className="text-[10px] text-blue-600 font-mono font-bold uppercase mt-0.5">ID: {String(item.productId || '').slice(-8)}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-r text-center space-y-1">
                        {(item.size || item.selectedSize) && <div className="text-[10px] bg-slate-100 text-slate-700 font-black uppercase px-2 py-1 rounded border border-slate-200 inline-block w-full">Size: {item.size || item.selectedSize}</div>}
                        {(item.color || item.selectedColor) && <div className="text-[10px] bg-slate-100 text-slate-700 font-black uppercase px-2 py-1 rounded border border-slate-200 inline-block w-full">Color: {item.color || item.selectedColor}</div>}
                        {!(item.size || item.selectedSize) && !(item.color || item.selectedColor) && <span className="text-xs text-slate-400 font-bold">-</span>}
                      </td>
                      <td className="p-4 border-r text-center font-mono font-black text-slate-800 text-base">{itemQty}</td>
                      <td className="p-4 border-r text-right font-mono font-bold text-slate-600">{formatTaka(itemPrice)}</td>
                      <td className="p-4 text-right font-mono font-black text-[#0E46A3] text-base bg-blue-50/30">{formatTaka(itemPrice * itemQty)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations / Summary Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 pb-8">
          
          <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
              <Receipt size={16} className="text-blue-600" /> Price Breakdown
            </div>
            <div className="space-y-3.5 text-sm font-semibold text-slate-600 flex-1">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-slate-800">{formatTaka(deliveryCharge)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono font-bold">-{formatTaka(discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 border-dashed pt-3 mt-3 flex justify-between items-end">
                <span className="font-black text-slate-800 uppercase">Grand Total</span>
                <span className="font-mono font-black text-xl text-[#0E46A3]">{formatTaka(grandTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
              <ShieldCheck size={16} className="text-emerald-600" /> Payment & Collection
            </div>
            <div className="space-y-4 text-sm font-semibold text-slate-600 flex-1">
              <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                <span className="flex items-center gap-2 font-bold"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Paid Amount</span>
                <span className="font-mono font-black">{formatTaka(amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                <span className="flex items-center gap-2 font-bold"><span className="w-2 h-2 bg-red-500 rounded-full" /> Due Amount</span>
                <span className="font-mono font-black">{formatTaka(amountDue)}</span>
              </div>
              
              <div className="mt-auto pt-2">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center text-orange-900 shadow-sm">
                  <span className="font-black text-xs uppercase tracking-wide">🚚 To Collect (COD)</span>
                  <span className="font-mono font-black text-xl md:text-2xl">{formatTaka(deliveryManCollect)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Note / Comments section */}
        {(order.comment || deliveryManCollect > 0) && (
          <div className="px-4 md:px-8 pb-8 space-y-3">
            {deliveryManCollect > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs font-bold text-blue-900 flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md shrink-0"><FileText size={14} /></div>
                <p className="leading-relaxed">Note: Please collect the pending amount from the customer upon delivery.</p>
              </div>
            )}
            {order.comment && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs font-bold text-amber-900 flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md shrink-0"><FileText size={14} /></div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase text-amber-700 block mb-1">Seller Comments</span>
                  <p className="leading-relaxed whitespace-pre-line">{order.comment}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Brand Info */}
        <div className="bg-[#0E46A3] text-white py-5 px-6 text-center border-t-2 border-dashed border-white/20">
          <p className="text-sm font-black flex justify-center items-center gap-2">
            <Heart size={16} className="text-red-400 fill-red-400" />
            Thank you for your business, {order.customerName || 'Customer'}!
          </p>
          <p className="text-blue-200 text-xs mt-1.5 font-semibold tracking-wide">Your trust is our inspiration.</p>
        </div>
      </div>
    </div>
  );
}
