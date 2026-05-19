import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dumbbell, Home, Play, Users } from 'lucide-react-native';
import HomeScreen from '@/features/home/screens/home';
import FeedScreen from '@/features/social/screens/FeedScreen';
import PostDetailScreen from '@/features/social/screens/PostDetailScreen';
import ProfileScreen from '@/features/social/screens/ProfileScreen';
import TrainingStack from './TrainingStack';
import WorkoutStack from './WorkoutStack';
import type { AppTabsParamList, SocialStackParamList } from './types';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const SocialStack = createNativeStackNavigator<SocialStackParamList>();

const TAB_COLORS = {
  active: '#101D3D',
  inactive: '#9E9EAD',
  barBg: '#FFFFFF',
  barBorder: '#E5E5EA',
  workoutBtnBg: '#101D3D',
  workoutBtnIcon: '#FFFFFF',
  workoutBtnBgInactive: '#F2F2F7',
  workoutBtnIconInactive: '#9E9EAD',
  workoutBtnBorder: '#E5E5EA',
};

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

function SocialStackNavigator() {
  return (
    <SocialStack.Navigator screenOptions={{ headerShown: false }}>
      <SocialStack.Screen name="SocialFeed" component={FeedScreen} />
      <SocialStack.Screen name="PublicProfile" component={PublicProfileRoute} />
      <SocialStack.Screen name="PostDetail" component={PostDetailRoute} />
    </SocialStack.Navigator>
  );
}

export default function AppTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_COLORS.barBg,
          borderTopColor: TAB_COLORS.barBorder,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Workout"
        component={WorkoutStack}
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
          tabBarButton: ({ children, onPress, accessibilityState }) => (
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.86}
              style={styles.workoutTabOuter}
            >
              <View
                style={[
                  styles.workoutTabButton,
                  accessibilityState?.selected
                    ? styles.workoutTabButtonActive
                    : styles.workoutTabButtonInactive,
                ]}
              >
                {children}
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="Routines"
        component={TrainingStack}
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Social"
        component={SocialStackNavigator}
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  workoutTabOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  workoutTabButton: {
    width: 76,
    minHeight: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  workoutTabButtonActive: {
    backgroundColor: TAB_COLORS.workoutBtnBg,
    borderColor: TAB_COLORS.workoutBtnBg,
  },
  workoutTabButtonInactive: {
    backgroundColor: TAB_COLORS.workoutBtnBgInactive,
    borderColor: TAB_COLORS.workoutBtnBorder,
  },
});
