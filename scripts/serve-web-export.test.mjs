// Prueba de regresión del servidor estático sin dependencias (`scripts/serve-web-export.mjs`).
//
// Requisito previo: `dist/` debe existir (ejecuta `npm run export:web` antes de esta prueba).
// Uso: node scripts/serve-web-export.test.mjs   (o npm run test:serve-web-export)
//
// Casos cubiertos:
//   1. GET /%  -> 400: un percent-encoding malformado no debe tumbar el proceso.
//   2. GET /login -> 200: el servidor sigue vivo tras la petición malformada.
//   3. GET /ruta-inexistente-del-piloto -> 200 con index.html (fallback SPA).
//   4. GET /assets/no-existe.png -> 404 (los recursos faltantes no se enmascaran con HTML).
//
// El servidor se levanta como proceso hijo en el puerto 8189 (se evita el 8081 del
// coordinador y el 3000 de la API) y se cierra al finalizar.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { request } from 'node:http';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8189;
const HOST = '127.0.0.1';
const READY_TIMEOUT_MS = 15000;

let server;
let serverStderr = '';

const httpGet = (path) =>
  new Promise((resolve, reject) => {
    const req = request({ host: HOST, port: PORT, path, method: 'GET' }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }),
      );
    });
    req.on('error', reject);
    req.end();
  });

before(async () => {
  await access(join(rootDir, 'dist', 'index.html')).catch(() => {
    throw new Error('Falta dist/index.html. Ejecuta primero: npm run export:web');
  });

  server = spawn(process.execPath, ['scripts/serve-web-export.mjs', '--port', String(PORT)], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stderr.on('data', (chunk) => {
    serverStderr += String(chunk);
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`El servidor no arrancó en ${READY_TIMEOUT_MS} ms`)),
      READY_TIMEOUT_MS,
    );
    server.stdout.on('data', (chunk) => {
      if (String(chunk).includes(`http://localhost:${PORT}`)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.once('exit', (code, signal) => {
      clearTimeout(timeout);
      reject(new Error(`El servidor terminó antes de arrancar (code=${code}, signal=${signal})`));
    });
  });
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill('SIGTERM');
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      server.kill('SIGKILL');
      resolve();
    }, 5000);
    server.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
});

test('GET /% responde 400 y no tumba el servidor', async () => {
  const res = await httpGet('/%');
  assert.equal(res.status, 400);
});

test('GET /login responde 200 tras la petición malformada', async () => {
  assert.equal(
    server.exitCode,
    null,
    `El servidor no debe haberse caído tras GET /%. stderr: ${serverStderr}`,
  );
  const res = await httpGet('/login');
  assert.equal(res.status, 200);
});

test('GET /ruta-inexistente-del-piloto responde 200 con index.html (fallback SPA)', async () => {
  const res = await httpGet('/ruta-inexistente-del-piloto');
  assert.equal(res.status, 200);
  assert.match(res.body, /<div id="root"><\/div>/);
});

test('GET /assets/no-existe.png responde 404', async () => {
  const res = await httpGet('/assets/no-existe.png');
  assert.equal(res.status, 404);
});
