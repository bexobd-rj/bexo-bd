const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const declarations = `
              let appOrders = JSON.parse(localStorage.getItem('bexo_orders')) || [];

              function saveOrders(orderIdToSync = null) {
                  localStorage.setItem('bexo_orders', JSON.stringify(appOrders));
                  if (window.db) {
                      if (orderIdToSync) {
                          const o = appOrders.find(item => String(item.id) === String(orderIdToSync));
                          if (o) {
                              window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                  .catch(err => console.error("Firebase sync specific order error:", err));
                          }
                      } else {
                          appOrders.forEach(o => {
                              window.db.collection('bexo_orders').doc(String(o.id)).set(sanitizeForFirestore(o))
                                  .catch(err => console.error("Firebase sync order error:", err));
                          });
                      }
                  }
              }
`;

html = html.replace("let appUsers = safeParse('bexo_users', [])", declarations + "\n              let appUsers = safeParse('bexo_users', [])");

fs.writeFileSync('index.html', html);
console.log("Added appOrders and saveOrders");
