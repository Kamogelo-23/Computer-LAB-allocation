const fs = require('fs');
const code = fs.readFileSync('frontend/src/App.jsx', 'utf8');
let line = 1;
let inSingle = false;
let inDouble = false;
let inTemplate = false;
let inBlockComment = false;
let inLineComment = false;
let escaped = false;
const stack = [];
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  const next = code[i + 1];
  if (ch === '\n') {
    line++;
    inLineComment = false;
    escaped = false;
    continue;
  }
  if (inLineComment) continue;
  if (inBlockComment) {
    if (ch === '*' && next === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inSingle || inDouble || inTemplate) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (inSingle && ch === "'") inSingle = false;
    if (inDouble && ch === '"') inDouble = false;
    if (inTemplate && ch === '`') inTemplate = false;
    continue;
  }
  if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
  if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
  if (ch === "'") { inSingle = true; continue; }
  if (ch === '"') { inDouble = true; continue; }
  if (ch === '`') { inTemplate = true; continue; }
  if (ch === '{' || ch === '(' || ch === '[') stack.push({ ch, line, index: i });
  if (ch === '}' || ch === ')' || ch === ']') stack.pop();
}
console.log(JSON.stringify(stack.slice(-10), null, 2));