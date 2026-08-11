const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I will just replace the specific broken part.
const broken = `                      if (loginBtn) {
                          loginBtn.disabled = false;
                          loginBtn.innerHTML = 'লগইন করুন <i class="fas fa-arrow-right"></i>';
                      }
                  }
              });
              }`;

const fixed = `                      if (loginBtn) {
                          loginBtn.disabled = false;
                          loginBtn.innerHTML = 'লগইন করুন <i class="fas fa-arrow-right"></i>';
                      }
                  }
              }`;

html = html.replace(broken, fixed);
fs.writeFileSync('index.html', html);
console.log("Fixed syntax error");
