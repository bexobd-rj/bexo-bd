        function showSupportModal() {
            let modal = document.getElementById('supportModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'supportModal';
                modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = `
                <div class="bg-[#f5f7fa] w-full max-w-md mx-4 rounded-3xl overflow-hidden shadow-2xl transform transition-all relative">
                    <div class="flex items-center justify-between p-6 bg-white relative z-10 rounded-t-3xl border-b border-slate-100">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-50 text-[#10b981] rounded-full flex items-center justify-center text-xl shrink-0">
                                <i class="fas fa-headset"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800">সাপোর্ট সেন্টার</h3>
                                <p class="text-xs text-slate-500 font-medium mt-0.5">আপনার যেকোনো সমস্যায় আমরা আছি আপনার সাথে</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('supportModal').remove()" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                    
                    <div class="p-6 space-y-3">
                        <!-- Gmail -->
                        <a href="mailto:bexobd@gmail.com" class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform text-red-500">
                                    <span class="font-bold font-serif leading-none tracking-tighter" style="font-family: Georgia, serif;">M</span>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-800 text-sm">Gmail</h4>
                                    <p class="text-xs text-slate-500 mt-0.5">bexobd@gmail.com</p>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-slate-300"></i>
                        </a>
                        
                        <!-- WhatsApp -->
                        <a href="https://wa.me/8801804462724" target="_blank" class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-800 text-sm">WhatsApp</h4>
                                    <p class="text-xs text-slate-500 mt-0.5">+880 1804-462724</p>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-slate-300"></i>
                        </a>
                        
                        <!-- Live Chat -->
                        <a href="#" onclick="event.preventDefault(); const sm = document.getElementById('supportModal'); if(sm) sm.remove(); openLiveChat();" class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-[#0084FF]/10 text-[#0084FF] rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i class="fas fa-comment-dots"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h4 class="font-bold text-slate-800 text-sm">লাইভ চ্যাট</h4>
                                        <span class="px-2 py-0.5 bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold rounded-md">অনলাইন</span>
                                    </div>
                                    <p class="text-xs text-slate-500 mt-0.5">এখনই আমাদের সাথে কথা বলুন</p>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-slate-300"></i>
                        </a>

                        <!-- Support Time -->
                        <div class="mt-4 p-4 bg-[#e8f5e9] rounded-2xl flex items-center gap-3 border border-[#c8e6c9]">
                            <div class="text-[#2e7d32] bg-[#c8e6c9]/50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                <i class="fas fa-shield-alt text-sm"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-[#2e7d32] text-sm">আমাদের সাপোর্ট সময়</h4>
                                <p class="text-[11px] text-[#388e3c] font-bold mt-0.5">প্রতিদিন সকাল ৯টা - রাত ১১টা</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

