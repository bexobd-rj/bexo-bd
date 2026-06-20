import fs from 'fs';
import vm from 'vm';

try {
  let fileContent = fs.readFileSync('index.html', 'utf8');
  const searchStr = '<!-- Add Sub Button Tile -->';
  const targetIndex = fileContent.indexOf(searchStr);
  if (targetIndex !== -1 && fileContent.includes('confirmOrderSubmit()') && fileContent.includes('প্রোডাক্ট ও ক্যাটাগরি</h2>')) {
    console.log("Found corrupted block. Patching index.html...");
    const endAnchor = `<p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1 font-sans">ক্যাটাগরি ভিত্তিক পণ্য ম্যানেজমেন্ট</p>`;
    const endIndex = fileContent.indexOf(endAnchor, targetIndex);
    if (endIndex !== -1) {
      const partBefore = fileContent.substring(0, targetIndex);
      const partAfter = fileContent.substring(endIndex);
      const middleRepl = `<!-- Add Sub Button Tile -->
                                  <div onclick="openAddSubCategoryModal('\${cat.id}')" class="bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-orange-50 hover:border-orange-200 group transition-all h-[130px] min-h-[130px]">
                                      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
                                          <i class="fas fa-plus text-base"></i>
                                      </div>
                                      <span class="text-[10px] font-bold text-slate-400 group-hover:text-orange-600 transition-all mt-2">নতুন সাব-ক্যাটাগরি</span>
                                  </div>
                              </div>
                          </div>
                      \`;
                  }).join('');

                  container.innerHTML = \`
                      <div class="p-4 lg:p-8 animate-fade-in bg-[#f8fafc] min-h-screen font-sans">
                          <div class="max-w-7xl mx-auto space-y-6">
                              <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                                  <div>
                                      <h2 class="text-xl font-black text-slate-800 tracking-tight font-sans">প্রোডাক্ট ও ক্যাটাগরি</h2>
                                      `;
      fs.writeFileSync('index.html', partBefore + middleRepl + partAfter, 'utf8');
      console.log("Successfully patched index.html!");
    } else {
      console.log("Could not find endIndex of the corrupted block.");
    }
  }

  const html = fs.readFileSync('index.html', 'utf8');
  // Match script blocks that have JS (lines between <script> and </script>, ignoring the CDN one if it is self-closing or external)
  const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;

  while ((match = regex.exec(html)) !== null) {
    const scriptContent = match[1];
    // Skip empty or external scripts without inline content
    if (!scriptContent.trim()) continue;

    scriptCount++;
    // Get line of the match to report correct lines
    const offsetIndex = match.index + match[0].indexOf(scriptContent);
    const beforeText = html.substring(0, offsetIndex);
    const lineNumber = beforeText.split('\n').length;

    console.log(`Validating script block #${scriptCount} starting at HTML line ${lineNumber}...`);
    try {
      new vm.Script(scriptContent, { filename: 'index.html', lineOffset: lineNumber - 1 });
      console.log(`Script block #${scriptCount} is valid.`);
    } catch (err) {
      console.error(`\n--- SYNTAX ERROR IN SCRIPT BLOCK #${scriptCount} ---`);
      console.error(err.stack || err.message);
      
      // RUN BRACE/BRACKET/PARENTHESIS ANALYSIS
      console.log('\n--- BRACE BALANCE ANALYSIS ---');
      let stack = [];
      let lineNum = lineNumber;
      for (let i = 0; i < scriptContent.length; i++) {
        const char = scriptContent[i];
        if (char === '\n') lineNum++;
        if (char === '{' || char === '[' || char === '(') {
          stack.push({ char, line: lineNum, index: i });
        } else if (char === '}' || char === ']' || char === ')') {
          if (stack.length === 0) {
            console.log(`Unmatched closing char '${char}' at line ${lineNum}`);
          } else {
            const top = stack.pop();
            if (
              (char === '}' && top.char !== '{') ||
              (char === ']' && top.char !== '[') ||
              (char === ')' && top.char !== '(')
            ) {
              console.log(`Mismatch: opened '${top.char}' at line ${top.line} but closed '${char}' at line ${lineNum}`);
            }
          }
        }
      }
      console.log(`Remaining unclosed items count: ${stack.length}`);
      if (stack.length > 0) {
        console.log('Unclosed items stack (first 20):');
        console.log(stack.slice(0, 20));
        console.log('Unclosed items stack (last 20):');
        console.log(stack.slice(-20));
      }
      console.error(`---------------------------------------------\n`);
      process.exit(1);
    }
  }
  console.log('All inline scripts validated successfully!');
} catch (globalErr) {
  console.error('Error running validator:', globalErr);
  process.exit(1);
}
