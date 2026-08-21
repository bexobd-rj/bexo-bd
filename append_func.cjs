const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const scriptAppend = `
// Image upload handler for subcategories
window.handleSubCategoryImageUpload = function(event, inputId) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB for thumbnails)
    if (file.size > 2 * 1024 * 1024) {
        showToast("ফাইলের আকার ২ মেগাবাইটের বেশি হওয়া যাবে না!", "error");
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // Compress image using canvas
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Apply to input
            document.getElementById(inputId).value = compressedBase64;
            
            // Apply to preview
            const previewContainer = document.getElementById(inputId + 'PreviewContainer');
            const preview = document.getElementById(inputId + 'Preview');
            if (preview && previewContainer) {
                preview.src = compressedBase64;
                previewContainer.classList.remove('hidden');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};
`;

content = content.replace(/<\/script>\s*<\/body>/, scriptAppend + '\n</script>\n</body>');
fs.writeFileSync('index.html', content);
