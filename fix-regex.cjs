const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newJsExtract = `
              function extractYouTubeId(urlOrId) {
                  if (!urlOrId) return '';
                  let str = urlOrId;
                  const iframeMatch = str.match(/src="([^"]+)"/);
                  if (iframeMatch) {
                      str = iframeMatch[1];
                  }
                  const regExp = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/i;
                  const match = str.match(regExp);
                  if (match && match[1].length === 11) {
                      return match[1];
                  }
                  if (str.trim().length === 11) {
                      return str.trim();
                  }
                  return str.trim();
              }
`;

html = html.replace(/function extractYouTubeId[\s\S]*?return id\.trim\(\);\s*\}/, newJsExtract.trim());

fs.writeFileSync('index.html', html);
