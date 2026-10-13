export type PasswordRequirementId = 'length' | 'uppercase' | 'digit';

export interface PasswordRequirement {
  id: PasswordRequirementId;
  label: string;
  test: (password: string) => boolean;
}

/**
 * Requisitos de contraseña del registro. Deben coincidir con las reglas de
 * `registerSchema` en `auth.ts` (mínimo 8, una mayúscula, un número); la
 * prueba `scripts/register-form.test.mjs` verifica esa equivalencia.
 */
export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Al menos una mayúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Al menos un número',
    test: (password) => /[0-9]/.test(password),
  },
];

export interface PasswordRequirementStatus {
  id: PasswordRequirementId;
  label: string;
  met: boolean;
}

/**
 * Estado derivado de cada requisito a partir del valor canónico; se recalcula
 * en cada render, sin almacenar booleanos paralelos.
 */
export function getPasswordRequirementStatus(password: string): PasswordRequirementStatus[] {
  return PASSWORD_REQUIREMENTS.map(({ id, label, test }) => ({
    id,
    label,
    met: test(password),
  }));
}

export function meetsAllPasswordRequirements(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every(({ test }) => test(password));
}

/**
 * Una coincidencia solo cuenta cuando ambos campos tienen contenido: dos
 * valores vacíos no son una confirmación válida.
 */
export function passwordsMatch(password: string, confirmation: string): boolean {
  return password.length > 0 && confirmation.length > 0 && password === confirmation;
}

export interface ConfirmPasswordFeedback {
  matches: boolean;
  visible: boolean;
  message: string | null;
}

/**
 * Deriva el estado de coincidencia y la visibilidad del mensaje de
 * confirmación a partir de los valores canónicos y del historial de
 * interacción (blur o intento de envío). No guarda estado propio, por lo que
 * el resultado se actualiza en ambos sentidos sin depender del envío.
 */
export function getConfirmPasswordFeedback(
  password: string,
  confirmation: string,
  interacted: boolean,
): ConfirmPasswordFeedback {
  const matches = passwordsMatch(password, confirmation);

  if (!interacted) {
    return { matches, visible: false, message: null };
  }
  if (confirmation.length === 0) {
    return { matches: false, visible: true, message: 'Confirma tu contraseña' };
  }
  if (!matches) {
    return { matches: false, visible: true, message: 'Las contraseñas no coinciden' };
  }
  return { matches: true, visible: false, message: null };
}

/**
 * Separa la validez de un campo (mensaje existente) de la visibilidad del
 * error: los campos vírgenes no muestran mensajes y los ya interactuados
 * (blur o intento de envío) sí.
 */
export function getVisibleFieldError(
  message: string | undefined,
  interacted: boolean,
): string | undefined {
  return interacted ? message : undefined;
}
