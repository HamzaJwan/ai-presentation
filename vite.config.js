import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function localMediaUploadPlugin() {
  return {
    name: 'local-media-upload',
    configureServer(server) {
      server.middlewares.use('/__media-upload', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.end('Method Not Allowed');
          return;
        }

        try {
          let body = '';
          for await (const chunk of request) body += chunk;
          const { fileName, dataUrl } = JSON.parse(body);
          const safeName = String(fileName || '').replace(/[^a-zA-Z0-9._-]/g, '');
          const match = String(dataUrl || '').match(/^data:([-\w/+]+);base64,(.+)$/);

          if (!safeName || !match) {
            response.statusCode = 400;
            response.end(JSON.stringify({ ok: false, error: 'Invalid upload payload' }));
            return;
          }

          const mediaDir = path.resolve(server.config.root, 'public', 'media');
          const target = path.join(mediaDir, safeName);
          if (!target.startsWith(mediaDir)) {
            response.statusCode = 400;
            response.end(JSON.stringify({ ok: false, error: 'Invalid file path' }));
            return;
          }

          await mkdir(mediaDir, { recursive: true });
          await writeFile(target, Buffer.from(match[2], 'base64'));
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ ok: true, url: `/media/${safeName}` }));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localMediaUploadPlugin()],
  build: {
    sourcemap: false
  },
  define: {
    __PUBLIC_APP_URL__: JSON.stringify(process.env.VITE_PUBLIC_APP_URL || 'https://ai.juanspace.org')
  }
});
