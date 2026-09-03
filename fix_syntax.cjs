const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                              }).subscribe();
                          }).catch(function(err) {
                            if (onError) onError(err);
                          });`;

const repl = `                              }).subscribe();`;

code = code.replace(target, repl);
fs.writeFileSync('index.html', code);
