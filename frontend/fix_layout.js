const fs = require('fs');
const path = require('path');
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walk(dirPath);
    else if (f === 'layout.tsx') {
      let text = fs.readFileSync(dirPath, 'utf8');
      if(text.includes('max-w-[1280px]')) {
        text = text.replace(/className=\"min-h-screen[^\"]*max-w-\[1280px\][^\"]*\"/, 'className="min-h-screen bg-[var(--color-white)] w-full flex justify-between"');
        fs.writeFileSync(dirPath, text);
        console.log('Updated ' + dirPath);
      }
    }
  });
}
walk('./app');
