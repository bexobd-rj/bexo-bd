const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix subscribeSupabaseDoc for bexo_users (non-admin)
const subscribeRegex = /subscribeSupabaseDoc\('bexo_users', userProfile\.profileId, snap/g;
const subscribeReplacement = `subscribeSupabaseDoc('bexo_users', userProfile.id, snap`;
code = code.replace(subscribeRegex, subscribeReplacement);

// 2. Fix order creation to include userId
const newOrderRegex = /const newOrder = \{\s*id: orderId,\s*orderNo: orderNo,/m;
const newOrderReplacement = `const newOrder = {
    id: orderId,
    orderNo: orderNo,
    userId: userProfile.id || localStorage.getItem('bexo_active_uid'),`;
code = code.replace(newOrderRegex, newOrderReplacement);

// 3. Fix appWithdrawals creation to include userId if it misses it
const newWithdrawalRegex = /const newWithdrawal = \{\s*id: wId,\s*profileId: userProfile\.profileId,/m;
const newWithdrawalReplacement = `const newWithdrawal = {
    id: wId,
    userId: userProfile.id || localStorage.getItem('bexo_active_uid'),
    profileId: userProfile.profileId,`;
code = code.replace(newWithdrawalRegex, newWithdrawalReplacement);

fs.writeFileSync('public/app.js', code);
console.log("Fixed orders, withdrawals, and user sync subscriptions");
