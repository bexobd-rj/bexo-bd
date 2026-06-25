import fs from 'fs';
import vm from 'vm';

const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);

if (scriptMatch) {
  const scriptContent = scriptMatch[1];
  try {
    new vm.Script(scriptContent);
    console.log("No syntax error found in the first <script> block.");
  } catch (err) {
    console.log("Syntax error:");
    console.log(err.message);
    const lines = scriptContent.split('\n');
    console.log("Around line " + err.loc?.line);
    if (err.loc) {
      console.log(lines[err.loc.line - 1]);
    }
  }
}

const allScripts = content.match(/<script>([\s\S]*?)<\/script>/g);
if (allScripts) {
  allScripts.forEach((scriptTag, index) => {
    const sContent = scriptTag.replace(/<\/?script>/g, '');
    try {
      new vm.Script(sContent);
    } catch (err) {
      console.log(`Error in script block ${index + 1}:`);
      console.log(err.message);
      const startLine = content.substring(0, content.indexOf(scriptTag)).split('\n').length;
      console.log(`Script block starts at HTML line: ${startLine}, length: ${sContent.split('\n').length}`);
    }
  });
}
