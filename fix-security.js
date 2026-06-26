import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetMakePaid = `              window.markManagerOrderAsPaid = function(recordId) {
                  try {
                      const record = appManagerRecords.find(r => String(r.id) === String(recordId));`;

const replaceMakePaid = `              window.markManagerOrderAsPaid = function(recordId) {
                  try {
                      if (!userProfile || !userProfile.isAdmin) {
                          showToast("Unauthorized request!", "error");
                          return;
                      }
                      const record = appManagerRecords.find(r => String(r.id) === String(recordId));`;

html = html.replace(targetMakePaid, replaceMakePaid);

const targetConfirm = `              window.confirmMarkAsPaidSubmission = function(recordId) {
                  try {
                      const txnVal = document.getElementById('mgrPayoutTxnId')?.value.trim();`;

const replaceConfirm = `              window.confirmMarkAsPaidSubmission = function(recordId) {
                  try {
                      if (!userProfile || !userProfile.isAdmin) {
                          showToast("Unauthorized request!", "error");
                          return;
                      }
                      const txnVal = document.getElementById('mgrPayoutTxnId')?.value.trim();`;
                      
html = html.replace(targetConfirm, replaceConfirm);
fs.writeFileSync('index.html', html);
console.log("Added admin checks to markManagerOrderAsPaid");
