const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function extractYouTubeId\([\s\S]*?return str\.trim\(\);\s*\}/;

const replacement = `function extractYouTubeId(urlOrId) {
                  if (!urlOrId) return '';
                  let str = urlOrId;
                  const iframeMatch = str.match(/src="([^"]+)"/);
                  if (iframeMatch) {
                      str = iframeMatch[1];
                  }
                  const regExp = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?|shorts)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/i;
                  const match = str.match(regExp);
                  if (match && match[1].length === 11) {
                      return match[1];
                  }
                  if (str.trim().length === 11) {
                      return str.trim();
                  }
                  return str.trim();
              }

              window.handleVideoPreview = function(val) {
                  const container = document.getElementById('videoPreviewContainer');
                  const iframe = document.getElementById('videoPreviewIframe');
                  const loading = document.getElementById('videoLoadingState');
                  
                  if (!val || val.trim() === '') {
                      container.classList.add('hidden');
                      iframe.src = '';
                      return;
                  }
                  
                  const videoId = extractYouTubeId(val);
                  
                  if (videoId && videoId.length === 11) {
                      container.classList.remove('hidden');
                      loading.classList.remove('hidden');
                      
                      // Simulate short loading to show processing
                      setTimeout(() => {
                          iframe.src = 'https://www.youtube.com/embed/' + videoId;
                          loading.classList.add('hidden');
                      }, 400);
                  } else {
                      container.classList.add('hidden');
                      iframe.src = '';
                  }
              };`;

html = html.replace(regex, replacement);

fs.writeFileSync('index.html', html);
