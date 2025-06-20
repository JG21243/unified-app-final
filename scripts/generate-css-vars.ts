import fs from 'fs';
import path from 'path';
import { lightColors, darkColors } from '../design/tokens';

function toCssVars(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');
}

const light = toCssVars(lightColors);
const dark = toCssVars(darkColors);

const css = `:root {\n${light}\n}\n.dark {\n${dark}\n}\n`;

fs.writeFileSync(path.join(__dirname, '../styles/theme-vars.css'), css);
console.log('Generated styles/theme-vars.css');
