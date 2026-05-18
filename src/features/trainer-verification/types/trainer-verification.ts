export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type DocumentType = 'ine_front' | 'ine_back' | 'passport' | 'other';

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
}

export interface CertificateInput {
  name: string;
  issuingOrganization: string;
}

export interface CoachFormData {
  specialtyKeys: string[];
  yearsOfExperience: number;
  shortBio: string;
  idDocumentNumber: string;
  idDocuments: { documentType: DocumentType; file: FileInfo }[];
  certificates: { name: string; issuingOrganization: string; file: FileInfo }[];
}

export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
