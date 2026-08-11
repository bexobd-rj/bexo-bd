const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\/\/ Ensure all keys exist\s*Object\.keys\(DEFAULT_PROFILE\)\.forEach\(key => \{\s*if\(userProfile\[key\] === undefined\) userProfile\[key\] = DEFAULT_PROFILE\[key\];\s*\}\);/g;

const replacement = `// Ensure all keys exist
              if (userProfile) {
                  Object.keys(DEFAULT_PROFILE).forEach(key => {
                      if(userProfile[key] === undefined) userProfile[key] = DEFAULT_PROFILE[key];
                  });
              }`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('index.html', html);
    console.log("Fixed DEFAULT_PROFILE top-level userProfile null dereferences");
} else {
    console.log("Could not find block");
}

