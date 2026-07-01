const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const landingHtml = `
    <!-- === SECTION 0: LANDING PAGE === -->
    <section id="landingSection" class="min-h-screen bg-[#FFF4E6] flex flex-col font-sans">
      <!-- Navbar -->
      <nav class="flex items-center justify-between px-8 py-4 bg-orange-500 text-white">
        <div class="flex items-center gap-2">
          <i class="fas fa-shopping-bag text-3xl"></i>
          <div>
            <h1 class="text-2xl font-bold leading-none tracking-tight">Bexo BD</h1>
            <p class="text-[10px] uppercase tracking-wider">Dropshipping Platform</p>
          </div>
        </div>
        <div class="hidden md:flex gap-6 font-medium">
          <a href="#" class="hover:text-orange-200 transition-colors">হোম</a>
          <a href="#about" class="hover:text-orange-200 transition-colors">আমাদের সম্পর্কে</a>
          <a href="#products" class="hover:text-orange-200 transition-colors">প্রোডাক্টস</a>
          <a href="#services" class="hover:text-orange-200 transition-colors">সার্ভিস সমূহ</a>
          <a href="#contact" class="hover:text-orange-200 transition-colors">যোগাযোগ</a>
        </div>
        <div class="flex gap-3">
          <button onclick="showAuth(false)" class="px-5 py-2 rounded font-bold text-orange-600 bg-yellow-400 hover:bg-yellow-300 transition-colors">রেজিস্ট্রেশন <i class="fas fa-user-plus ml-1"></i></button>
          <button onclick="showAuth(true)" class="px-5 py-2 rounded font-bold text-white border border-white hover:bg-white hover:text-orange-600 transition-colors">লগইন <i class="fas fa-sign-in-alt ml-1"></i></button>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col md:flex-row items-center justify-between px-8 py-12 md:py-20 flex-grow relative overflow-hidden">
        <div class="md:w-1/2 z-10 space-y-6">
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
            দেশের সর্ববৃহৎ <span class="text-orange-600">ড্রপশিপিং</span> এবং <br/>
            <span class="text-orange-600">রিসেলিং</span> প্লাটফর্ম
          </h2>
          <p class="text-lg text-slate-600 max-w-lg">
            কোন প্রকার পুঁজি বা ইনভেস্ট ছাড়াই ফ্রি'তে রেজিস্ট্রেশন করে ঘরে বসে বিজনেস করুন শপবেইজ বিডি'র মাধ্যমে।
          </p>
          <div class="flex gap-4 pt-4">
            <button onclick="showAuth(false)" class="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1">রেজিস্ট্রেশন করুন</button>
            <button class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1">বিস্তারিত জানুন</button>
          </div>
        </div>
        <div class="md:w-1/2 z-10 mt-12 md:mt-0 flex justify-center relative">
          <!-- Illustration Placeholder (Using CSS shapes) -->
          <div class="w-full max-w-md relative">
            <div class="bg-teal-100 rounded-full w-80 h-80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 blur-3xl opacity-50"></div>
            <!-- Mockup of the process -->
            <div class="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 relative">
              <div class="flex justify-between items-center mb-6 border-b pb-4">
                 <i class="fas fa-store text-4xl text-teal-500"></i>
                 <i class="fas fa-arrow-right text-slate-300"></i>
                 <i class="fas fa-box text-4xl text-orange-400"></i>
                 <i class="fas fa-arrow-right text-slate-300"></i>
                 <i class="fas fa-user text-4xl text-blue-500"></i>
              </div>
              <h3 class="text-center font-bold text-xl text-slate-700">DROPSHIPPING MODEL</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="bg-[#FFF4E6] px-8 pb-16">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg text-center shadow-sm border border-yellow-300">
            <h4 class="text-2xl font-bold text-orange-600">2,00,000+</h4>
            <p class="text-sm font-medium text-slate-700 mt-1">রিসেলার/ড্রপশিপার</p>
          </div>
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg text-center shadow-sm border border-yellow-300">
            <h4 class="text-2xl font-bold text-orange-600">10,000+</h4>
            <p class="text-sm font-medium text-slate-700 mt-1">ট্রেন্ডি প্রোডাক্টস</p>
          </div>
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg text-center shadow-sm border border-yellow-300">
            <h4 class="text-2xl font-bold text-orange-600">100K+</h4>
            <p class="text-sm font-medium text-slate-700 mt-1">অ্যাপস ডাউনলোড</p>
          </div>
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg text-center shadow-sm border border-yellow-300">
            <h4 class="text-2xl font-bold text-orange-600">24/7</h4>
            <p class="text-sm font-medium text-slate-700 mt-1">সাপোর্ট সেন্টার</p>
          </div>
        </div>
      </div>

      <!-- About Us -->
      <div id="about" class="bg-[#FFF4E6] px-8 py-16">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          <div class="md:w-1/2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 class="text-3xl font-bold text-slate-800 mb-6">আমাদের সম্পর্কে</h3>
            <p class="text-slate-600 leading-relaxed text-justify">
              Bexo BD বাংলাদেশের সর্ববৃহৎ একটি ড্রপশিপিং এবং রিসেলিং প্লাটফর্ম। কোন প্রকার পুঁজি বা ইনভেস্টমেন্ট ছাড়াই ঘরে বসে অসংখ্য ক্যাটাগরির প্রায় দশ হাজারেরও বেশি প্রোডাক্ট নিয়ে বিজনেস করতে পারবেন অনলাইনে আমাদের মাধ্যমে। ইনস্ট্যান্ট পেমেন্ট, ভেরিফাইড প্রোডাক্ট, ছবি দিয়ে সার্চ, ক্যাশ অন ডেলিভারি এবং কল সেন্টার সাপোর্ট সহ অত্যাধুনিক সকল সুবিধা রয়েছে এখানে।
            </p>
          </div>
          <div class="md:w-1/2 rounded-xl overflow-hidden shadow-sm relative group bg-slate-200 flex items-center justify-center min-h-[250px]">
             <i class="fab fa-youtube text-red-500 text-6xl cursor-pointer hover:scale-110 transition-transform"></i>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div id="services" class="bg-[#FFF4E6] px-8 py-16">
        <div class="max-w-6xl mx-auto text-center">
          <h3 class="text-3xl font-bold text-slate-800 mb-2">আমাদের সার্ভিস সমূহ</h3>
          <p class="text-slate-500 mb-10">আমাদের এই প্ল্যাটফর্মের মাধ্যমে আপনি পাচ্ছেন অসংখ্য বিজনেস এবং ইনকাম করার সুযোগ।</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-recycle text-orange-500"></i><span class="font-medium text-slate-700">রিসেলিং / ড্রপশিপিং</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-box-open text-orange-500"></i><span class="font-medium text-slate-700">হোলসেল প্রোডাক্ট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-print text-orange-500"></i><span class="font-medium text-slate-700">কাস্টমাইজ প্রিন্ট</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-truck-loading text-orange-500"></i><span class="font-medium text-slate-700">সাপ্লায়ার / ভেন্ডরশিপ</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-wallet text-orange-500"></i><span class="font-medium text-slate-700">লিডারশিপ ইনকাম</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-laptop-code text-orange-500"></i><span class="font-medium text-slate-700">ফ্রিল্যান্সিং মার্কেটপ্লেস</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-tasks text-orange-500"></i><span class="font-medium text-slate-700">মাইক্রো জবস</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
            <div class="bg-white p-4 rounded shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3"><i class="fas fa-mobile-alt text-orange-500"></i><span class="font-medium text-slate-700">মোবাইল রিচার্জ</span></div>
              <i class="fas fa-arrow-right text-orange-300"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Special Features -->
      <div class="bg-[#FFF4E6] px-8 py-16">
        <div class="max-w-6xl mx-auto text-center">
          <h3 class="text-3xl font-bold text-slate-800 mb-2">আমাদের স্পেশাল ফিচারস</h3>
          <p class="text-slate-500 mb-10">ড্রপশিপিং এবং রিসেলিং এর জগতে আমরাই দিচ্ছি সবচেয়ে বেশি এবং আকর্ষণীয় সুবিধা।</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div class="bg-white p-6 rounded shadow-sm border border-slate-100">
              <i class="fas fa-money-bill-wave text-3xl text-orange-500 mb-4"></i>
              <h4 class="text-xl font-bold text-slate-800 mb-2">জিরো ইনভেস্টমেন্ট</h4>
              <p class="text-slate-500 text-sm">কোন রকম পুঁজি বা ইনভেস্টমেন্ট ছাড়াই সম্পূর্ণ ফ্রি'তে রেজিস্ট্রেশন করে ফুল ক্যাশ অন ডেলিভারিতে বিজনেস করতে পারবেন।</p>
            </div>
            <div class="bg-white p-6 rounded shadow-sm border border-slate-100">
              <i class="fas fa-wallet text-3xl text-orange-500 mb-4"></i>
              <h4 class="text-xl font-bold text-slate-800 mb-2">ইনস্ট্যান্ট পেমেন্ট</h4>
              <p class="text-slate-500 text-sm">আপনার অর্ডার ডেলিভারি হওয়ার পর প্রফিটের টাকা উইথড্র দেওয়ার সাথে সাথেই অটোমেটিক ভাবে সেকেন্ডেই চলে যাবে।</p>
            </div>
            <div class="bg-white p-6 rounded shadow-sm border border-slate-100">
              <i class="fas fa-truck text-3xl text-orange-500 mb-4"></i>
              <h4 class="text-xl font-bold text-slate-800 mb-2">ক্যাশ অন ডেলিভারি</h4>
              <p class="text-slate-500 text-sm">আমাদের প্ল্যাটফর্মের মাধ্যমে বিজনেস করে আপনি কাস্টমারের নিকট থেকে ফুল ক্যাশ অন ডেলিভারি কন্ডিশনে অর্ডার নিতে পারবেন।</p>
            </div>
            <div class="bg-white p-6 rounded shadow-sm border border-slate-100">
              <i class="fas fa-check-circle text-3xl text-orange-500 mb-4"></i>
              <h4 class="text-xl font-bold text-slate-800 mb-2">ভেরিফাইড প্রোডাক্টস</h4>
              <p class="text-slate-500 text-sm">প্রোডাক্ট কোয়ালিটির দিক দিয়ে আমাদের রয়েছে ভেরিফাইড এবং বুস্টিং ক্যাটাগরির প্রোডাক্ট।</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Products from DB -->
      <div id="products" class="bg-yellow-100/50 px-8 py-16">
        <div class="max-w-6xl mx-auto text-center">
          <h3 class="text-3xl font-bold text-slate-800 mb-2">আমাদের প্রোডাক্ট সমূহ</h3>
          <p class="text-slate-500 mb-10">আমাদের রয়েছে অসংখ্য ক্যাটাগরির প্রোডাক্ট, যেগুলো আপনি সহজেই সেল করতে পারবেন।</p>
          
          <!-- Landing Products Container -->
          <div id="landingProductsContainer" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             <!-- Products will be injected here via JS -->
             <div class="col-span-full py-10 text-slate-400">
                <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <p>প্রোডাক্ট লোড হচ্ছে...</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-yellow-50 pt-16 pb-8 px-8 text-sm">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-orange-200 pb-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-4 text-orange-600">
              <i class="fas fa-shopping-bag text-2xl"></i>
              <h2 class="text-xl font-bold">Bexo BD</h2>
            </div>
            <p class="text-slate-600 mb-2">Largest Drop-shipping Platform in Bangladesh</p>
            <p class="text-slate-600 mb-1"><strong>Call:</strong> 09647300100</p>
            <p class="text-slate-600 mb-1"><strong>Email:</strong> support@bexobd.com</p>
            <p class="text-slate-600"><strong>Address:</strong> Dhaka-1207</p>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 mb-4 text-lg">Legal & Information</h4>
            <ul class="space-y-2 text-slate-600">
              <li><a href="#" class="hover:text-orange-500">Terms and Conditions</a></li>
              <li><a href="#" class="hover:text-orange-500">Return & Refund Policy</a></li>
              <li><a href="#" class="hover:text-orange-500">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 mb-4 text-lg">Menu</h4>
            <ul class="space-y-2 text-slate-600">
              <li><a href="#about" class="hover:text-orange-500">About Us</a></li>
              <li><a href="#services" class="hover:text-orange-500">Our Services</a></li>
              <li><a href="#products" class="hover:text-orange-500">Products</a></li>
            </ul>
          </div>
        </div>
        <div class="text-center text-slate-500">
          Copyright &copy; All rights reserved by Bexo BD 2024
        </div>
      </footer>
    </section>
`;

if (!html.includes('id="landingSection"')) {
    html = html.replace('<!-- === SECTION 1: AUTHENTICATION === -->', landingHtml + '\n    <!-- === SECTION 1: AUTHENTICATION === -->');
    
    // Add hidden to authSection initially
    html = html.replace('<section\n      id="authSection"\n      class="min-h-screen flex', '<section\n      id="authSection"\n      class="min-h-screen hidden flex');
    
    fs.writeFileSync('index.html', html);
    console.log('Successfully injected landing section into index.html');
} else {
    console.log('Landing section already exists');
}
