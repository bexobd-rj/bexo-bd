const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /window\.showSupabaseConnectionInfo = function\(\) \{[\s\S]*?alert\(message\);\s*\};/;

const replacementStr = `window.showSupabaseConnectionInfo = function() {
                  const client = window.getSupabase();
                  const isConfigured = !!client;
                  
                  // Check if there are actual sync errors
                  const errorLogs = window.supabaseErrors || [];
                  const hasErrors = errorLogs.length > 0;

                  let message = "";
                  if (isConfigured && !hasErrors) {
                      message = "✅ Supabase ক্লাউড ডাটাবেজের সাথে সফলভাবে সংযুক্ত রয়েছে। আপনার ডাটা ক্লাউডে সুরক্ষিত ও সিঙ্ক হচ্ছে।";
                  } else if (isConfigured && hasErrors) {
                      message = "⚠️ Supabase সংযুক্ত আছে, কিন্তু ডাটা সিঙ্ক হতে সমস্যা হচ্ছে।\\n\\nকারণ হতে পারে:\\n১. ডাটাবেজে টেবিলগুলো (bexo_users, bexo_posts ইত্যাদি) তৈরি করা হয়নি।\\n২. Row Level Security (RLS) পলিসি অন করা আছে যা ডাটা পড়তে বাধা দিচ্ছে।\\n\\nশেষ এরর:\\n" + (errorLogs[errorLogs.length - 1]?.error || "অজানা এরর");
                  } else {
                      message = "ℹ️ বর্তমানে অ্যাপটি লোকাল মেমরি মোডে (Local Active) চলছে।\\n\\nSupabase ক্লাউডে সরাসরি কানেক্ট করতে চাইলে:\\n১. প্রজেক্টের .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY যোগ করুন,\\n২. অথবা এডমিন প্যানেলের 'API & Database Config' সেকশনে Supabase ক্রেডেনশিয়াল সেট করুন।";
                  }
                  
                  alert(message);
              };`;

if (regex.test(code)) {
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Success: Replaced showSupabaseConnectionInfo");
} else {
    console.log("Error: Target string not found.");
}
