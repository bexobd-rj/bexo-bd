const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Fix delete category not deleting from firebase
content = content.replace(
`                      appCategories = appCategories.filter(c => c.id != catId);
                  }
                  saveCategories();`,
`                      appCategories = appCategories.filter(c => c.id != catId);
                      if (window.db) {
                          window.db.collection('bexo_categories').doc(String(catId)).delete().catch(err => console.error("Error deleting category:", err));
                      }
                  }
                  saveCategories();`
);

// Fix grid size in admin category list
content = content.replace(
`                              <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 font-sans">
                                  \${subsHtml}
                                  <!-- Add Sub Button Tile -->
                                  <div onclick="openAddSubCategoryModal('\${cat.id}')" class="bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-orange-50 hover:border-orange-200 group transition-all h-[130px] min-h-[130px]">`,
`                              <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 font-sans">
                                  \${subsHtml}
                                  <!-- Add Sub Button Tile -->
                                  <div onclick="openAddSubCategoryModal('\${cat.id}')" class="bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-orange-50 hover:border-orange-200 group transition-all h-[110px] min-h-[110px]">`
);

// Fix image container size in the tile
content = content.replace(
`                                      <div class="w-20 h-20 flex items-center justify-center p-1.5">
                                          <img src="\${image}" alt="\${sub.name}" class="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-500">
                                      </div>`,
`                                      <div class="w-16 h-16 flex items-center justify-center p-1">
                                          <img src="\${image}" alt="\${sub.name}" class="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-500">
                                      </div>`
);

fs.writeFileSync('index.html', content);
