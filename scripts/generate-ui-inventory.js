const { sync } = require('glob');
const path = require('path');
const fs = require('fs');

function generateInventory() {
  const patterns = ['components/**/*.tsx', 'app/**/*.tsx'];
  const files = patterns.flatMap(pattern => sync(pattern));

  const header = `# UI Inventory

This file is auto-generated. Run \`npm run generate:ui-inventory\` (or \`pnpm run generate:ui-inventory\`) to update.

| Component | Path | Props | Variants |
|-----------|------|-------|----------|
`;
  const rows = files.map(f => {
    const comp = path.basename(f, '.tsx');
    return `| ${comp} | ${f} |  |  |`;
  });

  const content = header + rows.join('\n') + '\n';
  fs.writeFileSync(path.join(process.cwd(), 'docs/ui-inventory.md'), content, 'utf-8');
  console.log('UI inventory generated with', files.length, 'entries.');
}

generateInventory();