import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcesPath = path.join(root, 'scripts', 'media-sources.json');
const outputDir = path.join(root, 'public', 'media', 'downloaded');
const creditsPath = path.join(root, 'public', 'media', 'media-credits.json');

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function download(item) {
  if (!item.url || !item.filename || !item.slot) {
    console.log(`Skipped incomplete source: ${item.slot || item.filename || 'unknown'}`);
    return null;
  }

  try {
    const response = await fetch(item.url, { redirect: 'follow' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const localFile = path.join(outputDir, item.filename);
    await writeFile(localFile, buffer);
    console.log(`Downloaded ${item.filename}`);

    return {
      slot: item.slot,
      credit: {
        localPath: `/media/downloaded/${item.filename}`,
        sourceUrl: item.sourceUrl || item.url,
        sourceName: item.source || 'Unknown source',
        author: item.author || 'Unknown',
        license: item.license || 'Unknown - verify before public use',
        reason: item.caption || 'Selected as a visual aid for this slide.',
        slide: Number(item.slot.match(/slide-(\d+)/)?.[1] || 0),
        slot: item.slot.replace(/^slide-\d+-/, '')
      }
    };
  } catch (error) {
    console.warn(`Failed ${item.filename}: ${error.message}`);
    return null;
  }
}

await mkdir(outputDir, { recursive: true });

const sources = await readJson(sourcesPath, []);
const existingCredits = await readJson(creditsPath, {});
const nextCredits = { ...existingCredits };

for (const item of sources) {
  const result = await download(item);
  if (result) nextCredits[result.slot] = result.credit;
}

await writeFile(creditsPath, `${JSON.stringify(nextCredits, null, 2)}\n`, 'utf8');
console.log(`Updated ${path.relative(root, creditsPath)}`);
