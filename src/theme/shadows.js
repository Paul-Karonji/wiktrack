import { Platform } from 'react-native';

export const shadows = {
  card: Platform.select({
    android: { elevation: 3 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
  }),
  hero: Platform.select({
    android: { elevation: 6 },
    default: {
      shadowColor: '#0F833B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
    },
  }),
  bottomNav: Platform.select({
    android: { elevation: 4 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
  }),
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};
