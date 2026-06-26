import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetSaveOrders = `              function saveOrders() {
                  localStorage.setItem('bexo_orders', JSON.stringify(appOrders));
                  if (window.db) {
                      appOrders.forEach(o => {
                          if (o && o.id) {
                              window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                  .catch(err => console.error("Firebase sync order error:", err));
                          }
                      });
                  }
              }`;

const replaceSaveOrders = `              function saveOrders(specificOrderId = null) {
                  localStorage.setItem('bexo_orders', JSON.stringify(appOrders));
                  if (window.db) {
                      if (specificOrderId) {
                          const o = appOrders.find(order => String(order.id) === String(specificOrderId));
                          if (o) {
                              window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                  .catch(err => console.error("Firebase sync specific order error:", err));
                          }
                      } else {
                          appOrders.forEach(o => {
                              if (o && o.id) {
                                  window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                      .catch(err => console.error("Firebase sync order error:", err));
                              }
                          });
                      }
                  }
              }`;

html = html.replace(targetSaveOrders, replaceSaveOrders);

const targetUpdateCall = `saveOrders();
                  const isCurrentlyAdmin = (actor === 'Admin' || (document.getElementById('adminSection') && !document.getElementById('adminSection').classList.contains('hidden')));`;

const replaceUpdateCall = `saveOrders(orderId);
                  const isCurrentlyAdmin = (actor === 'Admin' || (document.getElementById('adminSection') && !document.getElementById('adminSection').classList.contains('hidden')));`;

html = html.replace(targetUpdateCall, replaceUpdateCall);

fs.writeFileSync('index.html', html);
console.log("Fixed saveOrders!");
