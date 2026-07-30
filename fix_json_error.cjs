const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the error handling in email verification
html = html.replace(
    /const verifyData = await verifyRes\.json\(\);\s*if \(\!verifyRes\.ok\) {/g,
    `
                                          let verifyData;
                                          try {
                                              verifyData = await verifyRes.json();
                                          } catch(e) {
                                              throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (Backend is not running).");
                                          }
                                          if (!verifyRes.ok) {
`
);

// Replace the error handling in phone verification
html = html.replace(
    /const verifyData = await verifyRes\.json\(\);\s*if \(\!verifyRes\.ok\) {\s*showToast\(verifyData\.error \|\| "মোবাইল ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে!", "error"\);/g,
    `
                                          let verifyData;
                                          try {
                                              verifyData = await verifyRes.json();
                                          } catch(e) {
                                              throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (Backend is not running).");
                                          }
                                          if (!verifyRes.ok) {
                                              showToast(verifyData.error || "মোবাইল ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে!", "error");
`
);

fs.writeFileSync('index.html', html);
