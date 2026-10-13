import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const requireHere = createRequire(import.meta.url);
const ts = requireHere('typescript');

function loadTypeScript(path, modules = {}, globals = {}) {
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

const {
  getPasswordRequirementStatus,
  meetsAllPasswordRequirements,
  passwordsMatch,
  getConfirmPasswordFeedback,
  getVisibleFieldError,
} = loadTypeScript('../src/features/auth/validations/form-feedback.ts');

const { registerSchema } = loadTypeScript(
  '../src/features/auth/validations/auth.ts',
  { zod: requireHere('zod') },
);

function requirementMap(password) {
  return Object.fromEntries(
    getPasswordRequirementStatus(password).map((requirement) => [requirement.id, requirement.met]),
  );
}

test('la guía de requisitos progresa y retrocede sin enviar', () => {
  assert.deepEqual(requirementMap(''), { length: false, uppercase: false, digit: false });
  assert.deepEqual(requirementMap('abcdefgh'), { length: true, uppercase: false, digit: false });
  assert.deepEqual(requirementMap('Abcdefgh'), { length: true, uppercase: true, digit: false });
  assert.deepEqual(requirementMap('Abcdefg1'), { length: true, uppercase: true, digit: true });
  assert.deepEqual(requirementMap('Abcdefg'), { length: false, uppercase: true, digit: false });
});

test('la guía y el esquema comparten los tres requisitos mínimos de registro', () => {
  const base = {
    email: 'persona@example.com',
    username: 'persona_1',
    acceptPrivacy: true,
  };

  for (const password of ['Abcdefg1', 'Abcdefgh', 'abcdefg1', 'Abcdefg', '']) {
    const schemaAccepts = registerSchema.safeParse({
      ...base,
      password,
      confirmPassword: password,
    }).success;
    assert.equal(
      meetsAllPasswordRequirements(password),
      schemaAccepts,
      `discrepancia guía/esquema para ${JSON.stringify(password)}`,
    );
  }
});

test('el registro acepta 128 caracteres y rechaza 129 como el DTO del servidor', () => {
  const base = {
    email: 'persona@example.invalid',
    username: 'usuario_demo',
    acceptPrivacy: true,
  };
  const atLimit = `A1${'a'.repeat(126)}`;
  const overLimit = `${atLimit}a`;
  assert.equal(registerSchema.safeParse({ ...base, password: atLimit, confirmPassword: atLimit }).success, true);
  const rejected = registerSchema.safeParse({ ...base, password: overLimit, confirmPassword: overLimit });
  assert.equal(rejected.success, false);
  assert.equal(rejected.error.issues.some(issue => issue.path[0] === 'password'
    && issue.message === 'Usa como máximo 128 caracteres'), true);
});

test('válido -> inválido: cambiar la contraseña revoca la coincidencia sin enviar', () => {
  const interacted = true;
  const valid = getConfirmPasswordFeedback('Secreta12', 'Secreta12', interacted);
  assert.equal(valid.matches, true);
  assert.equal(valid.visible, false);
  assert.equal(valid.message, null);

  const invalidated = getConfirmPasswordFeedback('Secreta123', 'Secreta12', interacted);
  assert.equal(invalidated.matches, false);
  assert.equal(invalidated.visible, true);
  assert.equal(invalidated.message, 'Las contraseñas no coinciden');
});

test('inválido -> corregido: el error previo se limpia sin enviar', () => {
  const correctedConfirmation = getConfirmPasswordFeedback('Secreta123', 'Secreta123', true);
  assert.equal(correctedConfirmation.matches, true);
  assert.equal(correctedConfirmation.visible, false);
  assert.equal(correctedConfirmation.message, null);

  const correctedSource = getConfirmPasswordFeedback('Secreta12', 'Secreta12', true);
  assert.equal(correctedSource.matches, true);
  assert.equal(correctedSource.visible, false);
  assert.equal(correctedSource.message, null);
});

test('campos vírgenes no muestran error; blur o envío sí', () => {
  const pristine = getConfirmPasswordFeedback('Secreta12', 'Secreta12X', false);
  assert.equal(pristine.visible, false);
  assert.equal(pristine.message, null);

  const blurredMismatch = getConfirmPasswordFeedback('Secreta12', 'Secreta12X', true);
  assert.equal(blurredMismatch.visible, true);
  assert.equal(blurredMismatch.message, 'Las contraseñas no coinciden');

  const blurredEmpty = getConfirmPasswordFeedback('Secreta12', '', true);
  assert.equal(blurredEmpty.visible, true);
  assert.equal(blurredEmpty.message, 'Confirma tu contraseña');

  assert.equal(getVisibleFieldError('Mínimo 8 caracteres', false), undefined);
  assert.equal(getVisibleFieldError(undefined, true), undefined);
  assert.equal(getVisibleFieldError('Mínimo 8 caracteres', true), 'Mínimo 8 caracteres');
});

test('dos campos vacíos no cuentan como coincidencia', () => {
  assert.equal(passwordsMatch('', ''), false);
  assert.equal(passwordsMatch('Secreta12', ''), false);
  assert.equal(passwordsMatch('', 'Secreta12'), false);
  assert.equal(passwordsMatch('Secreta12', 'Secreta12'), true);
});

test('vaciar cualquiera de las contraseñas revoca el éxito y restaurarla limpia el error', () => {
  const sourceCleared = getConfirmPasswordFeedback('', 'Ensayo123', true);
  assert.equal(sourceCleared.matches, false);
  assert.equal(sourceCleared.message, 'Las contraseñas no coinciden');

  const confirmationCleared = getConfirmPasswordFeedback('Ensayo123', '', true);
  assert.equal(confirmationCleared.matches, false);
  assert.equal(confirmationCleared.message, 'Confirma tu contraseña');

  const restored = getConfirmPasswordFeedback('Ensayo123', 'Ensayo123', true);
  assert.equal(restored.matches, true);
  assert.equal(restored.message, null);
});
