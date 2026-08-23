import { apiClient } from './apiClient';
import { RegistrationStatus } from '../types';
import { OfflineQueueService } from './OfflineQueueService';

export interface StatusResponse {
  type?: 'individual' | 'institution' | 'institution_multiple';
  statuses?: RegistrationStatus[];
  institutionId?: string;
  institutionName?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  timestamp?: string;
  participantCount?: number;
  participants?: any[];
  matches?: any[];
}

const LOCAL_STORAGE_KEY = 'walkalong_offline_status_cache';

function getLocalCache(): Map<string, StatusResponse> {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Failed to parse local cache', e);
  }
  return new Map<string, StatusResponse>();
}

function saveLocalCache(cache: Map<string, StatusResponse>) {
  try {
    const obj = Object.fromEntries(cache.entries());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save local cache', e);
  }
}

const statusCache = getLocalCache();

export class StatusService {
  static normalizeQuery(query: string): string {
    const trimmed = query.trim();
    const phoneNormalized = trimmed.replace(/[\s\-()]/g, '');
    if (/^\d+$/.test(phoneNormalized)) {
      return phoneNormalized;
    }
    return trimmed.toLowerCase();
  }

  static async checkStatus(query: string): Promise<StatusResponse> {
    const normalized = this.normalizeQuery(query);
    
    // Check offline pending registrations first
    try {
      const pendingRegs = await OfflineQueueService.getPendingRegistrations();
      const match = pendingRegs.find(p => 
        p.id === normalized || 
        (p.type === 'individual' && (
          this.normalizeQuery(p.data.phone) === normalized || 
          this.normalizeQuery(p.data.email) === normalized
        ))
      );
      
      if (match && match.type === 'individual') {
        const data = match.data as any;
        return {
          type: 'individual',
          statuses: [{
            id: match.id,
            status: 'Pending Sync (Offline)',
            details: data
          }]
        };
      }
    } catch (e) {
      console.error('Failed to check offline queue', e);
    }

    try {
      const response = await apiClient.get<StatusResponse>('checkStatus', { query: normalized });
      
      // Cache successful lookups that found results
      if (response && (response.statuses || response.type === 'institution')) {
        statusCache.set(normalized, response);
        saveLocalCache(statusCache);
      }
      
      return response;
    } catch (error) {
      // If network fails, try to return from cache
      if (statusCache.has(normalized)) {
        return statusCache.get(normalized)!;
      }
      throw error;
    }
  }
  
  static async sendRegistrationPass(registrationId: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ registrationId: string }, { success: boolean; message?: string }>('sendRegistrationPass', { registrationId });
  }

  static clearCache() {
    statusCache.clear();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
