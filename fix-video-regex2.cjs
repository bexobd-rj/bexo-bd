const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The replacement I did earlier using fix-video.cjs did not work, let me re-run that regex replacement just in case.
html = html.replace(/videoUrl: document\.getElementById\('apVideoUrl'\) \? document\.getElementById\('apVideoUrl'\)\.value\.trim\(\) : ''/g, "videoUrl: document.getElementById('apVideoUrl') ? extractYouTubeId(document.getElementById('apVideoUrl').value.trim()) : ''");

fs.writeFileSync('index.html', html);
