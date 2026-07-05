const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const openLiveChatOld = `window.openLiveChat = async function() {
    let profileId = window.userProfile && window.userProfile.profileId;
    let userName = window.userProfile && window.userProfile.fullName ? window.userProfile.fullName : 'Guest User';
    let phone = window.userProfile && window.userProfile.phone ? window.userProfile.phone : '';
    let email = window.userProfile && window.userProfile.email ? window.userProfile.email : '';
    let isGuest = false;
    let possibleRegisteredUser = null;
    let ipAddress = 'Unknown';
    let profilePic = window.userProfile && window.userProfile.profilePic ? window.userProfile.profilePic : '';

    // Track last known user for smart identification
    if (window.userProfile && window.userProfile.profileId) {
        localStorage.setItem('bexo_last_known_user', JSON.stringify({
            profileId: window.userProfile.profileId,
            fullName: window.userProfile.fullName,
            phone: window.userProfile.phone,
            email: window.userProfile.email,
            profilePic: window.userProfile.profilePic
        }));
    } else {`;

const openLiveChatNew = `window.openLiveChat = async function() {
    let userProfStr = localStorage.getItem('bexo_profile');
    let uProfile = null;
    try {
        if (userProfStr) uProfile = JSON.parse(userProfStr);
        // Fallback to window.userProfile if it somehow exists
        if (!uProfile || !uProfile.profileId) {
            uProfile = typeof userProfile !== 'undefined' ? userProfile : (window.userProfile || null);
        }
    } catch(e) {}

    let profileId = uProfile && uProfile.profileId;
    let userName = uProfile && uProfile.fullName ? uProfile.fullName : 'Guest User';
    let phone = uProfile && uProfile.phone ? uProfile.phone : '';
    let email = uProfile && uProfile.email ? uProfile.email : '';
    let isGuest = false;
    let possibleRegisteredUser = null;
    let ipAddress = 'Unknown';
    let profilePic = uProfile && uProfile.profilePic ? uProfile.profilePic : '';

    // Track last known user for smart identification
    if (uProfile && uProfile.profileId) {
        localStorage.setItem('bexo_last_known_user', JSON.stringify({
            profileId: uProfile.profileId,
            fullName: uProfile.fullName,
            phone: uProfile.phone,
            email: uProfile.email,
            profilePic: uProfile.profilePic
        }));
    } else {`;

html = html.replace(openLiveChatOld, openLiveChatNew);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done fixing userProfile usage");
