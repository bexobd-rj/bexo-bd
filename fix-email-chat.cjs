const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sendLiveChatOld = `                    isGuest: window.currentChatSession.isGuest,
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
                    userName: window.currentChatSession.userName || data.userName, // Update in case changed
                    ipAddress: window.currentChatSession.ipAddress || data.ipAddress,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : data.possibleRegisteredUser,
                    profilePic: window.currentChatSession.profilePic || data.profilePic,
                    messages: messages
                });`;

const sendLiveChatNew = `                    isGuest: window.currentChatSession.isGuest,
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
                    userName: window.currentChatSession.userName || data.userName, // Update in case changed
                    email: window.currentChatSession.email || data.email,
                    ipAddress: window.currentChatSession.ipAddress || data.ipAddress,
                    possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : data.possibleRegisteredUser,
                    profilePic: window.currentChatSession.profilePic || data.profilePic,
                    messages: messages
                });`;

html = html.replace(sendLiveChatOld, sendLiveChatNew);
fs.writeFileSync('index.html', html, 'utf8');
console.log("Done fixing email");
