export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type DocumentType = 'ine_front' | 'ine_back' | 'passport' | 'other';

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

export type ExtractionStatus = 'pending' | 'extracted' | 'failed' | null;

export interface FlowConfigResponse {
  powerspike: boolean;
  flowMode: 'legacy' | 'powerspike';
}

export interface SpecialtyCatalogEntry {
  key: string;
  displayName: string;
  category: string;
  iconUrl: string | null;
}

export interface MyStatusResponse {
  verificationId: string | null;
  status: VerificationStatus;
  rejectionReason?: string;
  specialties?: string[];
  yearsOfExperience?: number;
  shortBio?: string;
  advancedStatus?: AdvancedStatus;
  certificateExtractionStatus?: ExtractionStatus;
  idExtractionStatus?: ExtractionStatus;
  extractedCertificateInfo?: {
    fullName: string;
    name: string;
    institution: string;
    certifyingInstitution?: string;
    issueDate?: string;
    expirationDate?: string;
    folioNumber?: string;
    qrUrl?: string;
    ocrConfidence: number;
    curp?: string;
    competencyStandardCode?: string;
    competencyStandardName?: string;
  };
  extractedIdInfo?: {
    fullName: string;
    documentType: string;
    issuingCountry?: string;
    birthDate?: string;
    expirationDate?: string;
    documentIdentifier?: string;
    ocrConfidence: number;
    curp?: string;
  };
  riskLevel?: string;
  riskScore?: number;
  riskAlerts?: { code: string; severity: string; message: string }[];
}

export interface PowerspikeDraftResponse {
  verificationId: string;
  advancedStatus: 'draft';
}

export interface PowerspikeUploadResponse {
  verificationId: string;
  advancedStatus: string;
}

export interface PowerspikeSubmitResponse {
  verificationId: string;
  advancedStatus: string;
  legacyStatus: string;
}

export interface CertificateInput {
  name: string;
  issuingOrganization: string;
}

export interface CoachFormData {
  specialtyKeys: string[];
  yearsOfExperience: number;
  shortBio: string;
  idDocumentNumber?: string;
  idDocuments: { documentType: DocumentType; file: FileInfo }[];
  certificates: { name: string; issuingOrganization: string; file: FileInfo }[];
}

export interface ConfirmCertificateInput {
  certificateName: string;
  issuingOrganization: string;
}

export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
