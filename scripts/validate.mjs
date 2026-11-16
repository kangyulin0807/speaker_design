import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../content/enclosures.json', import.meta.url), 'utf8'));
const ids = new Set();
for (const item of data.enclosures) {
  for (const key of ['id', 'number', 'name', 'english', 'tagline', 'principle', 'diagram', 'motion']) {
    if (!item[key]) throw new Error(`${item.id ?? 'unknown'}: missing ${key}`);
  }
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(item.id) || ids.has(item.id)) throw new Error(`Invalid or duplicate id: ${item.id}`);
  if (!Array.isArray(item.parameters) || item.parameters.length < 3 || !Array.isArray(item.advantages) || !Array.isArray(item.tradeoffs)) throw new Error(`Incomplete content: ${item.id}`);
  if (!['sealed', 'ported', 'transmission-line'].includes(item.diagram)) throw new Error(`Unknown diagram: ${item.id}`);
  ids.add(item.id);
}
console.log(`Validated ${ids.size} enclosure entries.`);
