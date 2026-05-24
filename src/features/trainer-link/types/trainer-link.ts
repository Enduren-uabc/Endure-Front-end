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
