const appCategories = [{id: 1, name: 'Test'}];
let currentMenu = 'admin';
function deleteObjectFromCategory(catId, subId) {
    if (subId && subId !== 'null' && subId !== '') {
        const cat = appCategories.find(c => c.id == catId);
        cat.subCategories = cat.subCategories.filter(s => s.id != subId);
    } else {
        appCategories = appCategories.filter(c => c.id != catId);
        // if (window.db) ...
    }
}
deleteObjectFromCategory('1', '');
console.log(appCategories);
