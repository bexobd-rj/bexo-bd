const extractYouTubeId = function(urlOrId) {
    if (!urlOrId) return '';
    let str = urlOrId;
    const iframeMatch = str.match(/src="([^"]+)"/);
    if (iframeMatch) {
        str = iframeMatch[1];
    }
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = str.match(regExp);
    if (match && match[1].length === 11) {
        return match[1];
    }
    if (str.trim().length === 11) {
        return str.trim();
    }
    return str.trim();
}
console.log(extractYouTubeId('https://www.youtube.com/watch?v=vgVjJN8Tlig'));
console.log(extractYouTubeId('https://youtu.be/vgVjJN8Tlig'));
console.log(extractYouTubeId('https://www.youtube.com/shorts/vgVjJN8Tlig'));
console.log(extractYouTubeId('https://www.youtube.com/embed/vgVjJN8Tlig'));
