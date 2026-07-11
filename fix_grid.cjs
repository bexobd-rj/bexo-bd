const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = "                              <div onclick=\"renderProductList('${cat.name}', '${sub.name}')\" class=\"bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent\">\n" +
"                                  <div class=\"absolute top-1 right-1.5 text-[10px] font-bold text-[#6a1b9a] z-10\">${toBengaliNumber(count)}</div>\n" +
"                                  <div class=\"w-full aspect-square flex items-center justify-center p-2 mb-1\">\n" +
"                                      <img src=\"${image}\" alt=\"${sub.name}\" class=\"w-full h-full object-contain mix-blend-multiply\">\n" +
"                                  </div>\n" +
"                                  <div class=\"text-center w-full pb-1\">\n" +
"                                      <p class=\"text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate\">${sub.name}</p>\n" +
"                                  </div>\n" +
"                              </div>\n" +
"                          `;\n" +
"                      }).join('');\n" +
"\n" +
"                      return `\n" +
"                          <div class=\"space-y-4 animate-fade-in mt-6\">\n" +
"                              <div class=\"py-2 px-4 text-center\">\n" +
"                                  <h3 class=\"text-[16px] sm:text-[18px] font-bold text-[#d81b60] tracking-tight\">${cat.name} (${toBengaliNumber(totalInCat)})</h3>\n" +
"                              </div>\n" +
"                              <div class=\"grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3\">\n" +
"                                  ${subsHtml}\n" +
"                              </div>\n" +
"                          </div>\n" +
"                      `;";

const replacementStr = "                              <div onclick=\"renderProductList('${cat.name}', '${sub.name}')\" class=\"bg-white rounded flex flex-col items-center p-1 sm:p-2 shadow-sm cursor-pointer relative group border border-slate-100 hover:border-[#6a1b9a]/30 transition-all\">\n" +
"                                  <div class=\"absolute top-1 right-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 z-10\">${toBengaliNumber(count)}</div>\n" +
"                                  <div class=\"w-full aspect-square flex items-center justify-center p-1 sm:p-2 mb-1\">\n" +
"                                      <img src=\"${image}\" alt=\"${sub.name}\" class=\"w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300\">\n" +
"                                  </div>\n" +
"                                  <div class=\"text-center w-full pb-1 px-0.5\">\n" +
"                                      <p class=\"text-[10px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate\">${sub.name}</p>\n" +
"                                  </div>\n" +
"                              </div>\n" +
"                          `;\n" +
"                      }).join('');\n" +
"\n" +
"                      return `\n" +
"                          <div class=\"animate-fade-in mt-4 mb-8\">\n" +
"                              <div class=\"py-2.5 px-4 mb-3 text-center bg-[#fff8fa] border-y border-[#f8e0e6] shadow-[0_1px_2px_rgba(0,0,0,0.02)]\">\n" +
"                                  <h3 class=\"text-[15px] sm:text-[17px] font-bold text-[#d81b60] tracking-tight\">${cat.name} (${toBengaliNumber(totalInCat)})</h3>\n" +
"                              </div>\n" +
"                              <div class=\"grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-3 px-1.5 sm:px-0\">\n" +
"                                  ${subsHtml}\n" +
"                              </div>\n" +
"                          </div>\n" +
"                      `;";

const regexStr = targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
if(html.match(new RegExp(regexStr))) {
    html = html.replace(new RegExp(regexStr), replacementStr);
    fs.writeFileSync('index.html', html);
    console.log("Replaced!");
} else {
    console.log("Not found!");
}
