const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Require email in profile logic
const oldVal = /if\(!phone \|\| !name \|\| !shop \|\| !district \|\| !address\)/;
const newVal = "if(!email || !phone || !name || !shop || !district || !address)";
html = html.replace(oldVal, newVal);

// Change label in profile form
const oldEmailLabel = '<label class="block text-sm font-bold text-slate-700">জিমেইল / ইমেইল (ঐচ্ছিক)</label>';
const newEmailLabel = '<label class="block text-sm font-bold text-slate-700">জিমেইল / ইমেইল <span class="text-red-500">*</span></label>';
html = html.replace(oldEmailLabel, newEmailLabel);

// Make email field readonly so they can't change their login email easily, or keep it editable but they might change their login without knowing. Better to make it readonly.
const oldEmailInput = 'id="profileEmail" value="${userProfile.email || \'\'}" class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all text-slate-600 font-medium" placeholder="আপনার ইমেইল আইডি লিখুন"';
const newEmailInput = 'id="profileEmail" value="${userProfile.email || \'\'}" readonly class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" title="লগইন ইমেইল পরিবর্তনযোগ্য নয়"';
html = html.replace(oldEmailInput, newEmailInput);


fs.writeFileSync('index.html', html);
console.log('Modified Profile Form');
