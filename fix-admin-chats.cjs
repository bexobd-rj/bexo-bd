const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/>Registered Users<\/button>/g, '>রেজিস্টার্ড ইউজার</button>');
html = html.replace(/>Guest Users<\/button>/g, '>গেস্ট ইউজার</button>');

// Also update the sub-header in the chat list:
// ${collectionName === 'live_chats' ? 'Registered Users Chat' : 'Guest Users Chat'}
html = html.replace(/Registered Users Chat/g, 'রেজিস্টার্ড ইউজার চ্যাট');
html = html.replace(/Guest Users Chat/g, 'গেস্ট ইউজার চ্যাট');

fs.writeFileSync('index.html', html, 'utf8');
