const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

const section4Old = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6 md:p-8 bg-[#FAF9F7] border-t border-slate-100">
          
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

        </div>`;

const section4New = `<div className={\`grid grid-cols-1 \${isAdmin ? 'md:grid-cols-2' : ''} gap-4 md:gap-8 p-4 sm:p-6 md:p-8 bg-[#FAF9F7] border-t border-slate-100\`}>
          
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
              
              {!isAdmin && (
                <>
                  <div className="h-[1px] bg-slate-100 my-2" />
                  <div className="flex justify-between items-center text-orange-900 font-black bg-orange-50 border border-orange-150 p-3 rounded-xl mt-2">
                    <span className="text-xs font-sans">🚚 ডেলিভারি ম্যানকে কালেক্ট করতে হবে</span>
                    <span className="text-lg font-mono">{formatTaka(deliveryManCollect)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Block Card: পেমেন্ট ও কালেকশন বিবরণী (Collection details) - ADMIN ONLY */}
          {isAdmin && (
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
          )}

        </div>`;

if (content.includes(section4Old)) {
  content = content.replace(section4Old, section4New);
  fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
  console.log('Replaced SECTION 4 with isAdmin logic');
} else {
  console.log('Could not find section 4 old block exactly.');
}
