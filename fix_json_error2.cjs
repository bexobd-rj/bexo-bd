const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the error handling in send email verification
html = html.replace(
    /const data = await res\.json\(\);\s*if \(\!res\.ok\) {/g,
    `
                              let data;
                              try {
                                  data = await res.json();
                              } catch (e) {
                                  throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (Backend is not running).");
                              }
                              if (!res.ok) {
`
);

// Replace the error handling in send phone otp verification
html = html.replace(
    /const phoneData = await resendRes\.json\(\);\s*if \(\!resendRes\.ok\) {/g,
    `
                                      let phoneData;
                                      try {
                                          phoneData = await resendRes.json();
                                      } catch(e) {
                                          throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (Backend is not running).");
                                      }
                                      if (!resendRes.ok) {
`
);

fs.writeFileSync('index.html', html);
