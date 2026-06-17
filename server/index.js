import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { ZipArchive } from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, 'data');
const mediaDir = path.join(dataDir, 'media');
const contentDir = path.join(dataDir, 'content');
const overridesPath = path.join(contentDir, 'slides-overrides.json');
const settingsPath = path.join(contentDir, 'site-settings.json');
const port = Number(process.env.PORT || 80);
const adminToken = process.env.ADMIN_TOKEN || '';
const adminEnabled = String(process.env.ENABLE_ADMIN_API ?? 'true').toLowerCase() !== 'false';

const allowedExtensions = new Map([
  ['jpg', 'image'],
  ['jpeg', 'image'],
  ['png', 'image'],
  ['webp', 'image'],
  ['gif', 'image'],
  ['mp4', 'video'],
  ['webm', 'video']
]);

const allowedMime = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm']
]);

function isLocalRequest(request) {
  const host = request.hostname || '';
  const ip = request.ip || '';
  return ['localhost', '127.0.0.1', '::1'].includes(host) || ip === '::1' || ip.endsWith('127.0.0.1');
}

function requireAdmin(request, response, next) {
  if (!adminEnabled) {
    response.status(403).json({ ok: false, error: 'Admin API disabled' });
    return;
  }

  if (!adminToken && isLocalRequest(request)) {
    next();
    return;
  }

  const header = request.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (adminToken && token === adminToken) {
    next();
    return;
  }

  response.status(401).json({ ok: false, error: 'Admin token required' });
}

async function ensureDataFiles() {
  await fs.mkdir(mediaDir, { recursive: true });
  await fs.mkdir(contentDir, { recursive: true });
  await writeJsonIfMissing(overridesPath, { version: 1, updatedAt: null, slides: {}, profiles: {}, modes: {} });
  await writeJsonIfMissing(settingsPath, { version: 1, updatedAt: null, brands: {}, global: {} });
}

async function writeJsonIfMissing(filePath, fallback) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, `${JSON.stringify(fallback, null, 2)}\n`, 'utf8');
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
}

function safeSlot(value) {
  const slot = String(value || 'main').toLowerCase();
  return ['main', 'thumb-1', 'thumb-2', 'thumb-3', 'logo', 'background'].includes(slot) ? slot : 'main';
}

function safeBrand(value) {
  return String(value || 'generic').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'generic';
}

function makeFileName(request, file) {
  const extension = allowedMime.get(file.mimetype);
  if (!extension) return null;
  const slide = String(request.body.slideId || 'global').replace(/[^0-9a-zA-Z_-]/g, '').slice(0, 30) || 'global';
  const slot = safeSlot(request.body.slot);
  const brand = safeBrand(request.body.brand);
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `${brand}-slide-${slide}-${slot}-${stamp}.${extension}`;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_request, _file, callback) => {
      await fs.mkdir(mediaDir, { recursive: true });
      callback(null, mediaDir);
    },
    filename: (request, file, callback) => {
      const safeName = makeFileName(request, file);
      callback(safeName ? null : new Error('Unsupported file type'), safeName || 'rejected.bin');
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = allowedMime.get(file.mimetype);
    if (!extension) {
      callback(new Error('Unsupported MIME type'));
      return;
    }
    callback(null, true);
  }
});

function mediaTypeFromFile(fileName) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return allowedExtensions.get(extension) || 'image';
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));

await ensureDataFiles();

app.get('/healthz', (_request, response) => response.type('text/plain').send('ok\n'));

app.get('/api/content', async (_request, response) => {
  const overrides = await readJson(overridesPath, { version: 1, slides: {}, profiles: {}, modes: {} });
  response.json({ ok: true, ...overrides });
});

app.put('/api/content/slides/:slideId', requireAdmin, async (request, response) => {
  const slideId = String(request.params.slideId);
  const overrides = await readJson(overridesPath, { version: 1, slides: {}, profiles: {}, modes: {} });
  overrides.slides = overrides.slides || {};
  overrides.slides[slideId] = { ...(overrides.slides[slideId] || {}), ...(request.body || {}) };
  await writeJson(overridesPath, overrides);
  response.json({ ok: true, slide: overrides.slides[slideId] });
});

app.put('/api/content/slides/:slideId/notes', requireAdmin, async (request, response) => {
  const slideId = String(request.params.slideId);
  const overrides = await readJson(overridesPath, { version: 1, slides: {}, profiles: {}, modes: {} });
  overrides.slides = overrides.slides || {};
  overrides.slides[slideId] = { ...(overrides.slides[slideId] || {}), speakerNotes: String(request.body?.speakerNotes || '') };
  await writeJson(overridesPath, overrides);
  response.json({ ok: true, speakerNotes: overrides.slides[slideId].speakerNotes });
});

app.post('/api/media/upload', requireAdmin, upload.single('file'), async (request, response) => {
  if (!request.file) {
    response.status(400).json({ ok: false, error: 'No file uploaded' });
    return;
  }

  const type = mediaTypeFromFile(request.file.filename);
  const record = {
    id: request.file.filename,
    url: `/media/uploads/${request.file.filename}`,
    type,
    slot: safeSlot(request.body.slot),
    slideId: request.body.slideId ? Number(request.body.slideId) : null,
    brand: safeBrand(request.body.brand),
    caption: String(request.body.caption || request.file.originalname || ''),
    fit: String(request.body.fit || 'cover'),
    align: String(request.body.align || 'center'),
    tint: Number(request.body.tint || 0.08),
    glow: String(request.body.glow || 'medium'),
    size: request.file.size,
    uploadedAt: new Date().toISOString()
  };

  if (record.slideId && record.slot) {
    const overrides = await readJson(overridesPath, { version: 1, slides: {}, profiles: {}, modes: {} });
    const slideKey = String(record.slideId);
    overrides.slides = overrides.slides || {};
    const slideOverride = overrides.slides[slideKey] || {};
    slideOverride.media = {
      ...(slideOverride.media || {}),
      [record.slot]: {
        src: record.url,
        type: record.type,
        caption: record.caption,
        fit: record.fit,
        align: record.align,
        tint: record.tint,
        glow: record.glow
      }
    };
    overrides.slides[slideKey] = slideOverride;
    await writeJson(overridesPath, overrides);
  }

  response.json({ ok: true, media: record });
});

app.get('/api/media/list', async (_request, response) => {
  const entries = await fs.readdir(mediaDir, { withFileTypes: true }).catch(() => []);
  const media = entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({ id: entry.name, url: `/media/uploads/${entry.name}`, type: mediaTypeFromFile(entry.name) }));
  response.json({ ok: true, media });
});

app.delete('/api/media/:id', requireAdmin, async (request, response) => {
  const id = path.basename(request.params.id);
  await fs.rm(path.join(mediaDir, id), { force: true });
  response.json({ ok: true });
});

app.get('/api/settings', async (_request, response) => {
  const settings = await readJson(settingsPath, { version: 1, brands: {}, global: {} });
  response.json({ ok: true, ...settings });
});

app.put('/api/settings', requireAdmin, async (request, response) => {
  const nextSettings = request.body || {};
  await writeJson(settingsPath, nextSettings);
  response.json({ ok: true, settings: nextSettings });
});

app.get('/api/export/content', requireAdmin, async (_request, response) => {
  response.attachment(`ai-workshop-content-${Date.now()}.zip`);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on('error', (error) => response.status(500).send(error.message));
  archive.pipe(response);
  archive.file(overridesPath, { name: 'content/slides-overrides.json' });
  archive.file(settingsPath, { name: 'content/site-settings.json' });
  archive.directory(mediaDir, 'media');
  archive.append(JSON.stringify({ exportedAt: new Date().toISOString(), version: 1 }, null, 2), { name: 'manifest.json' });
  archive.finalize();
});

app.post('/api/import/content', requireAdmin, async (request, response) => {
  if (request.body?.slides) await writeJson(overridesPath, request.body);
  if (request.body?.settings) await writeJson(settingsPath, request.body.settings);
  response.json({ ok: true });
});

app.use('/media/uploads', express.static(mediaDir, { fallthrough: false, maxAge: '30d' }));
app.use(express.static(distDir, { index: false, maxAge: '1y' }));
app.use((_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AI Workshop server listening on ${port}`);
  console.log(`Persistent data directory: ${dataDir}`);
});
