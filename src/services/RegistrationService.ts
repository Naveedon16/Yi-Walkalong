import { apiClient } from './apiClient';
import { RegistrationFormValues } from '../types';
import { OfflineQueueService } from './OfflineQueueService';

export interface RegistrationResponse {
  id?: string;
  isDuplicate?: boolean;
}

export class RegistrationService {
  static async submitIndividual(data: RegistrationFormValues & { forceSubmit?: boolean }, skipOfflineQueue = false): Promise<RegistrationResponse> {
    if (!navigator.onLine && !skipOfflineQueue) {
      console.log('App is offline, saving registration to queue...');
      const localId = await OfflineQueueService.enqueueRegistration(data, 'individual');
      return { id: localId };
    }

    try {
      return await apiClient.post<RegistrationFormValues & { forceSubmit?: boolean }, RegistrationResponse>('submitIndividual', data);
    } catch (error) {
      if (!skipOfflineQueue && (error instanceof TypeError || error.name === 'TypeError' || error.message.includes('fetch'))) {
        console.log('Network request failed, saving registration to queue...', error);
        const localId = await OfflineQueueService.enqueueRegistration(data, 'individual');
        return { id: localId };
      }
      throw error;
    }
  }
}
