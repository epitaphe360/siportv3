const fs = require('fs');
const path = require('path');

const replacements = [
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ã ', 'à'],
  ['Ã¢', 'â'],
  ['Ã®', 'î'],
  ['Ã´', 'ô'],
  ['Ã»', 'û'],
  ['Ã§', 'ç'],
  ['ÃŠ', 'É'],
  ['Ã‰', 'É'],
  ['Ã±', 'ñ'],
  ['â€¢', '•'],
  ['â€™', '''],
  ['â„¹ï¸', 'ℹ️'],
  ['ðŸ"«', '🎫'],
  ['ðŸ"¥', '📥'],
  ['ðŸ–¨ï¸', '🖨️'],
  ['ðŸ"„', '📄'],
  ['âœ¨', '✨'],
  ['âœ…', '✅'],
  ['âœ"ï¸', '✔️'],
  ['âš ï¸', '⚠️'],
  ['ðŸ'¡', '💡'],
];

function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const srcPath = path.join(process.cwd(), 'src');
const files = walkDir(srcPath);

let fixedCount = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    for (const [from, to] of replacements) {
      if (content.includes(from)) {
        content = content.replaceAll(from, to);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

console.log(`\n✨ Total files fixed: ${fixedCount}`);
