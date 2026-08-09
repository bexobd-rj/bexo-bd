const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace("saveNewPassword(foundUser.profileId, np);", "updateAllDuplicateAccountsPassword(foundUser.profileId, np);");

fs.writeFileSync('index.html', html);
console.log("Fixed forgot password call");
