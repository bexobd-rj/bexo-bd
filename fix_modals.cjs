const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const functionsToIntercept = [
    'openCategoryManagementModal',
    'openAddSubCategoryModal',
    'openCategoryQuickEdit',
    'openAddBalanceModal',
    'openAdminCreateUserModal',
    'openOrderModal',
    'showServiceModal',
    'showSupportModal',
    'showOrderConfirmationModal',
    'showDualVerificationModal',
    'showForgotPasswordModal'
];

let scriptToAdd = `
    // Intercept Modal Open Functions
    const modalFunctions = ${JSON.stringify(functionsToIntercept)};
    modalFunctions.forEach(fnName => {
        if (typeof window[fnName] === 'function') {
            const originalFn = window[fnName];
            window[fnName] = function(...args) {
                originalFn.apply(this, args);
                if (!window.history.state || window.history.state.type !== 'modal') {
                    window.history.pushState({ type: 'modal' }, '');
                }
            };
        }
    });
`;

// Insert the script into the BACK BUTTON FIX section
if (html.includes('// Intercept showAuth')) {
    html = html.replace('// Intercept showAuth', scriptToAdd + '\n    // Intercept showAuth');
    fs.writeFileSync('index.html', html);
    console.log("Modals intercepted successfully.");
} else {
    console.log("Could not find insertion point.");
}
