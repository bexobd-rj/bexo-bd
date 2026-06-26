import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const target1 = `function updateCheckoutPricing() {`;
const replace1 = `function updateCheckoutPricing() {
                  if (typeof syncProfileWithGlobal === 'function') syncProfileWithGlobal();`;

const target2 = `function confirmOrderFinal() {
                  if (!validateCheckoutForm()) {
                      closeConfirmationModal();
                      return;
                  }`;
const replace2 = `function confirmOrderFinal() {
                  if (!validateCheckoutForm()) {
                      closeConfirmationModal();
                      return;
                  }
                  if (typeof syncProfileWithGlobal === 'function') syncProfileWithGlobal();`;

if (html.includes(target1) && html.includes(target2)) {
    html = html.replace(target1, replace1).replace(target2, replace2);
    fs.writeFileSync('index.html', html);
    console.log("Injected syncProfileWithGlobal successfully");
} else {
    console.log("Targets not found");
}
