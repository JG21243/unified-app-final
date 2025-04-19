import { sync } from 'glob';
import path from 'path';
import fs from 'fs';
import { Project } from 'ts-morph';

function generateInventory() {
  const patterns = ['components/**/*.tsx', 'app/**/*.tsx'];
  const files = patterns.flatMap(pattern => sync(pattern));

  const project = new Project({ tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json') });
  files.forEach(f => project.addSourceFileAtPath(f));

  const header = `# UI Inventory

This file is auto-generated. Run \`npm run generate:ui-inventory\` (or \`pnpm run generate:ui-inventory\`) to update.

| Component | Path | Props | Variants |
|-----------|------|-------|----------|
`;

  const rows = files.map(f => {
    const comp = path.basename(f, '.tsx');
    const src = project.getSourceFile(f);
    let props = '';
    if (src) {
      const iface = src.getInterface(comp + 'Props');
      if (iface) {
        props = iface.getProperties().map(p => p.getName()).join(', ');
      }
    }
    return `| ${comp} | ${f} | ${props} |  |`;
  });

  const content = header + rows.join('\n') + '\n';
  fs.writeFileSync(path.join(process.cwd(), 'docs/ui-inventory.md'), content, 'utf-8');
  console.log('UI inventory generated with', files.length, 'entries.');
}

generateInventory();