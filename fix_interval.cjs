const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/saveUsers\(userProfile\.profileId\);/g, '// saveUsers(userProfile.profileId); // Disabled heartbeat sync to save quota');

fs.writeFileSync('main_script.js', content);
