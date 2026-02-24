const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data', 'lessons');

const paths = {
  shooter: { pattern: /^lesson-shooter-/, files: [] },
  platformer: { pattern: /^lesson-platformer-/, files: [] },
  rpg: { pattern: /^lesson-rpg-/, files: [] },
  crawler: { pattern: /^lesson-crawler-/, files: [] },
};

for (const f of fs.readdirSync(dir).filter(f => f.startsWith('lesson-') && f.endsWith('.ts'))) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');

  // Find part1 instructions content
  const part1Idx = content.indexOf('part1:');
  if (part1Idx === -1) continue;
  const instrMarker = 'instructions: `';
  const instrStart = content.indexOf(instrMarker, part1Idx);
  if (instrStart === -1) continue;

  const openTick = instrStart + instrMarker.length;
  // Find closing backtick - skip escaped ones
  let closeTick = openTick;
  while (closeTick < content.length) {
    if (content[closeTick] === '`' && content[closeTick - 1] !== '\\') break;
    closeTick++;
  }
  const instructions = content.substring(openTick, closeTick);

  const hasBT = /beginner trap|common mistake/i.test(instructions);
  const hasEI = /elite insight|pro insight/i.test(instructions);
  const hasST = /systems thinking|cross-path/i.test(instructions);

  const numMatch = f.match(/-(\d+)-/);
  const num = numMatch ? parseInt(numMatch[1]) : -1;

  const missing = [];
  if (!hasBT) missing.push('BT');
  if (!hasEI) missing.push('EI');
  if (!hasST) missing.push('ST');

  if (missing.length === 0) continue;

  for (const [pname, pdata] of Object.entries(paths)) {
    if (pdata.pattern.test(f)) {
      pdata.files.push({ file: f, num, missing: missing.join(',') });
      break;
    }
  }
}

let total = 0;
for (const [pname, pdata] of Object.entries(paths)) {
  pdata.files.sort((a, b) => a.num - b.num);
  total += pdata.files.length;
  console.log('\n=== ' + pname.toUpperCase() + ' (' + pdata.files.length + ' files need work) ===');
  for (const f of pdata.files) {
    console.log('  L' + String(f.num).padStart(3, '0') + ' [' + f.missing.padEnd(8) + '] ' + f.file);
  }
}
console.log('\nTotal files needing work: ' + total);
