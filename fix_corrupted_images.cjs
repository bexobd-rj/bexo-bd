const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Inside fetchInitialData or where appPosts is populated, we can add a sanitization step.
const sanitizePostsStr = `
            appPosts = docs.docs.map(doc => {
                let data = doc.data();
                if (data.images && data.images.length > 1 && data.images[0] === 'h' && data.images[1] === 't') {
                    data.images = [data.images.join('')];
                }
                return { ...data, id: doc.id };
            });
`;

// But better to just find where `appPosts` is mapped and replace it.
// Let's find "appPosts = " in index.html and see how it is fetched.
