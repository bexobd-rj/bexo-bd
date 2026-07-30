const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/document\.getElementById\('fpBtnClose'\)/g, "modal.querySelector('#fpBtnClose')");
html = html.replace(/document\.getElementById\('fpBtnNext'\)/g, "modal.querySelector('#fpBtnNext')");
html = html.replace(/document\.getElementById\('fpBtnVerify'\)/g, "modal.querySelector('#fpBtnVerify')");
html = html.replace(/document\.getElementById\('fpBtnSave'\)/g, "modal.querySelector('#fpBtnSave')");

// We also need to fix other getElementById calls inside the event listeners that look for elements inside the modal.
html = html.replace(/document\.getElementById\('fpIdentifier'\)/g, "modal.querySelector('#fpIdentifier')");
html = html.replace(/document\.getElementById\('fpCode'\)/g, "modal.querySelector('#fpCode')");
html = html.replace(/document\.getElementById\('fpNewPass'\)/g, "modal.querySelector('#fpNewPass')");
html = html.replace(/document\.getElementById\('fpConfirmPass'\)/g, "modal.querySelector('#fpConfirmPass')");

fs.writeFileSync('index.html', html);
