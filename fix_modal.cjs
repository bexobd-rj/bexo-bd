const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
<!-- Developer Info Modal -->
<div id="developerModal" class="fixed inset-0 z-[999] hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transform scale-95 opacity-0 transition-all duration-300" id="devModalContent">
        <div class="p-6 text-center space-y-4 relative">
            <button onclick="closeDeveloperModal()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                <i class="fas fa-times"></i>
            </button>
            <div class="w-16 h-16 bg-orange-100 text-[#ff6b00] rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner mb-2">
                💻
            </div>
            <h3 class="text-xl font-black text-slate-800">Web Code Studio</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed">
                আপনার পছন্দের যেকোনো ওয়েবসাইট তৈরি করে দিচ্ছে <span class="text-[#ff6b00] font-bold">Web Code Studio</span>।
            </p>
            
            <div class="pt-4 space-y-3">
                <a href="https://wa.me/8801352820422" target="_blank" class="w-full py-3 px-4 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#1ebd5b] transition-all shadow-md shadow-green-200">
                    <i class="fab fa-whatsapp text-xl"></i>
                    WhatsApp: +880 1352-820422
                </a>
                <a href="mailto:webcodestudio@gmail.com" class="w-full py-3 px-4 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-md shadow-slate-200">
                    <i class="fas fa-envelope text-lg"></i>
                    webcodestudio@gmail.com
                </a>
            </div>
            
            <p class="text-xs text-slate-400 pt-3 font-semibold">আজই যোগাযোগ করুন।</p>
        </div>
    </div>
</div>

<script>
function showDeveloperModal() {
    const modal = document.getElementById('developerModal');
    const content = document.getElementById('devModalContent');
    modal.classList.remove('hidden');
    // small delay for transition
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}
function closeDeveloperModal() {
    const modal = document.getElementById('developerModal');
    const content = document.getElementById('devModalContent');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
</script>
</body>
`;

html = html.replace('</body>', replacement);
fs.writeFileSync('index.html', html);
console.log("Fixed modal");
