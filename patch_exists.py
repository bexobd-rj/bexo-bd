import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");\n                      toggleAuth(true); // Switch to login form',
    'showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);'
)

content = content.replace(
    'showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");',
    'showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);'
)

content = content.replace(
    'showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে!", "error");',
    'showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে!", "error", 6000);'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched existing user messages")
