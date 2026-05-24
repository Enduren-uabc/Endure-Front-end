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
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    socialLogin: '/auth/social-login',
    socialExchangeCode: '/auth/social/exchange-code',
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
    addSet: (id: string, exerciseIndex: number) =>
      `/workout-sessions/${id}/exercises/${exerciseIndex}/sets`,
    removeSet: (id: string, exerciseIndex: number, setNumber: number) =>
      `/workout-sessions/${id}/exercises/${exerciseIndex}/sets/${setNumber}`,
    discard: (id: string) => `/workout-sessions/${id}/discard`,
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
  trainerLink: {
    search: (params: { q: string; page?: number; limit?: number }) =>
      `/trainers/search?q=${encodeURIComponent(params.q)}&page=${params.page ?? 1}&limit=${params.limit ?? 20}`,
    publicProfile: (trainerId: string) => `/trainers/${trainerId}/public-profile`,
    sendRequest: '/trainer-link-requests',
    sentRequests: (params?: { status?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      return `/trainer-link-requests/sent?${query.toString()}`;
    },
    cancelRequest: (id: string) => `/trainer-link-requests/${id}/cancel`,
    receivedRequests: (params?: { status?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      return `/trainer-link-requests/received?${query.toString()}`;
    },
    acceptRequest: (id: string) => `/trainer-link-requests/${id}/accept`,
    rejectRequest: (id: string) => `/trainer-link-requests/${id}/reject`,
    myTrainer: '/trainer-links/active',
    linkedClients: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      return `/trainer/clients?${query.toString()}`;
    },
    deactivateLink: (id: string) => `/trainer-links/${id}/deactivate`,
  },
  reminders: {
    list: '/training-reminders',
    create: '/training-reminders',
    edit: (id: string) => `/training-reminders/${id}`,
    delete: (id: string) => `/training-reminders/${id}`,
  },
  push: {
    registerToken: '/push/register-token',
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (id: string) => `/notifications/${id}/read`,
  },
  trainerVerification: {
    flowConfig: '/trainer-verification/flow-config',
    specialties: '/trainer-verification/specialties',
    myStatus: '/trainer-verification/my-status',
    submit: '/trainer-verification',
    update: '/trainer-verification',
    powerspikeDraft: '/trainer-verification/powerspike/draft',
    powerspikeCertificate: '/trainer-verification/powerspike/certificate',
    powerspikeCertificateConfirm: '/trainer-verification/powerspike/certificate/confirm',
    powerspikeIdDocument: '/trainer-verification/powerspike/id-document',
    powerspikeSubmit: '/trainer-verification/powerspike/submit',
    pending: '/trainer-verification/pending',
    detail: (id: string) => `/trainer-verification/${id}`,
    startReview: (id: string) => `/trainer-verification/${id}/start-review`,
    review: (id: string) => `/trainer-verification/${id}/review`,
  },
} as const;
