const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const completeRegCode = `
              async function completeRegistration(newProfile) {
                  try {
                      if (!window.supabase) {
                          showToast("সিস্টেম এরর: ডাটাবেস সংযোগ নেই।", "error");
                          return;
                      }
                      
                      const { error } = await window.supabase.from('bexo_users').insert([{
                          id: newProfile.id,
                          profileId: newProfile.profileId,
                          email: newProfile.email,
                          phone: newProfile.phone,
                          "fullName": newProfile.fullName,
                          password: newProfile.password,
                          created_at: newProfile.createdAt ? new Date(newProfile.createdAt).toISOString() : new Date().toISOString()
                      }]);
                      
                      if (error) {
                          console.error("Supabase insert error:", error);
                          showToast("প্রোফাইল সেভ করতে সমস্যা হয়েছে।", "error");
                          return;
                      }

                      // Local state update
                      userProfile = newProfile;
                      if (typeof appUsers !== 'undefined') appUsers.push(userProfile);
                      if (typeof saveProfile === 'function') saveProfile();
                      if (typeof saveUsers === 'function') saveUsers(userProfile.profileId);
                      
                      showToast('অ্যাকাউন্ট তৈরি সফল হয়েছে!', 'success');
                      
                      const authSection = document.getElementById('authSection');
                      const dashboardSection = document.getElementById('dashboardSection');
                      const landingSection = document.getElementById('landingSection');
                      if (landingSection) landingSection.classList.add('hidden');
                      if (authSection) authSection.classList.add('hidden');
                      if (dashboardSection) {
                          dashboardSection.classList.remove('hidden');
                          dashboardSection.classList.add('fade-in');
                      }
                      
                      if (typeof renderHome === 'function') renderHome();
                      if (typeof updateHeaderUI === 'function') updateHeaderUI();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (err) {
                      console.error("Registration finalization error:", err);
                      showToast("অ্যাকাউন্ট তৈরি সফল হয়েছে, কিন্তু লগইন করতে সমস্যা হচ্ছে।", "warning");
                  }
              }

              function showGoogleFallbackModal(callback) {`;

if (code.includes('function showGoogleFallbackModal(callback) {')) {
    code = code.replace('function showGoogleFallbackModal(callback) {', completeRegCode);
    fs.writeFileSync('index.html', code);
    console.log("Patched completeRegistration!");
} else {
    console.log("Target not found!");
}
