import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '@/features/social/screens/FeedScreen';
import OwnProfileScreen from '@/features/social/screens/OwnProfileScreen';
import PostDetailScreen from '@/features/social/screens/PostDetailScreen';
import ProfileScreen from '@/features/social/screens/ProfileScreen';
import type { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

function PublicProfileRoute({ route }: { route: { params: { userId: string } } }) {
  return <ProfileScreen userId={route.params.userId} />;
}

function PostDetailRoute({
  route,
}: {
  route: {
    params: { postId: string; title?: string; content?: string; authorUserId?: string; workoutSessionId?: string; exerciseSummary?: import('@/features/social/types/social.types').ExerciseSummary };
  };
}) {
  return <PostDetailScreen {...route.params} />;
}

export default function SocialStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SocialFeed" component={FeedScreen} />
      <Stack.Screen name="OwnProfile" component={OwnProfileScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileRoute} />
      <Stack.Screen name="PostDetail" component={PostDetailRoute} />
    </Stack.Navigator>
  );
}
