export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const },
  heading1: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  heading2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading3: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '400' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
} as const;

export type Typography = typeof typography;
