const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const gridRegex = /<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

let newServices = `          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onclick="showServiceModal('রিসেলিং / ড্রপশিপিং')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-recycle text-orange-500"></i><span class="font-medium text-slate-700">রিসেলিং / ড্রপশিপিং</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('হোলসেল প্রোডাক্ট')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-box-open text-orange-500"></i><span class="font-medium text-slate-700">হোলসেল প্রোডাক্ট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('কাস্টমাইজ প্রিন্ট')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-print text-orange-500"></i><span class="font-medium text-slate-700">কাস্টমাইজ প্রিন্ট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('সাপ্লায়ার / ভেন্ডরশিপ')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-truck-loading text-orange-500"></i><span class="font-medium text-slate-700">সাপ্লায়ার / ভেন্ডরশিপ</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('লিডারশিপ ইনকাম')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-wallet text-orange-500"></i><span class="font-medium text-slate-700">লিডারশিপ ইনকাম</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('ফ্রিল্যান্সিং মার্কেটপ্লেস')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-laptop-code text-orange-500"></i><span class="font-medium text-slate-700">ফ্রিল্যান্সিং মার্কেটপ্লেস</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('মাইক্রো জবস')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-tasks text-orange-500"></i><span class="font-medium text-slate-700">মাইক্রো জবস</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('মোবাইল রিচার্জ')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-mobile-alt text-orange-500"></i><span class="font-medium text-slate-700">মোবাইল রিচার্জ</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('ডিজিটাল মার্কেটিং')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-bullhorn text-orange-500"></i><span class="font-medium text-slate-700">ডিজিটাল মার্কেটিং</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('বুস্টিং সার্ভিস')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-rocket text-orange-500"></i><span class="font-medium text-slate-700">বুস্টিং সার্ভিস</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('ই-কমার্স ওয়েবসাইট')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-shopping-cart text-orange-500"></i><span class="font-medium text-slate-700">ই-কমার্স ওয়েবসাইট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div onclick="showServiceModal('ড্রপশিপিং ওয়েবসাইট')" class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-globe text-orange-500"></i><span class="font-medium text-slate-700">ড্রপশিপিং ওয়েবসাইট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
          </div>
        </div>
      </div>`;

html = html.replace(gridRegex, newServices);

const scriptToAdd = \`
<script>
function showServiceModal(serviceName) {
    let modal = document.getElementById('serviceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceModal';
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = \\\`
        <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all relative">
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">\\\${serviceName}</h3>
                <p class="text-sm text-slate-500 mb-6">আপনি যদি \\\${serviceName} নিয়ে কাজ করতে চান তাহলে নিচের রেজিস্ট্রেশন বাটনে ক্লিক করে রেজিস্ট্রেশন করুন।</p>
                
                <div class="space-y-3">
                    <button onclick="document.getElementById('serviceModal').remove(); showAuth(false);" class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30">
                        রেজিস্ট্রেশন করুন
                    </button>
                    <button onclick="document.getElementById('serviceModal').remove()" class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all">
                        বাতিল
                    </button>
                </div>
            </div>
        </div>
    \\\`;
}
</script>
</body>\`;

html = html.replace('</body>', scriptToAdd);

fs.writeFileSync('index.html', html);
console.log("Services updated successfully");
