const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = "                  <div onclick=\"selectLandingCategory('${cat}')\" class=\"bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent hover:shadow-md transition-all\">\n" +
"                    <div class=\"absolute top-1 right-1.5 text-[10px] font-bold text-[#6a1b9a] z-10\">${typeof toBengaliNumber === 'function' ? toBengaliNumber(count) : count}</div>\n" +
"                    <div class=\"w-full aspect-square flex items-center justify-center p-2 mb-1\">\n" +
"                      <img src=\"${imageUrl}\" alt=\"${cat}\" referrerpolicy=\"no-referrer\" loading=\"lazy\" class=\"w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500\" onerror=\"this.src='https://via.placeholder.com/150'\">\n" +
"                    </div>\n" +
"                    <div class=\"text-center w-full pb-1\">\n" +
"                      <p class=\"text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate\">${cat}</p>\n" +
"                    </div>\n" +
"                  </div>";

const replacementStr = "                  <div onclick=\"selectLandingCategory('${cat}')\" class=\"bg-white rounded-md flex flex-col items-center p-1 sm:p-2 shadow-sm cursor-pointer relative group border border-slate-100 hover:border-[#6a1b9a]/30 transition-all\">\n" +
"                    <div class=\"absolute top-1 right-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 z-10\">${typeof toBengaliNumber === 'function' ? toBengaliNumber(count) : count}</div>\n" +
"                    <div class=\"w-full aspect-square flex items-center justify-center p-1 sm:p-2 mb-1\">\n" +
"                      <img src=\"${imageUrl}\" alt=\"${cat}\" referrerpolicy=\"no-referrer\" loading=\"lazy\" class=\"w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300\" onerror=\"this.src='https://via.placeholder.com/150'\">\n" +
"                    </div>\n" +
"                    <div class=\"text-center w-full pb-1 px-0.5\">\n" +
"                      <p class=\"text-[10px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate\">${cat}</p>\n" +
"                    </div>\n" +
"                  </div>";

const regexStr = targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
if(html.match(new RegExp(regexStr))) {
    html = html.replace(new RegExp(regexStr), replacementStr);
    fs.writeFileSync('index.html', html);
    console.log("Replaced!");
} else {
    console.log("Not found!");
}
