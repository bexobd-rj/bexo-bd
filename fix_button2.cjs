const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const catchBlock = `} catch (error) {
                      console.error("Registration Error:", error);
                      showToast("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।", "error");
                  }`;

const newCatchBlock = `} catch (error) {
                      console.error("Registration Error:", error);
                      showToast("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।", "error");
                      if(document.getElementById('regSubmitBtn')) { document.getElementById('regSubmitBtn').disabled = false; document.getElementById('regSubmitBtn').innerHTML = '<i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন'; }
                  }`;

html = html.replace(catchBlock, newCatchBlock);

const endSuccess = `showToast("অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি এবং ভেরিফাই হয়েছে।", "success");`;
const newEndSuccess = `showToast("অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি এবং ভেরিফাই হয়েছে।", "success");
                          if(document.getElementById('regSubmitBtn')) { document.getElementById('regSubmitBtn').disabled = false; document.getElementById('regSubmitBtn').innerHTML = '<i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন'; }`;

html = html.replace(endSuccess, newEndSuccess);

fs.writeFileSync('index.html', html);
console.log("Fixes applied 2.");
