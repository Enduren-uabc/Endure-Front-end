// Created by: Codex (AI-assisted), 2026-10-10
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

process.env.TZ = 'America/Tijuana';
const requireHere = createRequire(import.meta.url);
const ts = requireHere('typescript');
function loadTypeScript(path, modules = {}, globals = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: name => modules[name] ?? requireHere(name), Date, ...globals,
  }, { filename: path });
  return exports;
}
const homeState = loadTypeScript('../src/features/home/home-state.ts');
const { getLocalWeek, calculateWeeklyStats, getWorkoutAction, getPendingRequestTotal } = homeState;
const now = new Date('2026-10-07T12:00:00-07:00');
const finished = (finishedAt, durationMinutes = 30, status = 'finished') => ({ finishedAt, durationMinutes, status });
const history = sessions => ({ sessions, hasIncompleteData: false });
const query = data => ({ data, isPending: false, isError: false });
const routine = {
  id: 'synthetic-routine', name: 'Rutina de prueba', isActive: true,
  days: [{ dayOfWeek: 'wednesday', exercises: [{ id: 'synthetic-exercise' }] }],
};

test('domingo pertenece a la semana anterior; lunes inicia otra semana local', () => {
  const sunday = getLocalWeek(new Date('2026-10-11T23:59:59-07:00'));
  const monday = getLocalWeek(new Date('2026-10-12T00:00:00-07:00'));
  assert.equal(sunday.start.getTime(), new Date('2026-10-05T00:00:00-07:00').getTime());
  assert.equal(sunday.end.getTime(), monday.start.getTime());
  assert.equal(monday.start.getDay(), 1);
  assert.equal(monday.start.getHours(), 0);
});

test('el intervalo incluye lunes a medianoche y excluye exactamente el lunes siguiente', () => {
  const stats = calculateWeeklyStats(history([
    finished('2026-10-04T23:59:59-07:00', 100),
    finished('2026-10-05T00:00:00-07:00', 10),
    finished('2026-10-11T23:59:59-07:00', 20),
    finished('2026-10-12T00:00:00-07:00', 200),
  ]), now);
  assert.equal(stats.completedWorkouts, 2);
  assert.equal(stats.activeMinutes, 30);
  assert.deepEqual(Array.from(stats.activeDays), [true, false, false, false, false, false, true]);
});

test('agrupa por finishedAt local, aunque startedAt y día UTC pertenezcan a otra fecha', () => {
  const stats = calculateWeeklyStats(history([
    { ...finished('2026-10-06T02:00:00Z', 40), startedAt: '2026-10-04T10:00:00Z' },
  ]), now);
  assert.equal(stats.completedWorkouts, 1);
  assert.equal(stats.activeDays[0], true); // lunes 19:00 local
  assert.equal(stats.activeDays[1], false);
});

test('solo cuenta terminado; fechas inválidas no crean actividad ni un cero confirmado', () => {
  const stats = calculateWeeklyStats(history([
    finished('2026-10-07T12:00:00-07:00', 30, 'in_progress'),
    finished(null), finished('not-a-date'), finished(''),
  ]), now);
  assert.equal(stats.completedWorkouts, 0);
  assert.equal(stats.activeMinutes, 0);
  assert.equal(stats.hasIncompleteData, true);
  assert.equal(stats.activeDays.some(Boolean), false);
});

test('duraciones nula, negativa, infinita o no numérica no se suman y declaran parcialidad', () => {
  const stats = calculateWeeklyStats(history([30.2, 0, null, -4, Infinity, NaN, '40'].map(
    duration => finished('2026-10-07T12:00:00-07:00', duration),
  )), now);
  assert.equal(stats.completedWorkouts, 7);
  assert.equal(stats.activeMinutes, 30.2);
  assert.equal(stats.hasIncompleteMinutes, true);
  assert.equal(stats.hasIncompleteData, false);
});

test('historial vacío confirmado, datos omitidos por API y contrato incorrecto son distintos', () => {
  assert.equal(calculateWeeklyStats(history([]), now).hasIncompleteData, false);
  assert.equal(calculateWeeklyStats({ sessions: [], hasIncompleteData: true }, now).hasIncompleteData, true);
  assert.throws(() => calculateWeeklyStats({ items: [] }, now), /Historial no disponible/);
});

test('semana conserva medianoche local durante los dos cambios de horario', () => {
  for (const [date, hours] of [['2026-03-08T12:00:00-07:00', 167], ['2026-11-01T12:00:00-08:00', 169]]) {
    const week = getLocalWeek(new Date(date));
    assert.equal(week.start.getHours(), 0);
    assert.equal(week.end.getHours(), 0);
    assert.equal(week.end.getDay(), 1);
    assert.equal((week.end - week.start) / 3_600_000, hours);
  }
});

test('sesión en curso tiene prioridad sobre rutinas cargando o con error', () => {
  const session = { id: 'synthetic-session', status: 'in_progress' };
  assert.equal(getWorkoutAction(query(session), { data: undefined, isPending: true }, now).kind, 'resume');
  assert.equal(getWorkoutAction(query(session), { data: undefined, isError: true }, now).kind, 'resume');
});

test('carga y error desconocidos no se convierten en ausencia de rutina', () => {
  assert.equal(getWorkoutAction({ data: undefined, isPending: true }, query([]), now).kind, 'loading');
  assert.equal(getWorkoutAction({ data: undefined, isPending: false, isError: true }, query([]), now).kind, 'error');
  assert.equal(getWorkoutAction(query(null), { data: undefined, isError: true }, now).kind, 'error');
  assert.equal(getWorkoutAction(query(null), query([]), now).kind, 'no-routine');
});

test('la acción distingue rutina activa hoy, otro día, inactiva e información incompleta', () => {
  assert.equal(getWorkoutAction(query(null), query([routine]), now).kind, 'ready');
  assert.equal(getWorkoutAction(query(null), query([routine]), new Date('2026-10-08T12:00:00-07:00')).kind, 'no-exercises');
  assert.equal(getWorkoutAction(query(null), query([{ ...routine, isActive: false }]), now).kind, 'no-routine');
  assert.equal(getWorkoutAction(query(null), query([{ ...routine, days: undefined }]), now).kind, 'incomplete');
});

test('fallo de actualización conserva el último resultado válido de entrenamiento', () => {
  assert.equal(getWorkoutAction({ ...query(null), isError: true }, { ...query([routine]), isError: true }, now).kind, 'ready');
});

test('solicitudes usa total global de pendientes y rechaza totales no confirmados', () => {
  assert.equal(getPendingRequestTotal({ items: [{}], total: 37 }), 37);
  assert.equal(getPendingRequestTotal({ items: [], total: 0 }), 0);
  for (const response of [{ items: [] }, { total: -1 }, { total: NaN }, { total: '0' }]) {
    assert.throws(() => getPendingRequestTotal(response), /Total de solicitudes no disponible/);
  }
});

const apiEndpoints = loadTypeScript('../src/lib/api-endpoints.ts', {}, { URLSearchParams }).API_ENDPOINTS;
function captureHomeQueries(account, { get = async () => {}, focused = true } = {}) {
  const registrations = [];
  const { useHomeData } = loadTypeScript('../src/features/home/hooks/use-home-data.ts', {
    react: { useCallback: fn => fn, useEffect: () => {}, useState: init => [init(), () => {}] },
    'react-native': { Platform: { OS: 'web' }, AppState: {} },
    '@react-navigation/native': { useFocusEffect: () => {}, useIsFocused: () => focused },
    '@tanstack/react-query': {
      useQueryClient: () => ({}), useQuery: options => { registrations.push(options); return {}; },
    },
    '@/lib/api-client': { apiClient: { get } }, '@/lib/api-endpoints': { API_ENDPOINTS: apiEndpoints },
    '@/features/auth/stores/session-store': { useSessionStore: selector => selector(account) },
    '../home-state': homeState,
  });
  useHomeData();
  return registrations;
}

test('cambiar cuenta o rol aísla las cachés; usuario no habilita solicitudes de entrenador', () => {
  const user = captureHomeQueries({ userId: 'synthetic-a', role: 'user' });
  const trainer = captureHomeQueries({ userId: 'synthetic-b', role: 'trainer' });
  const changedRole = captureHomeQueries({ userId: 'synthetic-a', role: 'trainer' });
  assert.equal(user.find(option => option.queryKey.at(-1) === 'pending-requests').enabled, false);
  assert.equal(trainer.find(option => option.queryKey.at(-1) === 'pending-requests').enabled, true);
  const keys = options => options.map(option => JSON.stringify(option.queryKey));
  assert.equal(keys(user).some(key => keys(trainer).includes(key)), false);
  assert.equal(keys(user).some(key => keys(changedRole).includes(key)), false);
  assert.equal(captureHomeQueries({ userId: null, role: null }).some(option => option.enabled), false);
  assert.equal(captureHomeQueries({ userId: 'synthetic-a', role: 'trainer' }, { focused: false })
    .some(option => option.enabled), false);
});

test('sesión vacía confirmada es null; respuestas inválidas y fallos de red permanecen errores', async () => {
  let response;
  let error;
  const options = captureHomeQueries({ userId: 'synthetic-a', role: 'user' }, {
    get: async () => { if (error) throw error; return response; },
  });
  const session = options.find(option => option.queryKey.at(-1) === 'session');
  for (response of [null, '']) assert.equal(await session.queryFn(), null);
  response = { id: 'synthetic-session', status: 'in_progress' };
  assert.equal(await session.queryFn(), response);
  for (response of [undefined, {}, { id: 'synthetic-session', status: 'finished' }]) {
    await assert.rejects(session.queryFn(), /Sesión en curso no disponible/);
  }
  error = new Error('synthetic network failure');
  await assert.rejects(session.queryFn(), error);
});

test('rutinas vacías confirmadas aceptan ambos contratos existentes; datos ausentes no son cero', async () => {
  let response;
  const options = captureHomeQueries({ userId: 'synthetic-a', role: 'user' }, {
    get: async () => response,
  });
  const routines = options.find(option => option.queryKey.at(-1) === 'routines');
  for (response of [[], { routines: [] }]) assert.equal((await routines.queryFn()).length, 0);
  response = { routines: [routine] };
  assert.equal((await routines.queryFn())[0], routine);
  for (response of [null, {}, { routines: null }]) {
    await assert.rejects(routines.queryFn(), /Rutinas no disponibles/);
  }
});

function captureHomeLifecycle(platform) {
  let clock = new Date('2026-10-11T23:59:00-07:00');
  let currentNow;
  let interval;
  let appStateListener;
  let focusListener;
  let removedAppStateListener = false;
  let clearedTimer = false;
  let removedFocusListener = false;
  const effects = [];
  const invalidations = [];
  const registrations = [];
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.getTime()])); }
  }
  const account = { userId: 'synthetic-a', role: 'trainer' };
  const { useHomeData } = loadTypeScript('../src/features/home/hooks/use-home-data.ts', {
    react: {
      useCallback: fn => fn,
      useEffect: fn => effects.push(fn),
      useState: init => {
        currentNow ??= init();
        return [currentNow, value => { currentNow = typeof value === 'function' ? value(currentNow) : value; }];
      },
    },
    'react-native': {
      Platform: { OS: platform },
      AppState: { addEventListener: (event, fn) => {
        assert.equal(event, 'change');
        appStateListener = fn;
        return { remove: () => { removedAppStateListener = true; } };
      } },
    },
    '@react-navigation/native': { useFocusEffect: fn => { focusListener = fn; }, useIsFocused: () => true },
    '@tanstack/react-query': {
      useQueryClient: () => ({ invalidateQueries: options => { invalidations.push(options); } }),
      useQuery: options => { registrations.push(options); return {}; },
    },
    '@/lib/api-client': { apiClient: {} }, '@/lib/api-endpoints': { API_ENDPOINTS: apiEndpoints },
    '@/features/auth/stores/session-store': { useSessionStore: selector => selector(account) },
    '../home-state': homeState,
  }, {
    Date: ClockDate,
    setInterval: fn => { interval = fn; return 17; },
    clearInterval: id => { assert.equal(id, 17); clearedTimer = true; },
    ...(platform === 'web' ? { window: {
      addEventListener: (event, fn) => { assert.equal(event, 'focus'); focusListener.web = fn; },
      removeEventListener: (event, fn) => {
        assert.equal(event, 'focus'); assert.equal(fn, focusListener.web); removedFocusListener = true;
      },
    } } : {}),
  });
  const firstHome = useHomeData();
  const cleanUp = effects[0]();
  effects[1]();
  return {
    firstHome, registrations, invalidations,
    focus: () => focusListener(),
    appState: state => appStateListener(state),
    webFocus: () => focusListener.web(),
    tick: value => { clock = new Date(value); interval(); },
    render: useHomeData,
    get now() { return currentNow; },
    cleanUp: () => {
      cleanUp();
      assert.equal(removedAppStateListener, true);
      assert.equal(clearedTimer, true);
      assert.equal(removedFocusListener, platform === 'web');
    },
  };
}

test('retorno/foco/actividad actualizan el ámbito correcto y nativo no necesita window', () => {
  for (const platform of ['web', 'android', 'ios']) {
    const lifecycle = captureHomeLifecycle(platform);
    const initialCount = lifecycle.invalidations.length;
    lifecycle.appState('background');
    assert.equal(lifecycle.invalidations.length, initialCount);
    lifecycle.appState('active');
    lifecycle.focus();
    if (platform === 'web') lifecycle.webFocus();
    assert.equal(lifecycle.invalidations.length, initialCount + (platform === 'web' ? 3 : 2));
    for (const invalidation of lifecycle.invalidations) {
      assert.deepEqual(Array.from(invalidation.queryKey), ['home', 'synthetic-a', 'trainer']);
    }
    lifecycle.cleanUp();
  }
});

test('temporizador mantiene el día estable y al pasar lunes cambia la clave e intervalo semanal', () => {
  const lifecycle = captureHomeLifecycle('android');
  const sunday = lifecycle.now;
  lifecycle.tick('2026-10-11T23:59:30-07:00');
  assert.equal(lifecycle.now, sunday);
  const sundayWeekKey = lifecycle.registrations.find(option => option.queryKey.at(-2) === 'week').queryKey;
  lifecycle.tick('2026-10-12T00:00:00-07:00');
  const mondayHome = lifecycle.render();
  const mondayWeekKey = lifecycle.registrations.filter(option => option.queryKey.at(-2) === 'week').at(-1).queryKey;
  assert.notEqual(sundayWeekKey.at(-1), mondayWeekKey.at(-1));
  assert.equal(mondayHome.week.start.getTime(), new Date('2026-10-12T00:00:00-07:00').getTime());
  assert.equal(lifecycle.firstHome.week.end.getTime(), mondayHome.week.start.getTime());
  lifecycle.cleanUp();
});

test('Historial adapta objetos reales vacíos y poblados al contrato de lista del consumidor', async () => {
  let response;
  const { useWorkoutHistory } = loadTypeScript('../src/features/training/hooks/use-workout-session.ts', {
    '@tanstack/react-query': { useQuery: options => options },
    '@/lib/api-client': { apiClient: { get: async () => response } },
    '@/lib/api-endpoints': { API_ENDPOINTS: apiEndpoints },
  });
  response = { sessions: [], hasIncompleteData: false };
  assert.equal((await useWorkoutHistory().queryFn()).length, 0);
  const session = { id: 'synthetic-history', ...finished('2026-10-07T12:00:00-07:00') };
  response = { sessions: [session], hasIncompleteData: true };
  const sessions = await useWorkoutHistory().queryFn();
  assert.equal(Array.isArray(sessions), true);
  assert.equal(sessions[0], session);
  response = { items: [] };
  await assert.rejects(useWorkoutHistory().queryFn(), /Historial no disponible/);
});
