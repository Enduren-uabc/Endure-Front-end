import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '@/theme';
import TrainingStack from './TrainingStack';
import type { AppTabsParamList } from './types';
import FeedScreen from '@/features/social/screens/FeedScreen';
import ProfileScreen from '@/features/social/screens/ProfileScreen';
import PostDetailScreen from '@/features/social/screens/PostDetailScreen';

const Stack = createNativeStackNavigator<AppTabsParamList>();

function HomeScreen({ navigation }: { navigation: NativeStackNavigationProp<AppTabsParamList> }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Endure</Text>
      <Text style={styles.subtitle}>Entrena, registra tu progreso y comparte avances.</Text>
      <View style={styles.actions}>
        <Pressable style={styles.card} onPress={() => navigation.navigate('Routines')}>
          <Text style={styles.cardTitle}>Rutinas</Text>
          <Text style={styles.cardText}>Gestiona tu entrenamiento.</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => navigation.navigate('SocialFeed')}>
          <Text style={styles.cardTitle}>Comunidad</Text>
          <Text style={styles.cardText}>Abre el feed social de Endure.</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PublicProfileRoute({ route }: { route: { params: { userId: string } } }) {
  return <ProfileScreen userId={route.params.userId} />;
}

function PostDetailRoute({
  route,
}: {
  route: {
    params: { postId: string; title?: string; content?: string; authorUserId?: string };
  };
}) {
  return <PostDetailScreen {...route.params} />;
}

export default function AppTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Routines" component={TrainingStack} />
      <Stack.Screen name="SocialFeed" component={FeedScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileRoute} />
      <Stack.Screen name="PostDetail" component={PostDetailRoute} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginTop: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  cardText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
