import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const requireHere = createRequire(import.meta.url);
const ts = requireHere('typescript');
const axios = requireHere('axios');

function loadTypeScript(path, modules, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => modules[name] ?? requireHere(name),
    process,
    ...globals,
  }, { filename: path });
  return exports;
}

test('web token store never reads or writes browser tokens and removes legacy keys', async () => {
  const saved = new Map([['endure_access_token', 'old'], ['endure_refresh_token', 'old']]);
  const localStorage = {
    setItem: () => { throw new Error('browser token write'); },
    getItem: () => { throw new Error('browser token read'); },
    removeItem: (key) => saved.delete(key),
  };
  const { tokenStore } = loadTypeScript('../src/lib/secure-token-store.ts', {
    'react-native': { Platform: { OS: 'web' } },
    'expo-secure-store': {},
  }, { localStorage });
  await tokenStore.setAccessToken('secret');
  await tokenStore.setRefreshToken('secret');
  assert.equal(await tokenStore.getAccessToken(), null);
  assert.equal(await tokenStore.getRefreshToken(), null);
  await tokenStore.clear();
  assert.equal(saved.size, 0);
});

test('mobile token store continues using SecureStore', async () => {
  const saved = new Map();
  const secureStore = {
    setItemAsync: async (key, value) => saved.set(key, value),
    getItemAsync: async (key) => saved.get(key) ?? null,
    deleteItemAsync: async (key) => saved.delete(key),
  };
  const { tokenStore } = loadTypeScript('../src/lib/secure-token-store.ts', {
    'react-native': { Platform: { OS: 'ios' } },
    'expo-secure-store': secureStore,
  });
  await tokenStore.setAccessToken('mobile');
  assert.equal(await tokenStore.getAccessToken(), 'mobile');
  await tokenStore.clear();
  assert.equal(await tokenStore.getAccessToken(), null);
});

test('web API uses cookie credentials and CSRF, then retries after cookie refresh', async () => {
  const calls = [];
  let protectedCalls = 0;
  const tokenStore = {
    getAccessToken: async () => { throw new Error('web read mobile token'); },
    getRefreshToken: async () => { throw new Error('web read mobile token'); },
    clear: async () => {},
  };
  const { api } = loadTypeScript('../src/lib/api-client.ts', {
    axios,
    'react-native': { Platform: { OS: 'web' } },
    './secure-token-store': { tokenStore },
    '@/features/auth/stores/session-store': { useSessionStore: { getState: () => ({ clearSession: () => {} }) } },
  }, { document: { cookie: 'csrf_token=csrf-value' } });
  api.defaults.adapter = async (config) => {
    calls.push({ url: config.url, headers: config.headers });
    if (config.url === '/protected' && protectedCalls++ === 0) {
      throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, {
        config, data: {}, headers: {}, status: 401, statusText: 'Unauthorized',
      });
    }
    return { config, data: config.url === '/auth/refresh' ? { success: true } : { ok: true },
      headers: {}, status: 200, statusText: 'OK' };
  };
  const response = await api.post('/protected', {});
  assert.equal(response.data.ok, true);
  assert.deepEqual(calls.map((call) => call.url), ['/protected', '/auth/refresh', '/protected']);
  for (const call of calls) {
    assert.equal(call.headers['X-CSRF-Token'], 'csrf-value');
    assert.equal(call.headers['X-Client-Type'], undefined);
    assert.equal(call.headers.Authorization, undefined);
  }
  assert.equal(api.defaults.withCredentials, true);
});
