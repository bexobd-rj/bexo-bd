const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetRegex = /function renderSupportTicket\(\) \{[\s\S]*?function updateUserTicketStatus/m;

const replacement = `function renderSupportTicket() {
    const main = document.getElementById('mainContent');
    
    // Clean up or initialize the state
    if (window.activeUserSupportTicketId === undefined) {
        window.activeUserSupportTicketId = null; // null means welcome screen
    }

    // Default chat info
    let profileId = window.userProfile && window.userProfile.profileId;
    let lastMsgText = 'কোনো মেসেজ নেই';
    let lastMsgTime = '';
    let hasUnread = false;

    // Build the Right Panel HTML First
    let rightPaneHtml = '';
    
    if (window.activeUserSupportTicketId === 'live_chat') {
        rightPaneHtml = \`
            <div class="h-full flex flex-col bg-white">
                <!-- Chat Window Header -->
                <div class="p-4 md:p-6 border-b border-slate-100 bg-[#10b981] flex items-center justify-between flex-shrink-0 z-10 shadow-sm text-white">
                    <div class="flex items-center gap-3">
                        <button onclick="window.activeUserSupportTicketId = null; renderSupportTicket()" class="lg:hidden p-2 text-white/80 hover:text-white transition-all mr-1" title="তালিকায় ফিরুন">
                            <i class="fas fa-chevron-left text-lg"></i>
                        </button>
                        <div class="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-xs border border-white/30">
                            <i class="fas fa-headset text-lg"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-black text-white text-base">লাইভ সাপোর্ট</h3>
                                <span class="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-white/30">অনলাইন</span>
                            </div>
                            <p class="text-xs text-white/80 font-bold font-sans">আমরা সর্বদা আপনার সেবায় নিয়োজিত</p>
                        </div>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div id="fullScreenLiveChatMessagesArea" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 relative z-0 custom-scrollbar pb-8">
                    <!-- Messages will be injected here by subscription -->
                    <div class="flex justify-center my-4">
                        <span class="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full shadow-sm">লোড হচ্ছে...</span>
                    </div>
                </div>

                <!-- Chat Input Area -->
                <div class="p-4 bg-white border-t border-slate-100 z-10">
                    <div class="max-w-4xl mx-auto">
                        <div class="flex items-end gap-3 bg-slate-50 border border-slate-200 p-2 rounded-3xl focus-within:border-[#10b981] focus-within:bg-white transition-all shadow-sm">
                            <textarea id="fullScreenLiveChatMessageInput" placeholder="আপনার সমস্যা বা জিজ্ঞাসা লিখুন..." rows="1" class="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm text-slate-800 font-bold placeholder-slate-400 font-sans custom-scrollbar" oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; if(this.value.trim()==='') this.style.height='auto';" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendFullScreenLiveChatMessage(); }"></textarea>
                            <button onclick="sendFullScreenLiveChatMessage()" class="w-10 h-10 shrink-0 bg-[#10b981] text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-emerald-600 transition-all shadow-md">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="text-center mt-3 mb-1">
                            <span class="text-[9px] font-black text-slate-300 tracking-widest uppercase">পাওয়ার্ড বাই BEXOBD সাপোর্ট সিস্টেম</span>
                        </div>
                    </div>
                </div>
            </div>
        \`;
    } else {
        rightPaneHtml = \`
            <div class="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/50">
                <div class="w-20 h-20 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm border border-orange-100/50">
                    <i class="fas fa-headset"></i>
                </div>
                <h3 class="text-xl font-black text-slate-800 font-sans">আমাদের সাপোর্ট টিম সর্বদা সচল</h3>
                <p class="text-sm font-bold text-slate-500 mt-2 max-w-sm mx-auto font-sans">যেকোনো সমস্যার জন্য বাম পাশের তালিকা থেকে চ্যাট সিলেক্ট করুন অথবা নতুন চ্যাট সেশন শুরু করতে নিচের বাটনে ক্লিক করুন।</p>
                <button onclick="window.activeUserSupportTicketId = 'live_chat'; renderSupportTicket();" class="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
                    <i class="fas fa-plus"></i> নতুন চ্যাট শুরু করুন
                </button>
            </div>
        \`;
    }

    main.innerHTML = \`
        <div class="p-4 md:p-8 animate-fade-in h-[calc(100vh-64px)] lg:h-screen flex flex-col max-w-[1400px] mx-auto">
            <!-- Header section -->
            <div class="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                <div>
                    <h2 class="text-xl md:text-2xl font-black text-slate-800 font-sans">সহায়তা ও লাইভ চ্যাট</h2>
                    <p class="text-[10px] md:text-xs font-bold text-slate-400 mt-1 font-sans tracking-wide">১০০% সমাধান ভিত্তিক সার্বক্ষণিক কাস্টমার সাপোর্ট</p>
                </div>
                <button onclick="switchMenu('dashboard')" class="hidden md:flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs group transition-all bg-white px-4 py-2 border border-slate-200 rounded-xl hover:shadow-sm">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> ড্যাশবোর্ডে ফিরুন
                </button>
            </div>

            <!-- Two column layout -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0 bg-transparent">
                
                <!-- Left Column: Tickets list -->
                <div class="\${window.activeUserSupportTicketId ? 'hidden lg:flex' : 'flex'} lg:col-span-1 flex-col space-y-4 min-h-0">
                    
                    <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-md flex-1 flex flex-col overflow-hidden">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-50 shrink-0">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">আপনার পূর্ববর্তী চ্যাট সমূহ</span>
                            <button onclick="window.activeUserSupportTicketId = 'live_chat'; renderSupportTicket();" class="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-[10px] font-black transition-all">
                                + নতুন শুরু
                            </button>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto custom-scrollbar pt-3 space-y-2 relative" id="leftSideChatListContainer">
                            <!-- Injected by subscription -->
                            <div class="text-center py-6">
                                <i class="fas fa-comment-slash text-2xl text-slate-200 mb-2"></i>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">লোড হচ্ছে...</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 shrink-0">
                        <a href="#" target="_blank" class="bg-white p-3 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all group">
                            <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <i class="fab fa-facebook-f"></i>
                            </div>
                            <span class="text-[10px] font-black text-slate-600 font-sans">ফেসবুক পেজ</span>
                        </a>
                        <a href="#" target="_blank" class="bg-white p-3 rounded-2xl border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all group">
                            <div class="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                <i class="fab fa-telegram-plane text-lg"></i>
                            </div>
                            <span class="text-[10px] font-black text-slate-600 font-sans">টেলিগ্রাম</span>
                        </a>
                    </div>
                </div>

                <!-- Right Column: Ticket Content -->
                <div class="\${!window.activeUserSupportTicketId ? 'hidden lg:block' : 'block'} lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-md overflow-hidden min-h-0 flex flex-col h-full lg:h-auto">
                    \${rightPaneHtml}
                </div>
            </div>
        </div>
    \`;

    // Initialize logic if they open live chat
    if (window.activeUserSupportTicketId === 'live_chat' || !window.activeUserSupportTicketId) {
        subscribeFullScreenLiveChat();
    }
}

window.subscribeFullScreenLiveChat = function() {
    let uProfile = null;
    try {
        const userProfStr = localStorage.getItem('bexo_profile');
        if (userProfStr) uProfile = JSON.parse(userProfStr);
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

    let guestId = localStorage.getItem('bexo_guest_id');
    if (!guestId) {
        guestId = 'Guest-' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('bexo_guest_id', guestId);
    }

    if (!profileId) {
        profileId = guestId;
        isGuest = true;
        if (!possibleRegisteredUser) userName = guestId;
    }

    window.currentChatSession = { profileId, userName, phone, email, isGuest, ipAddress, possibleRegisteredUser, profilePic };
    
    // Subscribe to messages
    if (!window.db) return;
    const collectionName = isGuest ? 'guest_chats' : 'live_chats';
    
    if (window.fullScreenLiveChatUnsubscribe) {
        window.fullScreenLiveChatUnsubscribe();
    }
    
    window.fullScreenLiveChatUnsubscribe = window.db.collection(collectionName).doc(profileId).onSnapshot(doc => {
        let lastMsgText = 'কোনো মেসেজ নেই';
        let lastMsgTime = '';
        let unreadUser = 0;

        if (doc.exists) {
            const data = doc.data();
            const msgs = data.messages || [];
            unreadUser = data.unreadUser || 0;
            
            if (msgs.length > 0) {
                const l = msgs[msgs.length - 1];
                lastMsgText = l.text;
                const d = new Date(l.timestamp);
                lastMsgTime = d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
            }

            // Render right side chat messages
            const area = document.getElementById('fullScreenLiveChatMessagesArea');
            if (area) {
                if (msgs.length === 0) {
                    area.innerHTML = '<div class="flex justify-center mt-10"><span class="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold shadow-sm">কোনো মেসেজ নেই। নতুন মেসেজ পাঠান।</span></div>';
                } else {
                    let h = '';
                    let lastDateStr = '';
                    msgs.forEach(m => {
                        const d = new Date(m.timestamp);
                        const dateStr = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
                        if (dateStr !== lastDateStr) {
                            h += \`<div class="flex justify-center my-3"><span class="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[9px] font-bold rounded-full shadow-sm">\${dateStr}</span></div>\`;
                            lastDateStr = dateStr;
                        }
                        
                        const timeStr = d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
                        if (m.sender === 'user') {
                            h += \`
                                <div class="flex items-end justify-end gap-2 max-w-[85%] ml-auto mb-2 animate-fade-in">
                                    <div class="space-y-0.5">
                                        <div class="bg-[#10b981] text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm text-sm font-bold leading-relaxed whitespace-pre-line">\${m.text}</div>
                                        <p class="text-[9px] text-right text-slate-400 font-bold">\${timeStr}</p>
                                    </div>
                                </div>
                            \`;
                        } else {
                            h += \`
                                <div class="flex items-end gap-2 max-w-[85%] mb-2 animate-fade-in">
                                    <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-4 border border-slate-300">
                                        <i class="fas fa-headset text-[10px] text-slate-500"></i>
                                    </div>
                                    <div class="space-y-0.5">
                                        <div class="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm text-sm font-bold leading-relaxed whitespace-pre-line">\${m.text}</div>
                                        <p class="text-[9px] text-slate-400 font-bold ml-1">\${timeStr}</p>
                                    </div>
                                </div>
                            \`;
                        }
                    });
                    area.innerHTML = h;
                    area.scrollTop = area.scrollHeight;
                }
            }

            // Auto-mark as read if user is looking at the chat
            if (unreadUser > 0 && window.activeUserSupportTicketId === 'live_chat') {
                doc.ref.update({ unreadUser: 0 });
                unreadUser = 0;
            }
        } else {
            const area = document.getElementById('fullScreenLiveChatMessagesArea');
            if (area) {
                area.innerHTML = '<div class="flex justify-center mt-10"><span class="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold shadow-sm">কোনো মেসেজ নেই। নতুন মেসেজ পাঠান।</span></div>';
            }
        }

        // Render left side chat list item
        const listContainer = document.getElementById('leftSideChatListContainer');
        if (listContainer) {
            const isActive = window.activeUserSupportTicketId === 'live_chat';
            listContainer.innerHTML = \`
                <div onclick="window.activeUserSupportTicketId = 'live_chat'; renderSupportTicket();" class="p-4 rounded-2xl cursor-pointer transition-all duration-200 border flex items-start gap-3 \${isActive ? 'bg-[#10b981]/10 border-[#10b981]/30 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-100'}">
                    <div class="relative flex-shrink-0">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-200">
                            <i class="fas fa-headset"></i>
                        </div>
                        \${unreadUser > 0 && !isActive ? \`<span class="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>\` : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <p class="text-sm font-black text-slate-800 truncate">লাইভ সাপোর্ট</p>
                        </div>
                        <p class="text-xs font-bold text-slate-500 truncate mt-0.5">\${lastMsgText}</p>
                        <div class="flex items-center justify-between mt-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600">Active</span>
                            \${lastMsgTime ? \`<span class="text-[9px] text-slate-400 font-bold">\${lastMsgTime}</span>\` : ''}
                        </div>
                    </div>
                </div>
            \`;
        }
    });
};

window.sendFullScreenLiveChatMessage = function() {
    const input = document.getElementById('fullScreenLiveChatMessageInput');
    const text = input.value.trim();
    if (!text || !window.db || !window.currentChatSession) return;
    
    input.value = '';
    input.style.height = 'auto'; // reset textarea height
    
    const userId = String(window.currentChatSession.profileId);
    const collectionName = window.currentChatSession.isGuest ? 'guest_chats' : 'live_chats';
    const docRef = window.db.collection(collectionName).doc(userId);
    
    const newMsg = {
        text: text,
        sender: 'user',
        timestamp: Date.now()
    };
    
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
                    userName: window.currentChatSession.userName || data.userName || null,
                    email: window.currentChatSession.email || data.email || null,
                    ipAddress: window.currentChatSession.ipAddress || data.ipAddress || null,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : (data.possibleRegisteredUser || null),
                    profilePic: window.currentChatSession.profilePic || data.profilePic || null,
                    messages: messages
                });
            }
        });
    }).catch(e => { console.error("Error sending", e); alert("Failed to send: " + e.message); });
};

function updateUserTicketStatus`;

html = html.replace(targetRegex, replacement);
fs.writeFileSync('index.html', html, 'utf8');
console.log("Done rewriting Support Ticket -> Live Chat");
