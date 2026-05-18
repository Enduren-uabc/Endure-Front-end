import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PostDetailScreen from '@/features/social/screens/PostDetailScreen';

export default function PostDetailRoute() {
  const params = useLocalSearchParams<{
    postId?: string;
    title?: string;
    content?: string;
    authorUserId?: string;
  }>();

  return (
    <PostDetailScreen
      postId={params.postId ?? ''}
      title={params.title}
      content={params.content}
      authorUserId={params.authorUserId}
    />
  );
}
