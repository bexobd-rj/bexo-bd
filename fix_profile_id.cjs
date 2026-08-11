const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /if \(!userProfile\.profileId\) \{\s*userProfile\.profileId = generateProfileId\(\);\s*saveProfile\(\);\s*\}/g;
const replacement = `if (userProfile && !userProfile.profileId) {
                  userProfile.profileId = generateProfileId();
                  saveProfile();
              }`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('index.html', html);
    console.log("Fixed userProfile.profileId top-level");
} else {
    console.log("Could not find block");
}

