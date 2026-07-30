const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `            <!-- BALANCE VIEW (MOVED TO LEFT) -->
            <div
              id="balanceContainer"
              onclick="toggleBalanceVisibility()"
              class="group relative flex items-center bg-white/10 backdrop-blur-md border border-white/30 pl-2 sm:pl-3 pr-1 py-1 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:bg-white/20 min-w-[110px] sm:min-w-[130px] justify-between active:scale-95"
            >
              <div class="flex flex-col leading-none">
                <span
                  class="text-[8px] font-black text-orange-200 uppercase tracking-widest mb-0.5"
                  >ব্যালেন্স দেখুন</span
                >
                <div
                  id="balanceValue"
                  class="text-white font-extrabold text-sm transition-all duration-300 blur-[5px] select-none"
                >
                  ৳ <span id="headerBalanceAmount">0.00</span>
                </div>
              </div>
              <div
                id="balanceEye"
                class="w-7 h-7 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm transition-all duration-500 group-hover:bg-orange-100 group-hover:scale-105 ml-4"
              >
                <i class="fas fa-eye text-[10px]"></i>
              </div>
            </div>`;

const newStr = `            <!-- BALANCE VIEW (MOVED TO LEFT) -->
            <div
              id="balanceContainer"
              onclick="toggleBalanceVisibility()"
              class="group relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 pl-4 pr-1 py-1 rounded-full cursor-pointer transition-all duration-300 shadow-inner hover:bg-white/20 justify-between active:scale-95"
            >
              <div class="flex flex-col justify-center leading-tight">
                <span
                  class="text-[9px] font-black text-orange-100 uppercase tracking-widest"
                  >ব্যালেন্স দেখুন</span
                >
                <div
                  id="balanceValue"
                  class="text-white font-extrabold text-[13px] transition-all duration-300 blur-[5px] select-none h-4 flex items-center"
                >
                  ৳ <span id="headerBalanceAmount" class="ml-1">0.00</span>
                </div>
              </div>
              <div
                id="balanceEye"
                class="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-md transition-all duration-500 group-hover:scale-105 ml-3"
              >
                <i class="fas fa-eye text-xs"></i>
              </div>
            </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Fixed balance header.");
} else {
    console.log("Could not find balance header target.");
}
