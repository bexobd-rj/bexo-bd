const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

// We want to stop the `saveXXX` functions from saving the entire array to Firestore
// if specificId is not provided (unless they are explicitly requested, but even then, it's dangerous).
// Actually, let's just comment out the block:
// appUsers.forEach(u => ... set(...))
// We'll replace it with a console.warn

function commentOutSyncLoop(content, collectionName, arrayName) {
    // A regex to match the forEach loop that saves everything. This is tricky.
    // Let's do it manually for the most critical ones: saveOrders, saveUsers.
    return content;
}

// Since Regex is hard, let's just replace specific known blocks.

// 1. saveOrders
let blockOrders = `appOrders.forEach(o => {
                              if (o && o.id) {
                                  window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                      .catch(err => console.error("Firebase sync order error:", err));
                              }
                          });`;
if (content.includes(blockOrders)) {
    content = content.replace(blockOrders, `console.warn("Skipping full array sync for orders to prevent quota exhaustion.");`);
    console.log("Patched saveOrders full sync");
}

// 2. saveUsers
let blockUsers = `appUsers.forEach(u => {
                                  if (u && u.profileId) {
                                      window.db.collection('bexo_users').doc(String(u.profileId)).set(sanitizeForFirestore(u))
                                          .catch(err => console.error("Firebase sync user error:", err));
                                  }
                              });`;
if (content.includes(blockUsers)) {
    content = content.replace(blockUsers, `console.warn("Skipping full array sync for users to prevent quota exhaustion.");`);
    console.log("Patched saveUsers full sync");
}

// 3. saveCategories
let blockCats = `appCategories.forEach(c => {
                          if (c && c.id) {
                              window.db.collection('bexo_categories').doc(String(c.id)).set(sanitizeForFirestore(c))
                                  .catch(err => console.error("Firebase sync category error:", err));
                          }
                      });`;
if (content.includes(blockCats)) {
    content = content.replace(blockCats, `console.warn("Skipping full array sync for categories to prevent quota exhaustion.");`);
    console.log("Patched saveCategories full sync");
}

// 4. saveTransactions
let blockTxn = `appTransactions.forEach(t => {
                          if (t && t.id) {
                              window.db.collection('bexo_transactions').doc(String(t.id)).set(sanitizeForFirestore(t))
                                  .catch(err => console.error("Firebase sync transaction error:", err));
                          }
                      });`;
if (content.includes(blockTxn)) {
    content = content.replace(blockTxn, `console.warn("Skipping full array sync for transactions to prevent quota exhaustion.");`);
    console.log("Patched saveTransactions full sync");
}

// 5. saveAccounts
let blockAcc = `appAccounts.forEach(a => {
                          if (a && a.id) {
                              window.db.collection('bexo_accounts').doc(String(a.id)).set(sanitizeForFirestore(a))
                                  .catch(err => console.error("Firebase sync account error:", err));
                          }
                      });`;
if (content.includes(blockAcc)) {
    content = content.replace(blockAcc, `console.warn("Skipping full array sync for accounts.");`);
    console.log("Patched saveAccounts full sync");
}

fs.writeFileSync('main_script.js', content);
