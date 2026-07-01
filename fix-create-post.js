import fs from 'fs';

function updateFile(file) {
    const content = fs.readFileSync(file, 'utf8');

    const targetRegex = /                  const postData = \{\s+id: pId \|\| Date\.now\(\),\s+author: 'বেক্সো অফিসিয়াল',[\s\S]*?                  \/\/ Refresh view/m;

    const match = content.match(targetRegex);
    if (!match) {
        console.log("Target not found in " + file);
        return;
    }

    const replacement = `                  const isBulkUpload = !pId && document.getElementById('apBulkUpload') && document.getElementById('apBulkUpload').checked;
                  
                  let newPosts = [];
                  
                  if (isBulkUpload && finalImages.length > 1) {
                      newPosts = finalImages.map((img, i) => {
                          return {
                              id: Date.now() + i,
                              author: 'বেক্সো অফিসিয়াল',
                              time: 'এইমাত্র',
                              category: cat,
                              subCategory: sub,
                              price: price,
                              costPrice: costPrice,
                              maxSellingPrice: suggestedMaxPrice,
                              stockCount: stockCount,
                              unitType: unitType,
                              variants: variants,
                              availableSizes: variants.find(v => v.name.toLowerCase() === 'size')?.options || [],
                              discountAmount: discountAmount,
                              remarks: remarks,
                              isVerified: true,
                              rating: 5,
                              title: title,
                              desc: "",
                              details: details,
                              images: [img],
                              imageCount: 1,
                              videoUrl: document.getElementById('apVideoUrl') ? document.getElementById('apVideoUrl').value.trim() : '',
                              isStockOut: isStockOut,
                              sku: sku + (i > 0 ? '-' + i : ''),
                              isPublished: autoPost
                          };
                      });
                  } else {
                      newPosts = [{
                          id: pId || Date.now(),
                          author: 'বেক্সো অফিসিয়াল',
                          time: pId ? (appPosts.find(p => String(p.id) === String(pId))?.time || 'এইমাত্র') : 'এইমাত্র',
                          category: cat,
                          subCategory: sub,
                          price: price,
                          costPrice: costPrice,
                          maxSellingPrice: suggestedMaxPrice,
                          stockCount: stockCount,
                          unitType: unitType,
                          variants: variants,
                          availableSizes: variants.find(v => v.name.toLowerCase() === 'size')?.options || [],
                          discountAmount: discountAmount,
                          remarks: remarks,
                          isVerified: true,
                          rating: 5,
                          title: title,
                          desc: "",
                          details: details,
                          images: finalImages,
                          imageCount: finalImages.length,
                          videoUrl: document.getElementById('apVideoUrl') ? document.getElementById('apVideoUrl').value.trim() : '',
                          isStockOut: isStockOut,
                          sku: sku,
                          isPublished: autoPost
                      }];
                  }

                  if (pId) {
                      const idx = appPosts.findIndex(p => String(p.id) === String(pId));
                      if (idx > -1) appPosts[idx] = newPosts[0];
                  } else {
                      appPosts.unshift(...newPosts);
                  }
                  savePosts();

                  if (window.db) {
                      newPosts.forEach(postData => {
                          window.db.collection('bexo_posts').doc(String(postData.id)).set(sanitizeForFirestore(postData))
                              .catch(err => console.error("Firebase save post error:", err));
                      });
                  }

                  // Success feedback
                  if (newPosts.length > 1) {
                      showToast(newPosts.length + " টি পণ্য সফলভাবে সংরক্ষিত হয়েছে!");
                  } else {
                      showToast(pId ? "পণ্যটি সফলভাবে আপডেটেড হয়েছে!" : "পণ্যটি সফলভাবে সংরক্ষিত হয়েছে!");
                  }

                  // Refresh view`;

    const newContent = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, newContent);
    console.log("Updated " + file);
}

updateFile('script.js');
updateFile('index.html');
