export interface PrivacyNotice {
  version: string;
  updatedAt: string;
  content: string;
  contentHash?: string;
}

export interface LocalPrivacyNoticeCopy {
  version: string;
  updatedAt: string;
  content: string;
  storedAt: string;
  contentHash?: string;
}
