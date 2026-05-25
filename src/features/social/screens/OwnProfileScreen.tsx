import React from 'react';
import ProfileScreen from './ProfileScreen';
import { useSessionStore } from '@/features/auth/stores/session-store';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function OwnProfileScreen() {
  const userId = useSessionStore((s) => s.userId) ?? DEV_USER_ID;
  return <ProfileScreen userId={userId} />;
}
