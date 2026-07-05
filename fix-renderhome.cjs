const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The TopSellingProductsSection (Conditional) is empty. I will replace it with the new category grids.
const regex = /<!-- Top Selling Products Section \(Conditional\) -->/;
const replacement = `<!-- Top Selling Products Section (Conditional) -->
                              <div id="homeCategoryGrids"></div>`;

html = html.replace(regex, replacement);

const regexRenderHome = /function renderHome\(\) \{([\s\S]*?)main\.innerHTML = \`([\s\S]*?)\`;\s*setTimeout\(\(\) => \{\s*renderHomeCategoryGrids\(\);\s*\}, 100\);\s*\}/; // wait, there is no setTimeout right now.

let renderHomeBody = html.match(/function renderHome\(\) \{([\s\S]*?)main\.innerHTML = \`([\s\S]*?)\`;\s*\}/);
if (renderHomeBody) {
    const newRenderHomeBody = `function renderHome() {${renderHomeBody[1]}main.innerHTML = \`${renderHomeBody[2]}\`;\nsetTimeout(() => { if (typeof renderHomeCategoryGrids === 'function') renderHomeCategoryGrids(); }, 50); }`;
    html = html.replace(renderHomeBody[0], newRenderHomeBody);
}

fs.writeFileSync('index.html', html);
console.log("Updated renderHome");
