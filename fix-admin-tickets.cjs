const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// We just update the admin nav items and switchAdminSubView instead of deleting large blocks (less risky).
// 1. Remove live-chats and guest-chats sidebar items
html = html.replace(/<div[^>]*onclick="switchAdminSubView\('live-chats'\)"[\s\S]*?<\/div>/g, '');
html = html.replace(/<div[^>]*onclick="switchAdminSubView\('guest-chats'\)"[\s\S]*?<\/div>/g, '');

// 2. Modify switchAdminSubView
html = html.replace(/case 'tickets': renderAdminSupportTickets\(\); break;/g, "case 'tickets': renderAdminLiveChats('live_chats'); break;");
html = html.replace(/case 'live-chats': renderAdminLiveChats\('live_chats'\); break;/g, '');
html = html.replace(/case 'guest-chats': renderAdminLiveChats\('guest_chats'\); break;/g, '');

// 3. Rename "লাইভ চ্যাট ম্যানেজমেন্ট" to "সাপোর্ট টিকিট"
html = html.replace(/<h2 class="text-2xl font-black text-slate-800">লাইভ চ্যাট ম্যানেজমেন্ট<\/h2>/g, '<h2 class="text-2xl font-black text-slate-800">সাপোর্ট টিকিট ম্যানেজমেন্ট</h2>');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
