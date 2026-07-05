const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : data.possibleRegisteredUser,`;
const replaceStr = `possibleRegisteredUser: window.currentChatSession.possibleRegisteredUser ? JSON.stringify(window.currentChatSession.possibleRegisteredUser) : (data.possibleRegisteredUser || null),`;

html = html.replace(targetStr, replaceStr);

const targetStr2 = `ipAddress: window.currentChatSession.ipAddress || data.ipAddress,`;
const replaceStr2 = `ipAddress: window.currentChatSession.ipAddress || data.ipAddress || null,`;

html = html.replace(targetStr2, replaceStr2);

const targetStr3 = `email: window.currentChatSession.email || data.email,`;
const replaceStr3 = `email: window.currentChatSession.email || data.email || null,`;

html = html.replace(targetStr3, replaceStr3);

const targetStr4 = `profilePic: window.currentChatSession.profilePic || data.profilePic,`;
const replaceStr4 = `profilePic: window.currentChatSession.profilePic || data.profilePic || null,`;

html = html.replace(targetStr4, replaceStr4);

const targetStr5 = `userName: window.currentChatSession.userName || data.userName, // Update in case changed`;
const replaceStr5 = `userName: window.currentChatSession.userName || data.userName || null, // Update in case changed`;

html = html.replace(targetStr5, replaceStr5);

fs.writeFileSync('index.html', html, 'utf8');
