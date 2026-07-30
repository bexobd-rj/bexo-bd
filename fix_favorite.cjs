const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                  // Optimistic UI updates
                  if (typeof renderAllPosts === 'function' && document.getElementById('allPostsContainer')) {
                      const isPostDetail = document.getElementById('postDetailContainer');
                      if (isPostDetail) {
                          renderPostDetail(productId, imgIdx);
                      } else if (currentMenu === 'favorites' && typeof renderFavorites === 'function') {
                          renderFavorites();
                      } else {
                          renderAllPosts();
                      }
                  }`;

const newStr = `                  // Optimistic UI updates
                  const isPostDetail = document.getElementById('postDetailContainer');
                  if (isPostDetail) {
                      renderPostDetail(productId, imgIdx);
                  } else if (currentMenu === 'favorites' && typeof renderFavorites === 'function') {
                      renderFavorites();
                  } else if (typeof renderAllPosts === 'function' && document.getElementById('allPostsContainer')) {
                      renderAllPosts();
                  } else if (typeof renderSearchPage === 'function' && document.getElementById('searchResultsGrid')) {
                      renderSearchPage();
                  }`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Fixed toggleFavorite logic.");
} else {
    console.log("Could not find toggleFavorite target.");
}
