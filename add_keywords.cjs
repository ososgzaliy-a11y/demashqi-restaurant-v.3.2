const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/context/LanguageContext.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all keywords: [...], patterns from the file
// This regex matches: keywords: ['...', '...', ...], (with optional whitespace)
content = content.replace(/\s*keywords:\s*\[.*?\],?\s*/g, ' ');

// Clean up any double spaces that may have resulted
content = content.replace(/  +/g, ' ');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully removed all keywords from LanguageContext.jsx!");
