const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const jsExtract = `
              function extractYouTubeId(urlOrId) {
                  if (!urlOrId) return '';
                  let str = urlOrId;
                  const iframeMatch = str.match(/src="([^"]+)"/);
                  if (iframeMatch) {
                      str = iframeMatch[1];
                  }
                  const regExp = /^.*((youtu.be\\/)|(v\\/)|(\\/u\\/\\w\\/)|(embed\\/)|(watch\\?))\\??v?=?([^#&?]*).*/;
                  const match = str.match(regExp);
                  let id = (match && match[7].length == 11) ? match[7] : str;
                  // Handle cases like youtu.be/ID?si=...
                  if(id.includes('?')) {
                      id = id.split('?')[0];
                  }
                  // If the user pasted an iframe embed link, it might be in str without matching the regex perfectly if it's already just the ID.
                  // Clean up si= parameter if it's there
                  if (id.includes('&')) id = id.split('&')[0];
                  return id.trim();
              }
`;

html = html.replace(/function createPostFromAdmin\(pId\) \{/, jsExtract + '\n              function createPostFromAdmin(pId) {');

html = html.replace(/videoUrl: document\.getElementById\('apVideoUrl'\) \? document\.getElementById\('apVideoUrl'\)\.value\.trim\(\) : ''/g, "videoUrl: document.getElementById('apVideoUrl') ? extractYouTubeId(document.getElementById('apVideoUrl').value.trim()) : ''");

// Update placeholder in UI to encourage pasting any URL
html = html.replace(/placeholder="YouTube Video ID \(e\.g\. dQw4w9WgXcQ\)"/, 'placeholder="YouTube Link / Video ID / Embed Code"');

fs.writeFileSync('index.html', html);
