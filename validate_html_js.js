import fs from 'fs';
import vm from 'vm';

try {
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
      console.error(`---------------------------------------------\n`);
      process.exit(1);
    }
  }
  console.log('All inline scripts validated successfully!');
} catch (globalErr) {
  console.error('Error running validator:', globalErr);
  process.exit(1);
}
