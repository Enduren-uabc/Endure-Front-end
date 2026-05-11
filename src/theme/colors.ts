export const colors = {
  background: '#0F0F10',
  backgroundAlt: '#141416',
  surface: '#1C1C20',
  surfaceElevated: '#252529',
  surfacePressed: '#2D2D32',
  border: '#34343A',
  borderSoft: '#29292E',
  primary: '#FFCC19',
  primaryHover: '#FFD84A',
  primaryPressed: '#E6B800',
  primaryMuted: '#5A350D',
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
