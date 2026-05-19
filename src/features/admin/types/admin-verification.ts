export type AdvancedStatus =
  | 'draft'
  | 'certificate_uploaded'
  | 'certificate_extraction_pending'
  | 'certificate_extracted'
  | 'certificate_extraction_failed'
  | 'id_uploaded'
  | 'id_extraction_pending'
  | 'id_extracted'
  | 'id_extraction_failed'
  | 'identity_compared'
  | 'risk_calculated'
  | 'manual_review_pending'
  | 'manual_review_in_progress'
  | 'correction_required'
  | 'approved'
  | 'rejected'
  | 'blocked_for_risk';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PendingVerificationItem {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  submittedAt: string;
  specialties: string[];
  advancedStatus?: string;
  riskLevel?: RiskLevel;
  riskScore?: number;
}

export interface PendingVerificationsResponse {
  verifications: PendingVerificationItem[];
  total: number;
}

export interface SpecialtyItem {
  key: string;
  displayName: string;
  category: string;
}

export interface IdDocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  signedUrl?: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuingOrganization: string;
  fileName: string;
  fileSize: number;
  signedUrl?: string;
}

export interface ExtractedCertData {
  fullName: string;
  certificateName: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  folioNumber?: string;
  qrUrl?: string;
  ocrConfidence: number;
}

export interface ExtractedIdData {
  fullName: string;
  documentType: string;
  issuingCountry?: string;
  birthDate?: string;
  expirationDate?: string;
  documentIdentifier?: string;
  ocrConfidence: number;
}

export interface ScoringResult {
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedAction: string;
  summary: string;
  positiveSignals: string[];
  alerts: { code: string; severity: string; message: string }[];
  overrides: string[];
}

export interface StatusChangeItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actorId: string;
  actorType: string;
  reason?: string;
  createdAt: string;
}

export interface AuditEventItem {
  id: string;
  eventType: string;
  actorId: string;
  actorType: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface VerificationDetailResponse {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  status: 'pending' | 'approved' | 'rejected';
  specialties: SpecialtyItem[];
  yearsOfExperience: number;
  shortBio: string;
  idDocumentNumber: string;
  idDocuments: IdDocumentItem[];
  certificates: CertificateItem[];
  rejectionReason: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedReviewerId?: string | null;
  advancedStatus?: AdvancedStatus;
  extractedCertificateData?: ExtractedCertData | null;
  extractedIdData?: ExtractedIdData | null;
  scoringResult?: ScoringResult | null;
  statusHistory?: StatusChangeItem[];
  auditEvents?: AuditEventItem[];
}

export interface ReviewInput {
  decision: 'approved' | 'rejected' | 'correction_required';
  rejectionReason?: string;
  internalComment?: string;
  userVisibleMessage?: string;
  correctionType?: 'certificate' | 'id_document' | 'liveness' | 'other';
}

export interface ReviewResponse {
  verificationId: string;
  decision: string;
  legacyStatus: string;
  advancedStatus?: string;
}

export interface StartReviewResponse {
  verificationId: string;
  advancedStatus: string;
  assignedReviewerId: string;
}
