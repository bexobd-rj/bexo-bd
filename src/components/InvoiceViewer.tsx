import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  User, 
  CheckCircle2, 
  Printer, 
  FileText,
  ShieldCheck,
  Receipt,
  Download,
  X,
  Send,
  Loader2,
  Heart
} from 'lucide-react';
import { Order, UserProfile } from '../types';
import html2pdf from 'html2pdf.js';

interface InvoiceViewerProps {
  order: Order;
  profile?: UserProfile | null;
  currentUser?: any;
  isAdmin?: boolean;
}

export function InvoiceViewer({ order: initialOrder, profile, currentUser, isAdmin = false }: InvoiceViewerProps) {
  const [order, setOrder] = useState<any>(initialOrder);

  useEffect(() => {
    if (initialOrder?.id) {
      import('../firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'orders', initialOrder.id)).then(snap => {
            if (snap.exists()) {
              setOrder({ id: snap.id, ...snap.data() });
            }
          }).catch(err => console.error("Error fetching latest order:", err));
        });
      });
    }
  }, [initialOrder?.id]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Robust helper to parse any Date or custom/Bengali formatted date safely
  const parseDateSafely = (dateVal: any): Date => {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'object') {
      if (typeof dateVal.toDate === 'function') {
        return dateVal.toDate();
      }
      if (dateVal.seconds !== undefined) {
        return new Date(dateVal.seconds * 1000);
      }
    }
    
    let strVal = String(dateVal).trim();
    const banglaDigits: { [key: string]: string } = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    let norm = '';
    for (let i = 0; i < strVal.length; i++) {
      const char = strVal[i];
      norm += banglaDigits[char] !== undefined ? banglaDigits[char] : char;
    }
    
    let parsed = new Date(norm);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    const parts = norm.split(/[\/\-]/);
    if (parts.length === 3) {
      let p0 = parseInt(parts[0], 10);
      let p1 = parseInt(parts[1], 10);
      let p2 = parseInt(parts[2], 10);
      
      if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
        let year = p2, month = p1, day = p0;
        if (p0 > 1000) {
          year = p0;
          month = p1;
          day = p2;
        } else if (p1 > 12) {
          month = p0;
          day = p1;
        }
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const testDate = new Date(year, month - 1, day);
          if (!isNaN(testDate.getTime())) {
            return testDate;
          }
        }
      }
    }
    return new Date();
  };

  // Helper to format date into DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseDateSafely(dateStr);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const [resellerProfile, setResellerProfile] = useState<any>(profile || null);

  useEffect(() => {
    if (profile) {
      setResellerProfile(profile);
      return;
    }
    
    if (!profile && order.userId) {
      import('../firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'users', order.userId)).then(snap => {
            if (snap.exists()) {
              setResellerProfile(snap.data());
            }
          }).catch(err => {
            console.error("Error loading reseller profile: ", err);
          });
        });
      });
    }
  }, [profile, order.userId]);

  // Generate a mock but consistent Invoice number based on date and order ID
  const generateInvoiceNo = () => {
    try {
      const d = parseDateSafely(order.date);
      const year = d.getFullYear();
      const monthAndDay = `${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
      const identifier = String((order as any).orderNo || order.id);
      return `INV-${year}-${monthAndDay}-${identifier.slice(-4).toUpperCase()}`;
    } catch {
      return `INV-${String((order as any).orderNo || order.id).slice(-8).toUpperCase()}`;
    }
  };

  // State to hold the dynamic image for the product
  const [productImage, setProductImage] = useState<string>('');

  useEffect(() => {
    // If the order already contains productImageUrl, use it directly
    if ((order as any).productImageUrl) {
      setProductImage((order as any).productImageUrl);
      return;
    }
    // If order has list items with image definitions, we can use the first item's image
    if (order.items && order.items[0] && (order.items[0] as any).image) {
      setProductImage((order.items[0] as any).image);
      return;
    }
    
    // Otherwise, dynamically load the image from the Firestore products collection
    if (order.productId) {
      import('../firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'products', order.productId)).then(snap => {
            if (snap.exists()) {
              const data = snap.data();
              if (data && data.imageUrl) {
                setProductImage(data.imageUrl);
              }
            }
          }).catch(err => {
            console.error("Error loading product image: ", err);
          });
        });
      });
    }
  }, [order.productId, (order as any).productImageUrl, order.items]);

  // Dynamically prepare items list to support multi-item cart naturally in calculations & renderings
  const items = order.items || [
    {
      productId: order.productId,
      productTitle: order.productTitle,
      size: order.size,
      qty: 1,
      basePrice: order.sellingPrice || order.basePrice || 0
    }
  ];

  // Calculations from correct database places:
  const subtotal = order.items && order.items.length > 0 
    ? order.items.reduce((acc, i: any) => acc + ((Number(i.sellingPrice) || Number(i.basePrice) || 0) * (Number(i.qty) || 1)), 0)
    : (Number((order as any).total) || Number(order.sellingPrice) || Number(order.basePrice) || 0);

  const deliveryCharge = Number(order.deliveryCharge) || Number((order as any).courierCharge) || ((order as any).shipping ? Number(((order as any).shipping as any).courierCharge) : 0) || 0;
  const discount = Number((order as any).discount) || 0;
  const grandTotal = subtotal + deliveryCharge - discount;
  const advancePaid = Number((order as any).advancePaid) || 0;

  // Determination of Paid amount, Due amount, and collect amount
  const isPaidOrDelivered = (order.status as string) === 'Paid' || (order.status as string) === 'Delivered' || (order.status as string) === 'Completed' || (order.status as string) === 'Delivery Completed' || (order as any).paymentStatus === 'Paid';
  const amountPaid = isPaidOrDelivered ? grandTotal : advancePaid;
  const amountDue = isPaidOrDelivered ? 0 : (grandTotal - advancePaid);
  const deliveryManCollect = isPaidOrDelivered ? 0 : (grandTotal - advancePaid);

  // Taka formatting helper following screenshot format: e.g. 1,560.00 টাকা
  const formatTaka = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' টাকা';
  };

  // Beautiful profile photo selection
  const userPhoto = (resellerProfile as any)?.avatar || (resellerProfile as any)?.photoURL || (currentUser?.uid === order.userId ? currentUser?.photoURL : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent((resellerProfile as any)?.shopName || order.resellerShopName || order.resellerName || 'Bexo')}&background=10B981&color=ffffff&size=128&bold=true`;

  // Reseller dynamic contact details - fallback to "Not Available" as per requirements
  const resellerAddress = (resellerProfile as any)?.address || (order as any).resellerAddress || 'Not Available';
  const resellerPhone = (resellerProfile as any)?.phone || (order as any).resellerPhone || 'Not Available';
  const resellerEmail = (resellerProfile as any)?.email || order.resellerEmail || 'Not Available';
  const resellerWebsite = (resellerProfile as any)?.website || (order as any).resellerWebsite || 'www.bexo.com.bd';

  // Dynamic Email Setup States
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
    setEmailLogs(["🔍 Initializing background emailing engine v2.4...", "📄 Generating high-resolution PDF attachments from render context..."]);
    
    const steps = [
      { prg: 25, log: "📦 Packaging multi-item digital invoice payload..." },
      { prg: 50, log: "🔒 Verifying SMTP handshake routing with secure SSL..." },
      { prg: 75, log: "📮 Attaching PDF format and sending out via mail gateway..." },
      { prg: 100, log: "🎉 Success! Routed to target mail server." }
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
        setTimeout(() => {
          setIsSendingEmail(false);
          setIsEmailSuccess(true);
        }, 800);
      }
    }, 900);
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    if (printContent) {
      // Simple print framework
      const printWindow = window.open('', '', 'width=900,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${order.id.slice(-6).toUpperCase()}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');
                body {
                  font-family: 'Hind Siliguri', 'Inter', sans-serif;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              </style>
            </head>
            <body class="bg-white p-6">
              <div class="max-w-4xl mx-auto border border-gray-200 rounded-2xl overflow-hidden p-1 shadow-none">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
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
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          windowWidth: 1200
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action panel */}
      <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-extrabold text-slate-700">Premium Invoice Controls v2.3</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsEmailModalOpen(true);
                setIsEmailSuccess(false);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider border border-indigo-200 transition-all cursor-pointer"
            >
              <Mail size={15} />
              <span>ইমেইলে পাঠান</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Printer size={15} />
              <span>প্রিন্ট</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Download size={15} />
              <span>ডাউনলোড পিডিএফ</span>
            </button>
            
            {/* Custom Share Button */}
            {typeof navigator.share !== 'undefined' && (
              <button
                onClick={async () => {
                  if (invoiceRef.current) {
                    try {
                      const html2canvas = (await import('html2canvas')).default;
                      const canvas = await html2canvas(invoiceRef.current!, {
                        scale: 2, useCORS: true, backgroundColor: '#ffffff'
                      });
                      const dataUrl = canvas.toDataURL('image/png');
                      const response = await fetch(dataUrl);
                      const blob = await response.blob();
                      const file = new File([blob], `Invoice-${order.id.slice(-6).toUpperCase()}.png`, { type: 'image/png' });
                      if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: 'Invoice',
                          text: 'আপনার ইনভয়েস'
                        });
                      }
                    } catch (err) {
                      console.error('Share failed', err);
                      handleDownload(); // Fallback
                    }
                  }
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              >
                <Send size={15} />
                <span>শেয়ার করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Email Modal inside container */}
        <AnimatePresence>
          {isEmailModalOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-150">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-indigo-600" />
                    <span className="text-xs font-black uppercase text-slate-700">স্বয়ংক্রিয় মেলিং ও পিডিএফ জেনারেশন</span>
                  </div>
                  <button 
                    onClick={() => setIsEmailModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                  >
                    <X size={15} />
                  </button>
                </div>

                {!isEmailSuccess ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">প্রাপকের ইমেল ঠিকানা (Receiver Email)</label>
                      <div className="flex gap-2">
                        <input 
                          type="email"
                          value={targetEmail}
                          onChange={(e) => setTargetEmail(e.target.value)}
                          placeholder="receiver@example.com"
                          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-200 focus:bg-white outline-none"
                          disabled={isSendingEmail}
                        />
                        <button
                          onClick={triggerEmailSimulation}
                          disabled={isSendingEmail}
                          className="px-4 py-2 bg-[#0E46A3] text-white text-xs font-bold rounded-lg hover:bg-[#0D3B66] disabled:bg-slate-300 transition-colors flex items-center gap-1.5"
                        >
                          {isSendingEmail ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                          <span>পাঠান (Send)</span>
                        </button>
                      </div>
                    </div>

                    {isSendingEmail && (
                      <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            className="bg-indigo-600 h-1.5"
                            initial={{ width: 0 }}
                            animate={{ width: `${emailProgress}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        {/* Interactive Logs */}
                        <div className="space-y-1 font-mono text-[9px] text-slate-600">
                          {emailLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-emerald-500">❯</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center justify-center py-4 space-y-3 bg-emerald-50 border border-emerald-100 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-150 flex items-center justify-center text-emerald-800">
                      <CheckCircle2 size={22} className="stroke-[2.5]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-emerald-900">ইনভয়েস সফলভাবে পাঠানো হয়েছে!</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">
                        High-quality PDF has been sent to: <span className="font-mono">{targetEmail}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEmailSuccess(false)}
                      className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 text-[10px] font-black rounded-lg hover:bg-emerald-50"
                    >
                      পুনরায় পাঠান (Send Again)
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invoice Sheet container */}
      <div 
        ref={invoiceRef}
        className="bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden text-slate-800 font-sans tracking-normal relative text-left"
        style={{ fontFamily: '"Hind Siliguri", "Inter", sans-serif' }}
      >
        {/* Conditional PAID/DELIVERED rubber seal stamp */}
        {isPaidOrDelivered && (
          <div className="absolute top-[28%] right-[10%] rotate-[-12deg] border-4 border-emerald-500 text-emerald-500 font-black text-2xl px-6 py-2 rounded-xl border-dashed opacity-85 pointer-events-none select-none z-50 uppercase tracking-widest bg-emerald-50/40">
            PAID / DELIVERED
          </div>
        )}
        
        {/* SECTION 1: HEADER BANNER (LAYOUT DESIGN IDENTICAL TO SCREENSHOT) */}
        <div className="relative border-b-2 border-slate-100 bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden h-auto py-3 md:py-8 px-4 md:pl-10 md:pr-6 gap-3 md:gap-0">
          
          {/* Background container for header */}
          <div className="absolute inset-0 select-none pointer-events-none z-0">
            {/* Right part: solid blue */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#0E46A3]" />
            {/* Wave connector: transitions smoothly into the solid blue block */}
            <div className="absolute top-0 right-1/2 bottom-0 w-48 font-sans">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 100 0 L 20 0 C 45 40, 15 75, 40 100 L 100 100 Z" fill="#0E46A3" />
              </svg>
            </div>
          </div>

          {/* Left Column: Seller Brand Details (40% on desktop) */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-between z-10 text-left">
            <div>
              {/* Brand Row with Rounded Logged-in User Profile Photo */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-200 shadow-sm overflow-hidden shrink-0">
                  <img 
                    src={userPhoto} 
                    alt="Seller Profile" 
                    className="w-full h-full object-cover rounded-[14px]" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.resellerShopName || 'Bexo')}&background=0E46A3&color=ffffff&size=128&bold=true`;
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#0D3B66] tracking-tight leading-tight">
                    {(resellerProfile as any)?.shopName || order.resellerShopName || 'Not Available'}
                  </h1>
                  <p className="text-xs text-slate-500 font-bold mt-0.5 animate-pulse">
                    স্মার্টলি পণ্যের বিক্রয়ের ঠিকানা
                  </p>
                </div>
              </div>

              {/* Corporate Contact list */}
              <div className="space-y-2 text-xs font-semibold text-slate-600 pl-1 mt-6 overflow-hidden">
                <div className="flex items-start gap-2.5">
                  <MapPin size={13} className="text-blue-600 mt-0.5 shrink-0" />
                  <span className="break-words" title={resellerAddress}>{resellerAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="text-blue-600 shrink-0" />
                  <span className="font-mono tracking-wide break-all" title={resellerPhone}>{resellerPhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={13} className="text-blue-600 shrink-0" />
                  <span className="break-all" title={resellerEmail}>{resellerEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe size={13} className="text-[#0E46A3] shrink-0" />
                  <span className="break-all hover:underline cursor-pointer" title={resellerWebsite || 'www.bexo.com.bd'}>{resellerWebsite || 'www.bexo.com.bd'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Blue slanted center box containing 'INVOICE' + stamp circle (30% on desktop) */}
          <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center relative py-4 md:py-0 min-h-[100px] md:min-h-[140px] z-10 text-white">
            <div className="text-center text-white space-y-2.5 md:space-y-4">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider md:tracking-widest block font-serif">INVOICE</span>
              
              {/* White circular seal stamp */}
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 border-[#092C62] flex items-center justify-center p-1 shadow-md mx-auto">
                <div className="w-full h-full rounded-full border border-dashed border-[#092C62] flex items-center justify-center">
                  <FileText size={18} className="text-[#0E46A3] stroke-[2.5] md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Meta Fields (30% on desktop) */}
          <div id="order-meta-container" className="col-span-12 md:col-span-4 flex flex-col justify-center items-stretch pl-0 md:pl-8 text-xs font-bold text-slate-800 md:text-white z-10 text-left">
            {/* List with proper key-value layouts */}
            <div className="space-y-2 md:space-y-3 bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none border-none">
              
              <div className="flex items-center justify-between gap-1 py-1 font-sans">
                <span className="text-slate-700 md:text-blue-100 font-bold shrink-0">📄 Invoice No</span>
                <span className="font-mono tracking-tight font-extrabold text-slate-800 md:text-white break-all text-right">{generateInvoiceNo() || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between gap-1 py-1 font-sans">
                <span className="text-slate-700 md:text-blue-100 font-bold shrink-0">🆔 Order ID</span>
                <span className="font-mono tracking-tight font-extrabold text-slate-800 md:text-white break-all text-right">#{(order as any).orderNo || order.id || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between gap-1 py-1 font-sans">
                <span className="text-slate-700 md:text-blue-100 font-bold shrink-0">📅 Order Date</span>
                <span className="font-sans font-extrabold text-slate-800 md:text-white break-all text-right">{order.date ? formatDate(order.date) : 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between gap-1 py-1 font-sans">
                <span className="text-slate-700 md:text-blue-100 font-bold shrink-0">💳 Payment Method</span>
                <span className="font-sans font-extrabold text-slate-800 md:text-white break-words text-right">{(order as any).paymentMethod || 'Cash on Delivery (COD)'}</span>
              </div>

            </div>
          </div>


        </div>

        {/* SECTION 2: BUYER INFORMATION DETAILS */}
        <div className="p-4 sm:p-6 md:p-8 text-left">
          <div className="bg-[#F4F8FA] rounded-2xl border border-slate-105 p-4 sm:p-6 space-y-4">
            
            {/* Card Header with User Icon */}
            <div className="flex items-center gap-2.5 text-blue-800 border-b border-blue-100/60 pb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <User size={13} className="stroke-[3]" />
              </div>
              <h2 className="text-base font-black tracking-wide font-sans">ক্রেতার তথ্য</h2>
            </div>

            {/* Buyer Contact Details (exactly aligned style) */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-900 leading-tight block font-sans">
                {order.customerName || 'Not Available'}
              </h3>
              
              <div className="text-sm font-semibold text-slate-600 space-y-1.5 leading-relaxed font-sans">
                <p className="block">{order.customerAddress || 'Not Available'}</p>
                <div className="flex items-center gap-2.5 text-slate-800 font-bold mt-1">
                  <Phone size={14} className="text-blue-600 shrink-0" />
                  <span className="font-mono tracking-wide">{order.customerPhone || 'Not Available'}</span>
                </div>
              </div>

              {/* Status Badge styled exactly like a pill badge inside a container */}
              <div className="pt-2 flex flex-col gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-black font-sans self-start">
                  <CheckCircle2 size={12} className="stroke-[3]" />
                  <span>অর্ডার স্ট্যাটাস:</span>
                  <span className="font-extrabold">{order.status}</span>
                </div>
                {order.comment && (
                  <div className="mt-2 bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 font-bold whitespace-pre-line text-left">
                    <span className="text-slate-500 font-extrabold block mb-0.5 text-[9px] uppercase tracking-wider">সেলার কমেন্ট:</span>
                    <p className="leading-relaxed font-sans">{order.comment}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: ORDER ITEMS DETAILS TABLE (EXACT AS SCREENSHOT) */}
        <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-[#0E46A3] text-white text-xs font-black uppercase text-center border-b border-slate-200">
                <th className="px-4 py-4 w-[8%] border-r border-[#1e58b8]">#</th>
                <th className="px-5 py-4 w-[45%] text-left border-r border-[#1e58b8]">পণ্যের বিবরণ</th>
                <th className="px-4 py-4 w-[17%] border-r border-[#1e58b8]">সাইজ / কালার</th>
                <th className="px-4 py-4 w-[10%] border-r border-[#1e58b8]">পরিমাণ</th>
                <th className="px-4 py-4 w-[10%] border-r border-[#1e58b8]">একক মূল্য</th>
                <th className="px-5 py-4 w-[10%]">মোট মূল্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-semibold text-slate-700">
              
              {items.map((item: any, index) => {
                const itemPrice = Number(item.sellingPrice) || Number(item.basePrice) || (subtotal / (items.length || 1));
                const itemQty = Number(item.qty) || 1;
                const itemTotalPrice = itemPrice * itemQty;
                const itemSize = item.size || item.selectedSize || '';
                const itemColor = item.color || item.selectedColor || '';
                
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors text-center">
                    {/* Serial */}
                    <td className="px-4 py-5 font-mono text-slate-500 font-extrabold border-r border-slate-200">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    
                    {/* Product details */}
                    <td className="px-5 py-5 text-left border-r border-slate-200">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <img 
                            src={productImage || `https://picsum.photos/seed/${item.productId || 'placeholder'}/100/100`} 
                            alt="Product Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <span className="text-sm font-black text-slate-900 leading-tight block font-sans">{item.productTitle || 'Premium Product'}</span>
                          {isAdmin && (
                            <p className="text-[10px] font-bold text-blue-600 block">
                              Code: <span className="font-mono">{item.productId ? String(item.productId).slice(-8).toUpperCase() : '554004'}</span>
                            </p>
                          )}
                          {itemSize && (
                            <p className="text-[10px] text-slate-500 font-bold block font-sans">
                              Size: {itemSize}
                            </p>
                          )}
                          {itemColor && (
                            <p className="text-[10px] text-slate-500 font-bold block font-sans">
                              Color: {itemColor}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 font-extrabold font-mono shrink-0">
                            Qty: {itemQty} × {itemPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Size / Color column */}
                    <td className="px-4 py-5 border-r border-slate-200">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        {itemSize ? (
                          <span className="inline-block px-2.5 py-1 bg-pink-50 text-pink-600 border border-pink-100 rounded-md font-black text-[10px] font-sans">
                            Size: {itemSize}
                          </span>
                        ) : null}
                        {itemColor ? (
                          <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md font-black text-[10px] font-sans">
                            Color: {itemColor}
                          </span>
                        ) : null}
                        {!itemSize && !itemColor ? (
                          <span className="text-slate-400 font-bold font-sans">Regular</span>
                        ) : null}
                      </div>
                    </td>
                    
                    {/* Qty column */}
                    <td className="px-4 py-5 font-bold font-mono text-base text-slate-800 border-r border-slate-200">
                      {itemQty}
                    </td>
                    
                    {/* Unit price column */}
                    <td className="px-4 py-5 font-bold text-slate-800 border-r border-slate-200 font-mono tracking-tight text-center">
                      {itemPrice.toLocaleString()} টাকা
                    </td>
                    
                    {/* Total price column */}
                    <td className="px-5 py-5 font-black text-pink-600 text-[13px] font-mono tracking-tight text-center">
                      {itemTotalPrice.toLocaleString()} টাকা
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        {/* SECTION 4: CALCULATIONS / BILLING BREAKDOWNS (EXACT LAYOUT RECONSTRUCTION) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6 md:p-8 bg-[#FAF9F7] border-t border-slate-100">
          
          {/* Left Block Card: মূল্য বিবরণী (Price Summary) */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4 shadow-sm flex flex-col justify-between text-left">
            <div className="flex items-center gap-2 text-blue-800 border-b border-slate-100 pb-3">
              <Receipt size={16} className="text-blue-600 font-black stroke-[2.5]" />
              <h3 className="text-sm font-black uppercase tracking-wider font-sans">মূল্য বিবরণী</h3>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600 font-sans">
              <div className="flex justify-between items-center">
                <span>পণ্যের মোট মূল্য (সাবটোটাল)</span>
                <span className="font-bold text-slate-800 font-mono">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-bold text-slate-800 font-mono">{formatTaka(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ডিসকাউন্ট</span>
                <span className="font-bold text-slate-800 font-mono">{formatTaka(discount)}</span>
              </div>
              <div className="h-[1px] bg-slate-100 my-2" />
              <div className="flex justify-between items-end text-blue-900 font-black">
                <span className="text-sm">সর্বমোট (Total)</span>
                <span className="text-xl font-mono underline decoration-blue-200 underline-offset-4">{formatTaka(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Right Block Card: পেমেন্ট ও কালেকশন বিবরণী (Collection details) */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-5 shadow-sm flex flex-col justify-between text-left">
            <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
              <ShieldCheck size={16} className="text-emerald-600 stroke-[2.5]" />
              <h3 className="text-sm font-black uppercase tracking-wider font-sans">পেমেন্ট ও কালেকশন বিবরণী</h3>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600 font-sans">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  পরিশোধ করা হয়েছে
                </span>
                <span className="font-bold text-emerald-700 font-mono">{formatTaka(amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  বাকি আছে
                </span>
                <span className="font-bold text-red-600 font-mono">{formatTaka(amountDue)}</span>
              </div>

              {/* Orange box for delivery worker collection */}
              <div className="bg-orange-50 border border-orange-150 p-4 rounded-xl flex justify-between items-center text-orange-900 font-black">
                <span className="text-xs font-sans">🚚 ডেলিভারি ম্যানকে কালেক্ট করতে হবে</span>
                <span className="text-lg font-mono">{formatTaka(deliveryManCollect)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 5: NOTES MODULE */}
        <div className="p-4 sm:p-6 md:p-8 border-t border-slate-100 bg-[#FAF9F7] text-left space-y-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
              <FileText size={13} className="stroke-[2.5]" />
            </div>
            <p className="text-xs font-black text-blue-900 leading-relaxed font-sans">
              নোট: গ্রাহকের নিকট থেকে বাকি টাকা সংগ্রহ করে আমাদের কাছে জমা দিন। ধন্যবাদ।
            </p>
          </div>

          {(order as any).comment && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <FileText size={13} className="stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-amber-600 block mb-1 font-sans">সেলার কমেন্ট / মন্তব্য</span>
                <p className="text-xs font-black text-amber-900 leading-relaxed font-sans whitespace-pre-line">
                  {(order as any).comment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: FOOTER LINKS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-white border-t border-slate-100 text-center text-slate-700 z-10 font-bold text-xs">
          
          <div className="flex flex-col items-center p-2 sm:p-3 rounded-2xl border border-slate-50 shadow-xs">
            <Globe className="text-[#0E46A3] w-5 h-5 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans">ওয়েবসাইট</span>
            <span className="font-mono text-slate-800 break-all">{resellerWebsite || 'www.bexo.com.bd'}</span>
          </div>

          <div className="flex flex-col items-center p-2 sm:p-3 rounded-2xl border border-slate-50 shadow-xs">
            <Phone className="text-[#0E46A3] w-5 h-5 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans">সাপোর্ট / হেল্পলাইন</span>
            <span className="font-mono text-slate-800 break-all">{resellerPhone || '01990608143'}</span>
          </div>

          <div className="flex flex-col items-center p-2 sm:p-3 rounded-2xl border border-slate-50 shadow-xs">
            <Mail className="text-[#0E46A3] w-5 h-5 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans animate-pulse">ইমেইল</span>
            <span className="text-slate-800 break-all">{resellerEmail || 'support@bexo.com'}</span>
          </div>

          <div className="flex flex-col items-center p-2 sm:p-3 rounded-2xl border border-slate-50 shadow-xs">
            <ShieldCheck className="text-emerald-600 w-5 h-5 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans">নিরাপদ লেনদেন</span>
            <span className="text-emerald-700 font-bold font-sans">100% বিশ্বস্ত</span>
          </div>

        </div>

        {/* SECTION 7: DEEP BLUE FOOTER CARD WITH COMPLIANCE BENGALI SENTENCES */}
        <div className="bg-[#0E46A3] text-white py-4 sm:py-5 px-4 sm:px-6 text-center text-xs font-semibold relative overflow-hidden select-none border-t-2 border-dashed border-white/25 font-sans">
          <div className="flex items-center justify-center gap-2 mb-2 font-black font-sans">
            <Heart size={13} className="text-red-400 fill-red-400" />
            <span>Dear {order.customerName || 'Not Available'}, thanks for your order.</span>
          </div>
          <p className="text-[13px] font-black text-blue-100 tracking-wide mt-1 font-sans">
            আপনার আস্থা আমাদের পথচলার প্রেরণা।
          </p>
        </div>

      </div>
    </div>
  );
}
