import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  SpecialtyCatalogEntry,
  MyStatusResponse,
  FileInfo,
  CertificateInput,
} from '../types/trainer-verification';

export function useSpecialtyCatalog() {
  return useQuery<SpecialtyCatalogEntry[]>({
    queryKey: ['trainer-verification', 'specialties'],
    queryFn: () =>
      apiClient
        .get<{ specialties: SpecialtyCatalogEntry[] }>(
          API_ENDPOINTS.trainerVerification.specialties,
        )
        .then((res) => res.specialties),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useMyVerificationStatus() {
  return useQuery<MyStatusResponse>({
    queryKey: ['trainer-verification', 'my-status'],
    queryFn: () =>
      apiClient.get<MyStatusResponse>(
        API_ENDPOINTS.trainerVerification.myStatus,
      ),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60 * 2, // refetch every 2 minutes
  });
}

function buildFormData(input: {
  specialtyKeys: string[];
  yearsOfExperience: number;
  shortBio: string;
  idDocumentNumber: string;
  idDocuments: { documentType: string; file: FileInfo }[];
  certificates: { name: string; issuingOrganization: string; file: FileInfo }[];
}): FormData {
  const formData = new FormData();

  formData.append('specialtyKeys', JSON.stringify(input.specialtyKeys));
  formData.append('yearsOfExperience', String(input.yearsOfExperience));
  formData.append('shortBio', input.shortBio);
  formData.append('idDocumentNumber', input.idDocumentNumber);
  formData.append(
    'idDocumentTypes',
    JSON.stringify(input.idDocuments.map((d) => d.documentType)),
  );

  input.idDocuments.forEach((doc) => {
    formData.append('idDocuments', {
      uri: doc.file.uri,
      name: doc.file.name,
      type: doc.file.type,
    } as unknown as Blob);
  });

  const certMeta: CertificateInput[] = input.certificates.map((c) => ({
    name: c.name,
    issuingOrganization: c.issuingOrganization,
  }));
  formData.append('certificates', JSON.stringify(certMeta));

  input.certificates.forEach((cert) => {
    formData.append('certificateDocuments', {
      uri: cert.file.uri,
      name: cert.file.name,
      type: cert.file.type,
    } as unknown as Blob);
  });

  return formData;
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation<
    { verificationId: string; status: 'pending' },
    Error,
    {
      specialtyKeys: string[];
      yearsOfExperience: number;
      shortBio: string;
      idDocumentNumber: string;
      idDocuments: { documentType: string; file: FileInfo }[];
      certificates: { name: string; issuingOrganization: string; file: FileInfo }[];
    }
  >({
    mutationFn: (input) => {
      const formData = buildFormData(input);
      return apiClient.postMultipart<{ verificationId: string; status: 'pending' }>(
        API_ENDPOINTS.trainerVerification.submit,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-verification', 'my-status'] });
    },
  });
}

export function useUpdateVerification() {
  const queryClient = useQueryClient();

  return useMutation<
    { verificationId: string; status: 'pending' },
    Error,
    {
      specialtyKeys?: string[];
      yearsOfExperience?: number;
      shortBio?: string;
      idDocumentNumber?: string;
      idDocuments?: { documentType: string; file: FileInfo }[];
      certificates?: { name: string; issuingOrganization: string; file: FileInfo }[];
    }
  >({
    mutationFn: (input) => {
      const formData = new FormData();

      if (input.specialtyKeys) {
        formData.append('specialtyKeys', JSON.stringify(input.specialtyKeys));
      }
      if (input.yearsOfExperience !== undefined) {
        formData.append('yearsOfExperience', String(input.yearsOfExperience));
      }
      if (input.shortBio) {
        formData.append('shortBio', input.shortBio);
      }
      if (input.idDocumentNumber) {
        formData.append('idDocumentNumber', input.idDocumentNumber);
      }
      if (input.idDocuments?.length) {
        formData.append(
          'idDocumentTypes',
          JSON.stringify(input.idDocuments.map((d) => d.documentType)),
        );
        input.idDocuments.forEach((doc) => {
          formData.append('idDocuments', {
            uri: doc.file.uri,
            name: doc.file.name,
            type: doc.file.type,
          } as unknown as Blob);
        });
      }
      if (input.certificates?.length) {
        const certMeta: CertificateInput[] = input.certificates.map((c) => ({
          name: c.name,
          issuingOrganization: c.issuingOrganization,
        }));
        formData.append('certificates', JSON.stringify(certMeta));
        input.certificates.forEach((cert) => {
          formData.append('certificateDocuments', {
            uri: cert.file.uri,
            name: cert.file.name,
            type: cert.file.type,
          } as unknown as Blob);
        });
      }

      return apiClient.patchMultipart<{ verificationId: string; status: 'pending' }>(
        API_ENDPOINTS.trainerVerification.update,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-verification', 'my-status'] });
    },
  });
}
