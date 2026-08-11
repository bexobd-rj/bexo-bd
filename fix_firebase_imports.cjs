const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex1 = /window\.signOut,[\s\S]*?onAuthStateChanged;/;
html = html.replace(regex1, `window.signOut = signOut;
                      window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
                      window.signInWithEmailAndPassword = signInWithEmailAndPassword;
                      window.sendPasswordResetEmail = sendPasswordResetEmail;
                      window.onAuthStateChanged = onAuthStateChanged;`);
fs.writeFileSync('index.html', html);
console.log("Fixed exports");
