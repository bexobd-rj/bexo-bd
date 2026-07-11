// Open Live Chat UI
window.openLiveChat = async function() {
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
    window.currentChatSession = { profileId, userName, phone, email, isGuest, ipAddress, possibleRegisteredUser, profilePic };
    
    let chat = document.getElementById('liveChatModal');
    if (!chat) {
        chat = document.createElement('div');
        chat.id = 'liveChatModal';
        chat.className = 'fixed inset-0 z-[3000] bg-[#f5f7fa] flex flex-col font-sans animate-fade-in sm:w-[450px] sm:left-auto sm:right-0 sm:shadow-2xl';
        
        chat.innerHTML = `
            <!-- Header -->
            <div class="bg-[#10b981] px-4 py-4 flex flex-col shadow-md rounded-b-xl relative z-20">
                <div class="flex items-center gap-3 mb-1">
                    <button onclick="closeLiveChat()" class="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center justify-center w-8 h-8">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h2 class="text-white text-lg font-bold">লাইভ চ্যাট</h2>
                            <span class="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full border border-white/30">অনলাইন</span>
                        </div>
                        <p class="text-white/80 text-xs mt-0.5">আমাদের সাপোর্ট টিম আপনার সাথে আছে</p>
                    </div>
                </div>
            </div>

            <!-- Chat Content Area -->
            <div id="liveChatMessagesArea" class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col relative z-10 custom-scrollbar pb-6">
                <!-- Messages will be injected here -->
                <div class="flex justify-center my-4">
                    <span class="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full shadow-sm">লোড হচ্ছে...</span>
                </div>
            </div>

            <!-- Input Area -->
            <div class="bg-white p-3 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] border-t border-slate-100 mt-auto relative z-20">
                <div class="flex items-center gap-3 max-w-4xl mx-auto w-full">
                    <div class="flex-1 bg-[#f0f2f5] rounded-full flex items-center px-4 py-2 border border-slate-200">
                        <input type="text" id="liveChatMessageInput" placeholder="এখানে মেসেজ লিখুন..." class="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400" onkeypress="if(event.key === 'Enter') sendLiveChatMessage()">
                    </div>
                    <button onclick="sendLiveChatMessage()" class="w-11 h-11 bg-[#10b981] hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="text-center mt-3 mb-1">
                    <span class="text-[9px] font-black text-slate-300 tracking-widest">POWERED BY BEXOBD SUPPORT</span>
                </div>
            </div>
        `;
        document.body.appendChild(chat);
    }
    
    // Subscribe to Firebase Live Chat
    window.subscribeLiveChatUser();
};

window.closeLiveChat = function() {
    const chat = document.getElementById('liveChatModal');
    if (chat) chat.remove();
    if (window.liveChatUnsubscribe) {
        window.liveChatUnsubscribe();
        window.liveChatUnsubscribe = null;
    }
};

window.subscribeLiveChatUser = function() {
    if (!window.db || !window.currentChatSession) return;
    
    const userId = String(window.currentChatSession.profileId);
    const collectionName = window.currentChatSession.isGuest ? 'guest_chats' : 'live_chats';
    
    window.liveChatUnsubscribe = window.db.collection(collectionName).doc(userId).onSnapshot(doc => {
        const data = doc.data() || { messages: [] };
        renderLiveChatMessagesUser(data.messages || []);
        
        // Reset unreadUser
        if (data.unreadUser > 0) {
            window.db.collection(collectionName).doc(userId).update({ unreadUser: 0 }).catch(e => console.error(e));
        }
    });
};

function formatChatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

window.renderLiveChatMessagesUser = function(messages) {
    const area = document.getElementById('liveChatMessagesArea');
    if (!area) return;
    
    let html = `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <img src="https://ui-avatars.com/api/?name=Support&background=10b981&color=fff&rounded=true&bold=true" alt="Support" class="w-10 h-10 rounded-full">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 text-sm">সাপোর্ট এক্সপার্ট</h3>
                    <div class="flex items-center gap-1.5 mt-0.5">
                        <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span class="text-[10px] text-slate-500 font-bold">অনলাইন</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-0.5">সাধারণত উত্তর দিতে সময় লাগে কিছু সেকেন্ড</p>
                </div>
            </div>
        </div>
        <div class="flex justify-center my-4">
            <span class="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full shadow-sm">আজ</span>
        </div>
    `;
    
    if (messages.length === 0) {
        html += `<div class="text-center text-slate-400 text-xs mt-4">কোনো মেসেজ নেই। শুরু করতে মেসেজ পাঠান।</div>`;
    }
    
    messages.forEach(m => {
        const time = formatChatTime(m.timestamp);
        if (m.sender === 'user') {
            html += `
                <div class="flex justify-end mb-4">
                    <div class="max-w-[80%] bg-[#e6f4ea] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm border border-[#cce5d3]">
                        <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">${m.text}</p>
                        <div class="flex justify-end items-center gap-1 mt-1">
                            <span class="text-[10px] text-slate-500">${time}</span>
                            <i class="fas fa-check-double text-green-500 text-[10px]"></i>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="flex justify-start mb-4 gap-2">
                    <img src="https://ui-avatars.com/api/?name=Support&background=10b981&color=fff&rounded=true&bold=true" alt="Support" class="w-6 h-6 rounded-full mt-1 shrink-0">
                    <div class="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-slate-100">
                        <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">${m.text}</p>
                        <div class="flex justify-start items-center gap-1 mt-1">
                            <span class="text-[10px] text-slate-400">${time}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    area.innerHTML = html;
    area.scrollTop = area.scrollHeight;
};

window.sendLiveChatMessage = function() {
    console.log("sendLiveChatMessage called");
    const input = document.getElementById('liveChatMessageInput');
    const text = input.value.trim();
    if (!text || !window.db || !window.currentChatSession) return;
    
    input.value = '';
    
    const userId = String(window.currentChatSession.profileId);
    const collectionName = window.currentChatSession.isGuest ? 'guest_chats' : 'live_chats';
    const docRef = window.db.collection(collectionName).doc(userId);
    
    const newMsg = {
        text: text,
        sender: 'user',
        timestamp: Date.now()
    };
    
    console.log("Starting transaction for:", userId);
    window.db.runTransaction(transaction => {
        return transaction.get(docRef).then(doc => {
            if (!doc.exists) {
                transaction.set(docRef, {
                    userId: userId,
                    userName: window.currentChatSession.userName,
                    phone: window.currentChatSession.phone,
                    isGuest: window.currentChatSession.isGuest,
                    email: window.currentChatSession.email || '',
                    ipAddress: window.currentChatSession.ipAddress,
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
                    userName: window.currentChatSession.userName || data.userName || null, // Update in case changed
                    email: window.currentChatSession.email || data.email || null,
                    ipAddress: window.currentChatSession.ipAddress || data.ipAddress || null,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : (data.possibleRegisteredUser || null),
                    profilePic: window.currentChatSession.profilePic || data.profilePic || null,
                    messages: messages
                });
            }
        });
    }).catch(e => { console.error("Error sending message", e); alert("Message failed to send: " + e.message); });
};

window.renderAdminLiveChats = function(collectionName = 'live_chats') {
    window.adminCurrentLiveChatCollection = collectionName;
    const container = document.getElementById('adminViewContainer');
    
    container.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800">সাপোর্ট টিকিট ম্যানেজমেন্ট</h2>
                    <p class="text-sm font-bold text-slate-400 mt-1">গ্রাহকদের লাইভ চ্যাট মেসেজ ও রিপ্লাই</p>
                </div>
            </div>
            
            <div class="flex gap-4 mb-4">
                <button onclick="renderAdminLiveChats('live_chats')" class="px-6 py-2 rounded-full font-bold transition-colors ${collectionName === 'live_chats' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}">রেজিস্টার্ড ইউজার</button>
                <button onclick="renderAdminLiveChats('guest_chats')" class="px-6 py-2 rounded-full font-bold transition-colors ${collectionName === 'guest_chats' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}">গেস্ট ইউজার</button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
                <!-- Chat List -->
                <div class="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
                        ${collectionName === 'live_chats' ? 'রেজিস্টার্ড ইউজার চ্যাট' : 'গেস্ট ইউজার চ্যাট'}
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
    `;
    
    adminSubscribeLiveChatsList(collectionName);
};

window.adminCurrentLiveChatUser = null;
window.adminCurrentLiveChatCollection = 'live_chats';
window.adminLiveChatsUnsubscribe = null;
window.adminLiveChatDetailUnsubscribe = null;

window.adminSubscribeLiveChatsList = function(collectionName) {
    if (window.adminLiveChatsUnsubscribe) window.adminLiveChatsUnsubscribe();
    
    window.adminLiveChatsUnsubscribe = window.db.collection(collectionName).orderBy('lastMessageTime', 'desc').onSnapshot(snapshot => {
        const listArea = document.getElementById('adminLiveChatList');
        if (!listArea) return;
        
        let html = '';
        if (snapshot.empty) {
            html = `<div class="text-center text-slate-400 text-xs p-4">কোনো চ্যাট নেই</div>`;
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                const unreadBadge = data.unreadAdmin > 0 ? `<span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${data.unreadAdmin}</span>` : '';
                const time = formatChatTime(data.lastMessageTime);
                const isActive = window.adminCurrentLiveChatUser === data.userId ? 'bg-emerald-50 border-emerald-100' : 'hover:bg-slate-50 border-transparent';
                
                html += `
                    <div onclick="adminOpenLiveChatDetail('${data.userId}', '${data.userName.replace(/'/g, "\'")}', ${data.isGuest}, '${data.ipAddress || ''}', '${data.possibleRegisteredUser ? encodeURIComponent(data.possibleRegisteredUser) : ''}', '${data.profilePic || ''}', '${data.email || ''}')" class="p-3 rounded-2xl border cursor-pointer transition-colors ${isActive}">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-bold text-slate-800 text-sm truncate pr-2">${data.userName}</h4>
                            <span class="text-[10px] text-slate-400 whitespace-nowrap">${time}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-slate-500 truncate pr-2">${data.lastMessage}</p>
                            ${unreadBadge}
                        </div>
                    </div>
                `;
            });
        }
        listArea.innerHTML = html;
    });
};

window.adminOpenLiveChatDetail = function(userId, userName, isGuest, ipAddress, possibleRegisteredUserStr, profilePic, email) {
    window.adminCurrentLiveChatUser = userId;
    const collectionName = window.adminCurrentLiveChatCollection;
    
    let possibleRegisteredUser = null;
    if (possibleRegisteredUserStr) {
        try { possibleRegisteredUser = JSON.parse(decodeURIComponent(possibleRegisteredUserStr)); } catch(e){}
    }
    
    let profileBtn = '';
    if (!isGuest) {
        profileBtn = `<button onclick="viewUserProfileInAdmin('${userId}')" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors shadow-sm">View Profile</button>`;
    } else if (possibleRegisteredUser && possibleRegisteredUser.profileId) {
        profileBtn = `<button onclick="viewUserProfileInAdmin('${possibleRegisteredUser.profileId}')" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors shadow-sm text-yellow-100">Linked Profile</button>`;
    }
    
    let extraInfo = '';
    if (isGuest) {
        extraInfo = `IP: ${ipAddress || 'Unknown'}`;
    } else {
        extraInfo = email || 'Registered User';
    }
    
    let avatarSrc = profilePic ? profilePic : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ffffff&color=10b981&rounded=true&bold=true`;

    // Update Header
    document.getElementById('adminLiveChatHeader').innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${avatarSrc}" alt="Avatar" class="w-10 h-10 rounded-full border border-white/30 bg-emerald-600">
            <div>
                <h3 class="font-bold text-white text-base">${userName}</h3>
                <p class="text-white/80 text-[10px]">ID: ${userId} | ${extraInfo}</p>
            </div>
        </div>
        <div>
            ${profileBtn}
        </div>
    `;
    
    document.getElementById('adminLiveChatInputArea').classList.remove('hidden');
    
    // Subscribe to details
    if (window.adminLiveChatDetailUnsubscribe) window.adminLiveChatDetailUnsubscribe();
    
    window.adminLiveChatDetailUnsubscribe = window.db.collection(collectionName).doc(userId).onSnapshot(doc => {
        const messagesArea = document.getElementById('adminLiveChatMessages');
        if (!messagesArea) return;
        
        if (!doc.exists) {
            messagesArea.innerHTML = `<div class="text-center text-slate-400 text-sm mt-10">চ্যাট পাওয়া যায়নি</div>`;
            return;
        }
        
        const data = doc.data();
        let html = '';
        
        (data.messages || []).forEach(m => {
            const time = formatChatTime(m.timestamp);
            if (m.sender === 'admin') {
                html += `
                    <div class="flex justify-end mb-4">
                        <div class="max-w-[80%] bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm border border-[#cce5d3]">
                            <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">${m.text}</p>
                            <div class="flex justify-end items-center gap-1 mt-1">
                                <span class="text-[10px] text-slate-500">${time}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="flex justify-start mb-4">
                        <div class="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-slate-100">
                            <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">${m.text}</p>
                            <div class="flex justify-start items-center gap-1 mt-1">
                                <span class="text-[10px] text-slate-400">${time}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        messagesArea.innerHTML = html;
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Reset unreadAdmin
        if (data.unreadAdmin > 0) {
            window.db.collection(collectionName).doc(userId).update({ unreadAdmin: 0 }).catch(e => console.error(e));
        }
    });
};

window.adminSendLiveChatMessage = function() {
    if (!window.adminCurrentLiveChatUser) return;
    
    const input = document.getElementById('adminLiveChatMessageInput');
    const text = input.value.trim();
    if (!text || !window.db) return;
    
    input.value = '';
    
    const userId = window.adminCurrentLiveChatUser;
    const collectionName = window.adminCurrentLiveChatCollection;
    const docRef = window.db.collection(collectionName).doc(userId);
    
    const newMsg = {
        text: text,
        sender: 'admin',
        timestamp: Date.now()
    };
    
    window.db.runTransaction(transaction => {
        return transaction.get(docRef).then(doc => {
            if (!doc.exists) return; // Should exist if admin is replying
            const data = doc.data();
            const messages = data.messages || [];
            messages.push(newMsg);
            transaction.update(docRef, {
                lastMessage: "সাপোর্ট: " + text,
                lastMessageTime: Date.now(),
                unreadUser: (data.unreadUser || 0) + 1,
                messages: messages
            });
        });
    }).catch(e => { console.error("Error sending admin reply", e); alert("Admin reply failed: " + e.message); });
};
