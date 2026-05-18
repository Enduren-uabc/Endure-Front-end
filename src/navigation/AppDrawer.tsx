import React from 'react';
import { View } from 'react-native';
import AppTabs from './AppTabs';
import { theme } from '@/theme';

export default function AppDrawer() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppTabs />
    </View>
  );
}
