const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Helper to replace word conditionally
function addResponsiveClass(str, oldClass, newClass) {
    // Regex matches the oldClass as a whole word inside a class attribute
    // but only if it's not already preceded by sm:, md:, lg:, etc.
    const regex = new RegExp(`(class="[^"]*)\\b(?<!sm:|md:|lg:|xl:|2xl:)${oldClass}\\b([^"]*")`, 'g');
    return str.replace(regex, (match, p1, p2) => {
        // Double check it doesn't already have the new class to avoid duplicates
        if (p1.includes(newClass) || p2.includes(newClass)) {
             return match;
        }
        return `${p1}${newClass}${p2}`;
    });
}

// Padding and Margin adjustments
html = addResponsiveClass(html, 'p-8', 'p-4 sm:p-8');
html = addResponsiveClass(html, 'px-8', 'px-4 sm:px-8');
html = addResponsiveClass(html, 'py-8', 'py-4 sm:py-8');
html = addResponsiveClass(html, 'p-10', 'p-5 sm:p-10');
html = addResponsiveClass(html, 'px-10', 'px-5 sm:px-10');
html = addResponsiveClass(html, 'py-10', 'py-5 sm:py-10');
html = addResponsiveClass(html, 'p-12', 'p-5 sm:p-12');
html = addResponsiveClass(html, 'px-12', 'px-5 sm:px-12');
html = addResponsiveClass(html, 'p-16', 'p-6 sm:p-16');
html = addResponsiveClass(html, 'px-16', 'px-6 sm:px-16');

// Grids
// Replace grid-cols-[3-6] with smaller grids on mobile if they don't have a prefix
html = addResponsiveClass(html, 'grid-cols-3', 'grid-cols-1 sm:grid-cols-3');
html = addResponsiveClass(html, 'grid-cols-4', 'grid-cols-2 sm:grid-cols-4');
html = addResponsiveClass(html, 'grid-cols-5', 'grid-cols-2 sm:grid-cols-5');
html = addResponsiveClass(html, 'grid-cols-6', 'grid-cols-2 sm:grid-cols-6');

// Fixed widths that break mobile
html = addResponsiveClass(html, 'w-96', 'w-full max-w-sm sm:w-96');
html = addResponsiveClass(html, 'w-80', 'w-full max-w-xs sm:w-80');
html = addResponsiveClass(html, 'w-72', 'w-full max-w-[18rem] sm:w-72');
html = addResponsiveClass(html, 'w-64', 'w-full max-w-[16rem] sm:w-64');

// Text sizing for h1, h2, etc might be too big (e.g. text-5xl)
html = addResponsiveClass(html, 'text-5xl', 'text-3xl sm:text-5xl');
html = addResponsiveClass(html, 'text-6xl', 'text-4xl sm:text-6xl');
html = addResponsiveClass(html, 'text-4xl', 'text-2xl sm:text-4xl');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html to be more responsive!');
