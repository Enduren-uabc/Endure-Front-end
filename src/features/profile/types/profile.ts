import type { VerificationStatus } from '@/features/trainer-verification/types/trainer-verification';

export type ProfileActionKey =
  | 'routines'
  | 'history'
  | 'achievements'
  | 'measurements'
  | 'settings'
  | 'help'
  | 'logout';

export type TrainerApplicationCardStatus =
  | 'not_applied'
  | 'in_review'
  | 'approved'
  | 'rejected';

export interface ProfileMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
}

export interface ClientProfileViewModel {
  displayName: string;
  email: string;
  handle: string;
  bio: string;
  avatarInitials: string;
  metrics: ProfileMetric[];
}

export interface ProfileAction {
  key: ProfileActionKey;
  label: string;
  description: string;
  tone?: 'default' | 'danger';
}

export interface TrainerApplicationCard {
  status: TrainerApplicationCardStatus;
  title: string;
  description: string;
  actionLabel?: string;
  rejectionReason?: string;
}

export interface TrainerProfessionalProfile {
  displayName: string;
  email: string;
  handle: string;
  avatarInitials: string;
  specialty: string;
  bio: string;
  yearsOfExperience: string;
  certifications: string[];
  metrics: ProfileMetric[];
}

export interface EditableProfileInput {
  displayName: string;
  bio: string;
}

export function mapTrainerApplicationStatus(
  status?: VerificationStatus,
): TrainerApplicationCardStatus {
  if (status === 'pending') return 'in_review';
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'not_applied';
}
