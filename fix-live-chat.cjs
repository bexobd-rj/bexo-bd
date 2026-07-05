const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. We replace openLiveChat
const openLiveChatOld = `// Open Live Chat UI
window.openLiveChat = function() {
    let profileId = window.userProfile && window.userProfile.profileId;
    let userName = window.userProfile && window.userProfile.fullName ? window.userProfile.fullName : 'Guest User';
    let phone = window.userProfile && window.userProfile.phone ? window.userProfile.phone : '';
    let isGuest = false;

    if (!profileId) {
        // Look for existing guest ID
        profileId = localStorage.getItem('bexo_guest_id');
        if (!profileId) {
            profileId = 'guest_' + Math.random().toString(36).substring(2, 12);
            localStorage.setItem('bexo_guest_id', profileId);
        }
        isGuest = true;
    }
    
    // Set this globally for chat logic
    window.currentChatSession = { profileId, userName, phone, isGuest };`;

const openLiveChatNew = `// Open Live Chat UI
window.openLiveChat = async function() {
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
    } else {
        const lastKnown = localStorage.getItem('bexo_last_known_user');
        if (lastKnown) {
            try {
                possibleRegisteredUser = JSON.parse(lastKnown);
                userName = 'Guest (Possible: ' + (possibleRegisteredUser.fullName || possibleRegisteredUser.phone) + ')';
            } catch(e) {}
        }
    }

    // Handle Guest ID
    let guestId = localStorage.getItem('bexo_guest_id');
    if (!guestId) {
        guestId = 'Guest-' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('bexo_guest_id', guestId);
    }

    // Fetch IP asynchronously for Guests
    if (!profileId) {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            ipAddress = data.ip;
        } catch(e){}
    }

    if (!profileId) {
        profileId = guestId;
        isGuest = true;
        if (!possibleRegisteredUser) {
           userName = guestId; 
        }
    } else {
        // Logged in! Merge guest chats if they exist
        if (guestId && window.db) {
            try {
                const guestRef = window.db.collection('guest_chats').doc(guestId);
                const guestDoc = await guestRef.get();
                if (guestDoc.exists) {
                    const guestData = guestDoc.data();
                    if (guestData.messages && guestData.messages.length > 0) {
                        const userRef = window.db.collection('live_chats').doc(profileId);
                        await window.db.runTransaction(async t => {
                            const userDoc = await t.get(userRef);
                            let userMsgs = userDoc.exists ? (userDoc.data().messages || []) : [];
                            const allMsgs = [...guestData.messages, ...userMsgs].sort((a,b) => a.timestamp - b.timestamp);
                            t.set(userRef, {
                                userId: profileId,
                                userName: userName,
                                phone: phone,
                                email: email,
                                isGuest: false,
                                profilePic: profilePic,
                                lastMessage: allMsgs[allMsgs.length-1].text,
                                lastMessageTime: allMsgs[allMsgs.length-1].timestamp,
                                unreadAdmin: (userDoc.exists ? (userDoc.data().unreadAdmin||0) : 0) + (guestData.unreadAdmin||0),
                                unreadUser: (userDoc.exists ? (userDoc.data().unreadUser||0) : 0) + (guestData.unreadUser||0),
                                messages: allMsgs
                            }, { merge: true });
                            t.delete(guestRef);
                        });
                        localStorage.removeItem('bexo_guest_id'); // Merged successfully
                    } else {
                        // Empty guest doc, just delete it
                        guestRef.delete();
                    }
                }
            } catch(e) {
                console.error("Merge error", e);
            }
        }
    }
    
    // Set this globally for chat logic
    window.currentChatSession = { profileId, userName, phone, email, isGuest, ipAddress, possibleRegisteredUser, profilePic };`;

html = html.replace(openLiveChatOld, openLiveChatNew);

// 2. We replace sendLiveChatMessage
const sendLiveChatMessageOld = `                    lastMessage: text,
                    lastMessageTime: Date.now(),
                    unreadAdmin: 1,
                    unreadUser: 0,
                    messages: [newMsg]
                });
            } else {
                const data = doc.data();
                const messages = data.messages || [];
                messages.push(newMsg);
                transaction.update(docRef, {
                    lastMessage: text,
                    lastMessageTime: Date.now(),
                    unreadAdmin: (data.unreadAdmin || 0) + 1,
                    userName: window.currentChatSession.userName || data.userName, // Update in case changed
                    messages: messages
                });
            }
        });
    }).catch(e => { console.error("Error sending message", e); alert("Message failed to send: " + e.message); });
};`;

const sendLiveChatMessageNew = `                    ipAddress: window.currentChatSession.ipAddress,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : null,
                    profilePic: window.currentChatSession.profilePic,
                    lastMessage: text,
                    lastMessageTime: Date.now(),
                    unreadAdmin: 1,
                    unreadUser: 0,
                    messages: [newMsg]
                });
            } else {
                const data = doc.data();
                const messages = data.messages || [];
                messages.push(newMsg);
                transaction.update(docRef, {
                    lastMessage: text,
                    lastMessageTime: Date.now(),
                    unreadAdmin: (data.unreadAdmin || 0) + 1,
                    userName: window.currentChatSession.userName || data.userName, // Update in case changed
                    ipAddress: window.currentChatSession.ipAddress || data.ipAddress,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : data.possibleRegisteredUser,
                    profilePic: window.currentChatSession.profilePic || data.profilePic,
                    messages: messages
                });
            }
        });
    }).catch(e => { console.error("Error sending message", e); alert("Message failed to send: " + e.message); });
};`;

html = html.replace(sendLiveChatMessageOld, sendLiveChatMessageNew);

// 3. We replace admin render list and details
const adminChatsOld = `window.renderAdminLiveChats = function(collectionName = 'live_chats') {
    window.adminCurrentLiveChatCollection = collectionName;
    const container = document.getElementById('adminViewContainer');
    const title = collectionName === 'guest_chats' ? 'আননোন চ্যাট ম্যানেজমেন্ট' : 'লাইভ চ্যাট ম্যানেজমেন্ট';
    const subtitle = collectionName === 'guest_chats' ? 'গেস্ট গ্রাহকদের লাইভ চ্যাট মেসেজ ও রিপ্লাই' : 'গ্রাহকদের লাইভ চ্যাট মেসেজ ও রিপ্লাই';
    
    container.innerHTML = \`
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800">\${title}</h2>
                    <p class="text-sm font-bold text-slate-400 mt-1">\${subtitle}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                <!-- Chat List -->
                <div class="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
                        চ্যাট তালিকা
                    </div>
                    <div id="adminLiveChatList" class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        <div class="flex justify-center p-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div></div>
                    </div>
                </div>
                
                <!-- Chat Detail -->
                <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div id="adminLiveChatHeader" class="p-4 border-b border-slate-100 bg-[#10b981] text-white flex items-center gap-3">
                        <h3 class="font-bold">চ্যাট সিলেক্ট করুন</h3>
                    </div>
                    
                    <div id="adminLiveChatMessages" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-[#f5f7fa]">
                        <div class="text-center text-slate-400 text-sm mt-10">বাম পাশ থেকে একটি চ্যাট সিলেক্ট করুন</div>
                    </div>
                    
                    <div id="adminLiveChatInputArea" class="p-4 bg-white border-t border-slate-100 hidden">
                        <div class="flex items-center gap-3">
                            <input type="text" id="adminLiveChatMessageInput" placeholder="রিপ্লাই লিখুন..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500" onkeypress="if(event.key === 'Enter') adminSendLiveChatMessage()">
                            <button onclick="adminSendLiveChatMessage()" class="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-colors">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    \`;
    
    adminSubscribeLiveChatsList(collectionName);
};`;

const adminChatsNew = `window.renderAdminLiveChats = function(collectionName = 'live_chats') {
    window.adminCurrentLiveChatCollection = collectionName;
    const container = document.getElementById('adminViewContainer');
    
    container.innerHTML = \`
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800">লাইভ চ্যাট ম্যানেজমেন্ট</h2>
                    <p class="text-sm font-bold text-slate-400 mt-1">গ্রাহকদের লাইভ চ্যাট মেসেজ ও রিপ্লাই</p>
                </div>
            </div>
            
            <div class="flex gap-4 mb-4">
                <button onclick="renderAdminLiveChats('live_chats')" class="px-6 py-2 rounded-full font-bold transition-colors \${collectionName === 'live_chats' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}">Registered Users</button>
                <button onclick="renderAdminLiveChats('guest_chats')" class="px-6 py-2 rounded-full font-bold transition-colors \${collectionName === 'guest_chats' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}">Guest Users</button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
                <!-- Chat List -->
                <div class="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
                        \${collectionName === 'live_chats' ? 'Registered Users Chat' : 'Guest Users Chat'}
                    </div>
                    <div id="adminLiveChatList" class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        <div class="flex justify-center p-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div></div>
                    </div>
                </div>
                
                <!-- Chat Detail -->
                <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div id="adminLiveChatHeader" class="p-4 border-b border-slate-100 bg-[#10b981] text-white flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <h3 class="font-bold">চ্যাট সিলেক্ট করুন</h3>
                        </div>
                    </div>
                    
                    <div id="adminLiveChatMessages" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-[#f5f7fa]">
                        <div class="text-center text-slate-400 text-sm mt-10">বাম পাশ থেকে একটি চ্যাট সিলেক্ট করুন</div>
                    </div>
                    
                    <div id="adminLiveChatInputArea" class="p-4 bg-white border-t border-slate-100 hidden">
                        <div class="flex items-center gap-3">
                            <input type="text" id="adminLiveChatMessageInput" placeholder="রিপ্লাই লিখুন..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500" onkeypress="if(event.key === 'Enter') adminSendLiveChatMessage()">
                            <button onclick="adminSendLiveChatMessage()" class="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-colors">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    \`;
    
    adminSubscribeLiveChatsList(collectionName);
};`;
html = html.replace(adminChatsOld, adminChatsNew);

// 4. Update the on-click handler in list
const listOld = `                    <div onclick="adminOpenLiveChatDetail('\${data.userId}', '\${data.userName}')" class="p-3 rounded-2xl border cursor-pointer transition-colors \${isActive}">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-bold text-slate-800 text-sm truncate pr-2">\${data.userName}</h4>
                            <span class="text-[10px] text-slate-400 whitespace-nowrap">\${time}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-slate-500 truncate pr-2">\${data.lastMessage}</p>
                            \${unreadBadge}
                        </div>
                    </div>`;
                    
const listNew = `                    <div onclick="adminOpenLiveChatDetail('\${data.userId}', '\${data.userName.replace(/'/g, "\\'")}', \${data.isGuest}, '\${data.ipAddress || ''}', '\${data.possibleRegisteredUser ? encodeURIComponent(data.possibleRegisteredUser) : ''}', '\${data.profilePic || ''}', '\${data.email || ''}')" class="p-3 rounded-2xl border cursor-pointer transition-colors \${isActive}">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-bold text-slate-800 text-sm truncate pr-2">\${data.userName}</h4>
                            <span class="text-[10px] text-slate-400 whitespace-nowrap">\${time}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-slate-500 truncate pr-2">\${data.lastMessage}</p>
                            \${unreadBadge}
                        </div>
                    </div>`;
html = html.replace(listOld, listNew);

// 5. Update adminOpenLiveChatDetail
const openDetailOld = `window.adminOpenLiveChatDetail = function(userId, userName) {
    window.adminCurrentLiveChatUser = userId;
    const collectionName = window.adminCurrentLiveChatCollection;
    
    // Update Header
    document.getElementById('adminLiveChatHeader').innerHTML = \`
        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">\${userName.charAt(0)}</div>
        <div>
            <h3 class="font-bold text-white text-base">\${userName}</h3>
            <p class="text-white/80 text-[10px]">ID: \${userId}</p>
        </div>
    \`;
    
    document.getElementById('adminLiveChatInputArea').classList.remove('hidden');`;

const openDetailNew = `window.adminOpenLiveChatDetail = function(userId, userName, isGuest, ipAddress, possibleRegisteredUserStr, profilePic, email) {
    window.adminCurrentLiveChatUser = userId;
    const collectionName = window.adminCurrentLiveChatCollection;
    
    let possibleRegisteredUser = null;
    if (possibleRegisteredUserStr) {
        try { possibleRegisteredUser = JSON.parse(decodeURIComponent(possibleRegisteredUserStr)); } catch(e){}
    }
    
    let profileBtn = '';
    if (!isGuest) {
        profileBtn = \`<button onclick="viewUserProfileInAdmin('\${userId}')" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors shadow-sm">View Profile</button>\`;
    } else if (possibleRegisteredUser && possibleRegisteredUser.profileId) {
        profileBtn = \`<button onclick="viewUserProfileInAdmin('\${possibleRegisteredUser.profileId}')" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors shadow-sm text-yellow-100">Linked Profile</button>\`;
    }
    
    let extraInfo = '';
    if (isGuest) {
        extraInfo = \`IP: \${ipAddress || 'Unknown'}\`;
    } else {
        extraInfo = email || 'Registered User';
    }
    
    let avatarSrc = profilePic ? profilePic : \`https://ui-avatars.com/api/?name=\${encodeURIComponent(userName)}&background=ffffff&color=10b981&rounded=true&bold=true\`;

    // Update Header
    document.getElementById('adminLiveChatHeader').innerHTML = \`
        <div class="flex items-center gap-3">
            <img src="\${avatarSrc}" alt="Avatar" class="w-10 h-10 rounded-full border border-white/30 bg-emerald-600">
            <div>
                <h3 class="font-bold text-white text-base">\${userName}</h3>
                <p class="text-white/80 text-[10px]">ID: \${userId} | \${extraInfo}</p>
            </div>
        </div>
        <div>
            \${profileBtn}
        </div>
    \`;
    
    document.getElementById('adminLiveChatInputArea').classList.remove('hidden');`;
html = html.replace(openDetailOld, openDetailNew);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done replacing");
