const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// Fix navbar
html = html.replace(
    '<nav class="flex items-center justify-between px-8 py-4 bg-orange-500 text-white">',
    '<nav class="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-orange-500 text-white gap-4 sm:gap-0">'
);
html = html.replace(
    '<button onclick="showAuth(false)" class="px-5 py-2 rounded font-bold text-orange-600 bg-yellow-400 hover:bg-yellow-300 transition-colors">রেজিস্ট্রেশন <i class="fas fa-user-plus ml-1"></i></button>',
    '<button onclick="showAuth(false)" class="px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded font-bold text-orange-600 bg-yellow-400 hover:bg-yellow-300 transition-colors">রেজিস্ট্রেশন <i class="fas fa-user-plus ml-1"></i></button>'
);
html = html.replace(
    '<button onclick="showAuth(true)" class="px-5 py-2 rounded font-bold text-white border border-white hover:bg-white hover:text-orange-600 transition-colors">লগইন <i class="fas fa-sign-in-alt ml-1"></i></button>',
    '<button onclick="showAuth(true)" class="px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded font-bold text-white border border-white hover:bg-white hover:text-orange-600 transition-colors">লগইন <i class="fas fa-sign-in-alt ml-1"></i></button>'
);

// Fix hero section
html = html.replace(
    '<div class="flex flex-col md:flex-row items-center justify-between px-8 py-12 md:py-20 flex-grow relative overflow-hidden">',
    '<div class="flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-8 md:py-20 flex-grow relative overflow-hidden">'
);

// Fix Hero buttons flex gap
html = html.replace(
    '<div class="flex gap-4 pt-4">',
    '<div class="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">'
);

// Fix hero text
html = html.replace(
    '<h2 class="text-5xl md:text-6xl font-black text-slate-800 leading-tight">',
    '<h2 class="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 leading-tight">'
);

// Fix Feature Grid
html = html.replace(
    '<div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">',
    '<div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 sm:gap-8 px-4 sm:px-0">'
);

// Fix products section
html = html.replace(
    '<div class="max-w-6xl mx-auto text-center">',
    '<div class="max-w-6xl mx-auto text-center px-4 sm:px-0">'
);

// We need to do this for all max-w-6xl mx-auto text-center
html = html.replace(/<div class="max-w-6xl mx-auto text-center">/g, '<div class="max-w-6xl mx-auto text-center px-4 sm:px-0">');

fs.writeFileSync('index.html', html);
console.log("Fixed mobile layout");
