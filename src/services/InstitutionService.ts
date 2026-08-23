import { apiClient } from './apiClient';
import { OfflineQueueService } from './OfflineQueueService';

export interface InstitutionRegistrationResponse {
  id: string;
}

export interface ValidateInstitutionPayload {
  fileName: string;
  rows: any[][];
}

export interface ValidateInstitutionResponse {
  previewData: any[];
  errors: string[];
}

export class InstitutionService {
  static async validateInstitutionFile(payload: ValidateInstitutionPayload): Promise<ValidateInstitutionResponse> {
    return apiClient.post<ValidateInstitutionPayload, ValidateInstitutionResponse>('validateInstitutionFile', payload);
  }

  static async submitInstitution(participants: any[], skipOfflineQueue = false): Promise<InstitutionRegistrationResponse> {
    if (!navigator.onLine && !skipOfflineQueue) {
      console.log('App is offline, saving institution registration to queue...');
      const localId = await OfflineQueueService.enqueueRegistration(participants as any, 'institution');
      return { id: localId };
    }

    try {
      return await apiClient.post<any[], InstitutionRegistrationResponse>('submitInstitution', participants);
    } catch (error) {
      if (!skipOfflineQueue && (error instanceof TypeError || error.name === 'TypeError' || error.message.includes('fetch'))) {
        console.log('Network request failed, saving institution registration to queue...', error);
        const localId = await OfflineQueueService.enqueueRegistration(participants as any, 'institution');
        return { id: localId };
      }
      throw error;
    }
  }
}
