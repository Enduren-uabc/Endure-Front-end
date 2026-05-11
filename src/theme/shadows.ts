import { colors } from './colors';

export const shadows = {
  card: {
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export type Shadows = typeof shadows;
