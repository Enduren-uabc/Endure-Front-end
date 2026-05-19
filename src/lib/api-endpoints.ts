export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    passwordRecovery: '/auth/password-recovery',
    passwordResetValidate: '/auth/password-reset/validate',
    passwordReset: '/auth/password-reset',
  },
  onboarding: {
    profile: '/onboarding/profile',
    status: '/onboarding/status',
  },
  profile: {
    get: '/profile',
    update: '/profile',
  },
  routines: {
    list: '/routines',
    detail: (id: string) => `/routines/${id}`,
    create: '/routines',
    addExercise: (routineId: string, dayOfWeek: string) =>
      `/routines/${routineId}/days/${dayOfWeek}/exercises`,
    removeExercise: (routineId: string, dayOfWeek: string, exerciseId: string) =>
      `/routines/${routineId}/days/${dayOfWeek}/exercises/${exerciseId}`,
    configureExercise: (routineId: string, dayOfWeek: string, exerciseId: string) =>
      `/routines/${routineId}/days/${dayOfWeek}/exercises/${exerciseId}`,
    activate: (id: string) => `/routines/${id}/activate`,
    deactivate: (id: string) => `/routines/${id}/deactivate`,
    delete: (id: string) => `/routines/${id}`,
    sync: (id: string) => `/routines/${id}/sync`,
    trainingStrategy: (id: string) => `/routines/${id}/training-strategy`,
    generateSets: (id: string) => `/routines/${id}/generate-sets`,
  },
  exercises: {
    catalog: '/exercises/catalog',
  },
  trainingStrategies: {
    list: '/training-strategies',
  },
  workoutSessions: {
    inProgress: '/workout-sessions/in-progress',
    create: '/workout-sessions',
    detail: (id: string) => `/workout-sessions/${id}`,
    history: '/workout-sessions/history',
    advanceExercise: (id: string) => `/workout-sessions/${id}/advance-exercise`,
    finish: (id: string) => `/workout-sessions/${id}/finish`,
    registerSet: (id: string, exerciseIndex: number, setNumber: number) =>
      `/workout-sessions/${id}/exercises/${exerciseIndex}/sets/${setNumber}`,
    completeSet: (id: string, exerciseIndex: number, setNumber: number) =>
      `/workout-sessions/${id}/exercises/${exerciseIndex}/sets/${setNumber}/complete`,
  },
  publications: {
    feed: '/publications',
    detail: (id: string) => `/publications/${id}`,
    reactions: (id: string) => `/publications/${id}/reactions`,
    comments: (id: string) => `/publications/${id}/comments`,
    comment: (commentId: string) => `/comments/${commentId}`,
  },
  socialProfiles: {
    search: '/profiles/search',
    detail: (userId: string) => `/profiles/${userId}`,
    publications: (userId: string) => `/profiles/${userId}/publications`,
    followers: (userId: string) => `/profiles/${userId}/followers`,
    following: (userId: string) => `/profiles/${userId}/following`,
    follow: (userId: string) => `/profiles/${userId}/follow`,
    me: '/profiles/me',
  },
  trainerVerification: {
    flowConfig: '/trainer-verification/flow-config',
    specialties: '/trainer-verification/specialties',
    myStatus: '/trainer-verification/my-status',
    submit: '/trainer-verification',
    update: '/trainer-verification',
  },
} as const;
