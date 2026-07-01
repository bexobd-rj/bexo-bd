const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const additionalSections = `
      <!-- How to do business -->
      <div class="bg-[#FFF4E6] px-8 py-16">
        <div class="max-w-6xl mx-auto text-center">
          <h3 class="text-3xl font-bold text-slate-800 mb-2">কিভাবে আমাদের মাধ্যমে বিজনেস করবেন</h3>
          <p class="text-slate-500 mb-10">কোনরকম ঝুঁকি বা ঝামেলা ছাড়া সহজে অনলাইনে বিজনেস করুন ড্রপ শিপিং মডেলে।</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-orange-500 rounded-lg p-6 flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">১</div>
                <p class="text-slate-700 text-sm">সম্পূর্ণ ফ্রি তে রেজিস্ট্রেশন করুন আমাদের প্ল্যাটফর্মে আপনার পেইজ অথবা শপ নাম দিয়ে।</p>
              </div>
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">২</div>
                <p class="text-slate-700 text-sm">প্রোডাক্টের ছবি এবং ডেসক্রিপশন ডাউনলোড করে আপলোড করুন আপনার নিজস্ব পেজ অথবা ওয়েবসাইটে।</p>
              </div>
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">৩</div>
                <p class="text-slate-700 text-sm">প্রোডাক্টগুলো ২০০-৩০০ টাকা প্রফিট রেখে সেল করুন অনলাইনে ডিজিটাল মার্কেটিং এর মাধ্যমে।</p>
              </div>
            </div>
            
            <div class="bg-orange-500 rounded-lg p-6 flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">৪</div>
                <p class="text-slate-700 text-sm">আপনার পাওয়া অর্ডারগুলো প্লেস করে দিন আমাদের অ্যাপসের মাধ্যমে কাস্টমারের নাম ঠিকানা দিয়ে।</p>
              </div>
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">৫</div>
                <p class="text-slate-700 text-sm">আমাদের টিম আপনার অর্ডারটি আপনার শপের নামে ইনভয়েস করে পাঠিয়ে দিবে আপনার কাস্টমারের হাতে।</p>
              </div>
              <div class="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                <div class="bg-yellow-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">৬</div>
                <p class="text-slate-700 text-sm">অর্ডারটি ডেলিভারি হওয়ার সাথে সাথেই প্রফিটের টাকা পেয়ে যাবেন আপনার দেওয়া বিকাশ, নগদ অথবা ব্যাংক অ্যাকাউন্টে।</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dropshipper Reviews & Experience -->
      <div class="bg-[#FFF4E6] px-8 py-16">
        <div class="max-w-6xl mx-auto text-center">
          <h3 class="text-3xl font-bold text-slate-800 mb-2 text-left">ড্রপশিপার রিভিউস</h3>
          <p class="text-slate-500 mb-10 text-left">অসংখ্য সেলার এত ড্রপশিপার অত্যন্ত সন্তুষ্টির সহিত আমাদের সাথে বিজনেস করে আসছে প্রায় তিন বছর যাবত। আমাদের সার্ভিসের প্রতি তাদের আস্থা এবং সন্তুষ্টির কারনেই শপবেইজ বিডি আজকে বাংলাদেশের নাম্বার ওয়ান ড্রপশিপিং প্ল্যাটফর্ম।</p>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
            <div class="bg-white p-6 rounded border border-slate-100 shadow-sm text-left">
               <div class="flex items-center gap-4 mb-4">
                 <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400"><i class="fas fa-user text-2xl"></i></div>
                 <div>
                   <h4 class="font-bold text-slate-800">Sobuj Akon</h4>
                   <div class="text-yellow-400 text-xs"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                 </div>
               </div>
               <p class="text-sm text-slate-600 leading-relaxed">এই প্ল্যাটফর্মে আমি বিগত ২ বছর ধরে কাজ করছি। আপনাদের পেমেন্ট সিস্টেম, স্টক সাপোর্ট, প্রোডাক্ট কোয়ালিটি এবং দ্রুত বুকিং সিস্টেম আমাকে ব্যবসায় প্রভূত সাফল্য অর্জনে সাহায্য করেছে। Bexo BD Reseller Place অ্যাপসটি আমার ব্যবসার জন্য একটি অমূল্য সম্পদ।</p>
            </div>
            <div class="bg-white p-6 rounded border border-slate-100 shadow-sm text-left">
               <div class="flex items-center gap-4 mb-4">
                 <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400"><i class="fas fa-user text-2xl"></i></div>
                 <div>
                   <h4 class="font-bold text-slate-800">হৃদয়ে বাংলাদেশ</h4>
                   <div class="text-yellow-400 text-xs"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                 </div>
               </div>
               <p class="text-sm text-slate-600 leading-relaxed">আমি প্রায় তিন বছর ধরে শপবেইজ বিডিতে কাজ করছি। আমি কোন রকম পুঁজি বা ইনভেস্ট ছাড়াই একটা সেলস টিম তৈরি করে মাসে ৩০-৩৫ হাজার টাকা অটোমেটিক ইনকাম করছি। আপনাদের সার্ভিস, সাপোর্ট সত্যিই অসাধারণ, সত্য বলতে একটা আস্থার প্লাটফর্ম।</p>
            </div>
            <div class="bg-white p-6 rounded border border-slate-100 shadow-sm text-left">
               <div class="flex items-center gap-4 mb-4">
                 <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400"><i class="fas fa-user text-2xl"></i></div>
                 <div>
                   <h4 class="font-bold text-slate-800">Salek Sakib</h4>
                   <div class="text-yellow-400 text-xs"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                 </div>
               </div>
               <p class="text-sm text-slate-600 leading-relaxed">আমি কোন ধরনের মূলধন ছাড়াই আপনাদের প্রোডাক্ট নিয়ে বিজনেস করে আমি মাসে ৭০ হাজার এবং সিজনে ১.৫ লক্ষ+ টাকা ইনকাম করছি। আমি এখন পরিবারের সাথে থেকে পরিবারের হাল ধরতে পেরে শপবেইজ বিডির প্রতি আমি চির কৃতজ্ঞতা জানাচ্ছি।</p>
            </div>
            <div class="bg-white p-6 rounded border border-slate-100 shadow-sm text-left">
               <div class="flex items-center gap-4 mb-4">
                 <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400"><i class="fas fa-user text-2xl"></i></div>
                 <div>
                   <h4 class="font-bold text-slate-800">Raihanul Islam</h4>
                   <div class="text-yellow-400 text-xs"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                 </div>
               </div>
               <p class="text-sm text-slate-600 leading-relaxed">বিজনেস করার মত তেমন কিছুই ছিলো না, ২০২৪ সালে আপনাদের প্রোডাক্ট নিয়ে বিজনেস শুরু করে নিজের একটি ছোট প্রতিষ্ঠান (১০জন স্টাফ) তৈরি করতে পেরেছি। আপনাদের টিমের এই সাপোর্টের জন্য শুধু ধন্যবাদ দিয়ে ছোট করতে চাই না। চাই আমরা যেন এগিয়ে যাই অনেকদূর।</p>
            </div>
          </div>

          <h3 class="text-3xl font-bold text-slate-800 mb-2">আমাদের এক্সপেরিয়েন্স</h3>
          <p class="text-slate-500 mb-10">আমরা প্রায় দুই বছর যাবত আমাদের অভিজ্ঞ টিমের মাধ্যমে অত্যন্ত সুনামের সাথে আমাদের সম্মানিত সেলারদের অর্ডার প্রসেস করে আসছি এছাড়াও আমাদের আরও রয়েছে......</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-8 rounded border border-slate-100 shadow-sm text-center">
              <i class="fas fa-box text-4xl text-orange-500 mb-4"></i>
              <p class="text-slate-600 font-medium leading-relaxed">এক দিনে সর্বোচ্চ ৫০০০+ অর্ডার সহ মাসে ৭০,০০০ অর্ডার হ্যান্ডেল করার অভিজ্ঞতা।</p>
            </div>
            <div class="bg-white p-8 rounded border border-slate-100 shadow-sm text-center">
              <i class="fas fa-chart-line text-4xl text-orange-500 mb-4"></i>
              <p class="text-slate-600 font-medium leading-relaxed">আমাদের রয়েছে এক মাসে সর্বোচ্চ ৬০ লক্ষ+ টাকা রিসেলারদের প্রফিট দেওয়ার অভিজ্ঞতা।</p>
            </div>
            <div class="bg-white p-8 rounded border border-slate-100 shadow-sm text-center">
              <i class="fas fa-award text-4xl text-orange-500 mb-4"></i>
              <p class="text-slate-600 font-medium leading-relaxed">সর্বোচ্চ পার্সেল ভলিউমের দিক দিয়ে স্টেডফাস্ট কুরিয়ারের ২য় স্থান অর্জনের অভিজ্ঞতা।</p>
            </div>
          </div>
        </div>
      </div>
`;

if (!html.includes('আমাদের এক্সপেরিয়েন্স')) {
    html = html.replace('<!-- Footer -->', additionalSections + '\n      <!-- Footer -->');
    fs.writeFileSync('index.html', html);
    console.log('Appended how to business and reviews');
} else {
    console.log('Already appended');
}
