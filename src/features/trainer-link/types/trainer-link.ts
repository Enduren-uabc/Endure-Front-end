export type LinkRequestStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
export type LinkStatus = 'active' | 'inactive';

export interface TrainerSearchResult {
  userId: string;
  trainerCode: string;
  displayName: string;
  specialties: string[];
  yearsOfExperience: number;
  shortBio: string | null;
  profileImageUrl: string | null;
}

export interface LinkRequest {
  id: string;
  clientId: string;
  trainerId: string;
  trainerName: string;
  trainerCode: string;
  trainerSpecialties: string[];
  clientName: string;
  status: LinkRequestStatus;
  message: string | null;
  rejectionReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface ActiveLink {
  id: string;
  linkedUserId: string;
  linkedUserName: string;
  linkedUserSpecialties?: string[];
  linkedUserCode?: string;
  linkedUserBio?: string;
  activatedAt: string;
}

export interface ActiveTrainerResponse {
  hasTrainer: boolean;
  trainer: {
    trainerId: string;
    trainerCode: string | null;
    displayName: string;
    specialties: string[];
    yearsOfExperience: number;
    shortBio: string | null;
    profileImageUrl: string | null;
    activatedAt: string;
    linkId: string;
  } | null;
}

export interface SendLinkRequestInput {
  trainerId: string;
  message?: string;
}

export interface AcceptLinkResponse {
  requestId: string;
  linkId: string;
  status: string;
  activatedAt: string;
}

export interface SearchTrainersParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ActiveClient {
  linkId: string;
  clientId: string;
  clientName: string;
  linkStatus: string;
  activatedAt: string;
}

export interface ClientGeneralInfo {
  clientName: string;
  activeRoutineName: string | null;
}

export interface RecentSession {
  sessionId: string;
  date: string;
  routineName: string;
  durationMinutes: number | null;
}

export interface BasicIndicators {
  lastSessionDate: string | null;
  completedSessionsCount: number;
}

export interface ClientProgress {
  generalInfo: ClientGeneralInfo;
  recentSessions: RecentSession[];
  indicators: BasicIndicators;
}

export interface ExerciseProgressRecord {
  sessionId: string;
  date: string;
  weightUsed: number;
  repsPerformed: number;
  setsCompleted: number;
  totalSets: number;
}

export interface ExerciseProgressResponse {
  sufficientData: boolean;
  exerciseId: string;
  exerciseName: string;
  records: ExerciseProgressRecord[];
  message: string | null;
}

export type AssignedRoutineStatus = 'active' | 'inactive' | 'replaced';

export interface ExerciseSnapshot {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

export interface ExerciseDetailItem {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

export interface DayDetailItem {
  dayOfWeek: string;
  exercises: ExerciseDetailItem[];
}

export interface AssignedRoutineDetail {
  id: string;
  routineId: string;
  routineName: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  status: AssignedRoutineStatus;
  assignedAt: string;
  notes: string | null;
  originLabel: string;
  days: DayDetailItem[];
}

export interface RoutineSnapshot {
  name: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  exercises: ExerciseSnapshot[];
}

export interface AssignedRoutine {
  id: string;
  clientId: string;
  trainerId: string;
  routineId: string;
  routineSnapshot: RoutineSnapshot;
  status: AssignedRoutineStatus;
  assignedAt: string;
  notes: string | null;
  replacedById: string | null;
}

export interface AssignedRoutineListItem {
  id: string;
  routineId: string;
  routineName: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  status: AssignedRoutineStatus;
  assignedAt: string;
  notes: string | null;
  exerciseCount: number;
  originLabel?: string;
}

export interface MyAssignedRoutineItem {
  id: string;
  routineId: string;
  routineName: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  status: AssignedRoutineStatus;
  assignedAt: string;
  notes: string | null;
  originLabel: string;
  exercises: ExerciseSnapshot[];
}

export interface AssignRoutineInput {
  routineId: string;
  notes?: string;
}

export interface ReplaceRoutineInput {
  newRoutineId: string;
  notes?: string;
}

export interface UpdateNotesInput {
  notes: string;
}

export interface EditRoutineContentInput {
  name?: string;
  days?: Array<{
    dayOfWeek: string;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      restSeconds: number;
      order: number;
    }>;
  }>;
}

export interface AssignableRoutineItem {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  exerciseCount: number;
  isActive: boolean;
}
