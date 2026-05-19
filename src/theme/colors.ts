export const colors = {
  background: '#0E0E10',
  backgroundAlt: '#18181B',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  surfacePressed: '#3F3F46',
  border: '#3F3F46',
  borderSoft: '#27272A',
  primary: '#FACC15',
  primaryHover: '#FDE047',
  primaryPressed: '#EAB308',
  primaryMuted: '#422006',
  warning: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textDisabled: '#52525B',
  overlay: 'rgba(0,0,0,0.65)',
} as const;

export type Colors = typeof colors;
