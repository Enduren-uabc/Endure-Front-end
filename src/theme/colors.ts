export const colors = {
  background: '#0F0F10',
  backgroundAlt: '#141416',
  surface: '#1C1C20',
  surfaceElevated: '#252529',
  surfacePressed: '#2D2D32',
  border: '#34343A',
  borderSoft: '#29292E',
  primary: '#3B82F6',
  primaryHover: '#60A5FA',
  primaryPressed: '#2563EB',
  primaryMuted: '#1E3A5F',
  warning: '#FF8A00',
  success: '#2FE071',
  error: '#FF4D4F',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B8',
  textMuted: '#777780',
  textDisabled: '#56565E',
  overlay: 'rgba(0,0,0,0.65)',
} as const;

export type Colors = typeof colors;
