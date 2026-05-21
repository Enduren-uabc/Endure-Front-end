import type { RootStackParamList } from './types';

export type AppRole = 'user' | 'trainer' | 'admin';

export type RoleRoutingConfig = {
  rootAppRoute: keyof RootStackParamList;
  requiresOnboarding: boolean;
};

export const ROLE_ROUTING_CONFIG: Record<AppRole, RoleRoutingConfig> = {
  user: {
    rootAppRoute: 'UserApp',
    requiresOnboarding: true,
  },
  trainer: {
    rootAppRoute: 'TrainerApp',
    requiresOnboarding: false,
  },
  admin: {
    rootAppRoute: 'AdminApp',
    requiresOnboarding: false,
  },
};

export function getRoleConfig(role: string | null): RoleRoutingConfig | null {
  if (!role) return null;
  if (role in ROLE_ROUTING_CONFIG) {
    return ROLE_ROUTING_CONFIG[role as AppRole];
  }
  return null;
}
