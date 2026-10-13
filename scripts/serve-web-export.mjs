// Servidor estático sin dependencias para la exportación web de Expo (`dist/`).
//
// Regla de fallback SPA (navegación directa y recarga):
//   1. Si la ruta solicitada corresponde a un archivo existente dentro de `dist/`, se sirve ese archivo.
//   2. Si la ruta no existe y no parece un archivo (sin extensión de archivo y fuera de /assets/ y /_expo/),
//      se devuelve `index.html` con estado 200 para que React Navigation resuelva la ruta en el cliente.
//   3. Si la ruta no existe y sí parece un recurso estático (extensión de archivo, /assets/ o /_expo/),
//      se devuelve 404 para no enmascarar recursos faltantes con HTML.
//
// Uso: node scripts/serve-web-export.mjs [--port 8081]  (o env PORT=8081)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const indexPath = join(distDir, 'index.html');

const portArgIndex = process.argv.indexOf('--port');
const port = Number(
  portArgIndex !== -1 ? process.argv[portArgIndex + 1] : (process.env.PORT ?? 8081),
);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`Puerto inválido: ${portArgIndex !== -1 ? process.argv[portArgIndex + 1] : process.env.PORT}`);
  process.exit(1);
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const isAssetLikePath = (pathname) =>
  pathname.startsWith('/assets/') || pathname.startsWith('/_expo/') || extname(pathname) !== '';

const safeResolve = (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const candidate = normalize(join(distDir, decoded));
  if (candidate !== distDir && !candidate.startsWith(distDir + sep)) return null;
  return candidate;
};

const fileIfExists = async (filePath) => {
  try {
    const info = await stat(filePath);
    return info.isFile() ? info : null;
  } catch {
    return null;
  }
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, headers);
  res.end(body);
};

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  } catch {
    send(res, 400, 'Bad Request');
    return;
  }

  let filePath = safeResolve(pathname);
  if (!filePath) {
    send(res, 400, 'Bad Request');
    return;
  }

  const direct = await fileIfExists(filePath);
  if (direct) {
    const body = req.method === 'HEAD' ? undefined : await readFile(filePath);
    send(res, 200, body, {
      'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': direct.size,
      'Cache-Control': 'no-cache',
    });
    return;
  }

  if (isAssetLikePath(pathname)) {
    send(res, 404, 'Not Found');
    return;
  }

  const index = await fileIfExists(indexPath);
  if (!index) {
    send(res, 500, 'dist/index.html no encontrado. Ejecuta primero: npm run export:web');
    return;
  }
  const body = req.method === 'HEAD' ? undefined : await readFile(indexPath);
  send(res, 200, body, {
    'Content-Type': MIME_TYPES['.html'],
    'Content-Length': index.size,
    'Cache-Control': 'no-cache',
  });
});

server.on('error', (error) => {
  console.error(`No se pudo iniciar el servidor en el puerto ${port}: ${error.message}`);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Sirviendo exportación web: ${distDir}`);
  console.log(`Escuchando en http://localhost:${port} (fallback SPA: ruta desconocida -> index.html)`);
});
