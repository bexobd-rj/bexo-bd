const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('window.saveApiSettings = function() {');
const end = html.indexOf('function prepareApiRequestOptions', start);

if (start !== -1 && end !== -1) {
    const replacement = `window.saveApiSettings = async function() {
                  const baseUrl = document.getElementById('apiBaseUrl').value.trim();
                  const authType = document.getElementById('apiAuthType').value;
                  const apiKey = document.getElementById('apiKey').value.trim();
                  const secretKey = document.getElementById('apiSecretKey').value.trim();
                  
                  if (!appSettings.apiIntegration) appSettings.apiIntegration = {};
                  appSettings.apiIntegration.baseUrl = baseUrl;
                  appSettings.apiIntegration.authType = authType;
                  appSettings.apiIntegration.apiKey = apiKey;
                  appSettings.apiIntegration.secretKey = secretKey;
                  
                  saveAppSettings();
                  
                  try {
                      await fetch('/api/save-settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(appSettings.apiIntegration)
                      });
                  } catch (e) {
                      console.error("Backend save settings error", e);
                  }
                  
                  showToast("API Settings Saved!", "success");
              };
              
              `;
    html = html.substring(0, start) + replacement + html.substring(end);
    fs.writeFileSync('index.html', html);
    console.log("Fixed saveApiSettings");
}
