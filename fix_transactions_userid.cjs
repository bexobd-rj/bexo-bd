const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Replace newTransaction creation to include userId
const txnRegex1 = /const transaction = \{\s*id: 'BP' \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 6\)\.toUpperCase\(\),/g;
const txnReplacement1 = `const transaction = {
    id: 'BP' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    userId: userProfile.id || localStorage.getItem('bexo_active_uid'),
    profileId: userProfile.profileId,`;
code = code.replace(txnRegex1, txnReplacement1);

const txnRegex2 = /const transaction = \{\s*id: Date\.now\(\),\s*type: 'Income',/g;
const txnReplacement2 = `const transaction = {
    id: Date.now(),
    userId: targetUser.id || localStorage.getItem('bexo_active_uid'),
    profileId: targetUser.profileId,
    type: 'Income',`;
code = code.replace(txnRegex2, txnReplacement2);

const txnRegex3 = /const auditTxn = \{\s*id: auditTxnId,\s*profileId: profileId,/g;
const txnReplacement3 = `const auditTxn = {
    id: auditTxnId,
    userId: (targetUser && targetUser.id) ? targetUser.id : profileId,
    profileId: profileId,`;
code = code.replace(txnRegex3, txnReplacement3);

const txnRegex4 = /const auditTxnEntry = \{\s*id: txnId,\s*profileId: targetProfile\.profileId,/g;
const txnReplacement4 = `const auditTxnEntry = {
    id: txnId,
    userId: targetProfile.id,
    profileId: targetProfile.profileId,`;
code = code.replace(txnRegex4, txnReplacement4);

fs.writeFileSync('public/app.js', code);
console.log("Added userId to transactions");
