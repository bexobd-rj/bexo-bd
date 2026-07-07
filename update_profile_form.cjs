const fs = require('fs');
let content = fs.readFileSync('script3.js', 'utf8');

// 1. Rename ID label
content = content.replace(/প্রোফাইল আইডি \(Profile ID\)/g, 'প্রোফাইল আইডি');

// 2. Mobile Phone with icon
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">মোবাইল নং <span class="text-red-500">\*<\/span><\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-phone mr-2 text-orange-500"></i> মোবাইল নং <span class="text-red-500">*</span></label>'
);

// 3. Name with icon
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">ব্যক্তিগত নাম <span class="text-red-500">\*<\/span><\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-user mr-2 text-slate-400"></i> ব্যক্তিগত নাম <span class="text-red-500">*</span></label>'
);

// 4. Shop Name with icon
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">শপ নাম \/ ফেসবুক পেইজ নাম <span class="text-red-500">\*<\/span><\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-store mr-2 text-slate-400"></i> শপ নাম / ফেসবুক পেইজ নাম <span class="text-red-500">*</span></label>'
);

// 5. Email
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">জিমেইল \/ ইমেইল \(ঐচ্ছিক\)<\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-envelope mr-2 text-slate-400"></i> জিমেইল / ইমেইল (ঐচ্ছিক)</label>'
);

// 6. FB
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">ফেসবুক পেইজ লিংক\/ইউজারনেম \(ঐচ্ছিক\)<\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fab fa-facebook mr-2 text-slate-400"></i> ফেসবুক পেইজ লিংক/ইউজারনেম (ঐচ্ছিক)</label>'
);

// 7. Website
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">ওয়েবসাইট লিংক \(ঐচ্ছিক\)<\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-globe mr-2 text-slate-400"></i> ওয়েবসাইট লিংক (ঐচ্ছিক)</label>'
);

// 8. District
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">জেলা <span class="text-red-500">\*<\/span><\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-map-marker-alt mr-2 text-slate-400"></i> জেলা <span class="text-red-500">*</span></label>'
);

// 9. Address
content = content.replace(
    /<label class="block text-sm font-bold text-slate-700">ঠিকানা <span class="text-red-500">\*<\/span><\/label>/g,
    '<label class="block text-sm font-bold text-slate-700"><i class="fas fa-map-marked-alt mr-2 text-slate-400"></i> ঠিকানা <span class="text-red-500">*</span></label>'
);

// 10. Improve profile pic text
content = content.replace(/ছবি পরিবর্তন করতে ট্যাপ করুন/g, 'ছবি পরিবর্তন করুন');

fs.writeFileSync('script3.js', content);
console.log("Profile form updated successfully!");
