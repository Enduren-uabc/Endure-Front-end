import React from 'react';
import { Newspaper, Dumbbell, UserCircle } from 'lucide-react-native';
import { theme } from '@/theme';

export type TabBarIconName = 'feed' | 'training' | 'profile';

interface TabBarIconProps {
  name: TabBarIconName;
  color: string;
  focused: boolean;
}

const icons = {
  feed: Newspaper,
  training: Dumbbell,
  profile: UserCircle,
} as const;

export function TabBarIcon({ name, color, focused }: TabBarIconProps) {
  const Icon = icons[name];
  return (
    <Icon
      color={color}
      size={focused ? 24 : 22}
      strokeWidth={focused ? 2.6 : 2}
    />
  );
}

export const tabBarColors = {
  active: theme.colors.primary,
  inactive: theme.colors.textMuted,
};
