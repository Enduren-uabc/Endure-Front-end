import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ProfileScreen from '@/features/social/screens/ProfileScreen';

export default function PublicProfileRoute() {
  const params = useLocalSearchParams<{ userId?: string }>();
  return <ProfileScreen userId={params.userId ?? ''} />;
}
