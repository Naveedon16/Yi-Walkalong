import { apiClient } from './apiClient';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'VOLUNTEER';
  active: boolean;
}

export interface Participant {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  status?: string;
  tshirtSize?: string;
  type?: 'INDIVIDUAL' | 'INSTITUTION';
  source?: 'INDIVIDUAL' | 'INSTITUTION';
  institutionId?: string;
  institutionName?: string;
  [key: string]: any;
}

export interface AdminStatistics extends DashboardStats {}
export interface RegistrationSummary extends DashboardStats {}

export interface StatusUpdateRequest {
  id: string;
  status: string;
}

export interface StatusUpdateResponse {
  success: boolean;
  message?: string;
  registrationId?: string;
  status?: string;
  error?: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalParticipants: number;
  individualRegistrations: number;
  institutionRegistrations: number;
  pwdParticipants: number;
  pendingValidation: number;
  confirmedRegistrations: number;
  bandsAssigned: number;
  bandsPending: number;
  byCategory: Record<string, number>;
  individualCategories?: Record<string, number>;
  institutionCategories?: Record<string, number>;
  byTshirtSize: Record<string, number>;
  byInstitution: Record<string, number>;
  trends?: Array<{
    date: string;
    individual: number;
    institution: number;
    participants: number;
  }>;
}

const ADMIN_SESSION_KEY = 'walkalong-admin-session';

import { AdminAuthService } from './AdminAuthService';


export interface ScanHistoryEntry {
  registrationId: string;
  timestamp: string;
  adminId: string;
  type?: string;
}

export interface BulkStatusUpdateResponse {
  success: boolean;
  updatedCount?: number;
  updated?: string[];
  failed?: string[];
  failedIds?: string[];
  error?: string;
}

export class AdminService {
  static getSession(): AdminUser | null {
    return AdminAuthService.getSession() as AdminUser | null;
  }

  static async login(email: string): Promise<AdminUser> {
    const response = await apiClient.post<{ email: string }, any>('adminLogin', { email });
    
    // Check structured response from backend
    if (response && response.success && response.admin) {
      AdminAuthService.login(response.admin);
      return response.admin;
    }
    
    // Handle specific error from backend if available
    if (response && response.error) {
       throw new Error(response.error);
    }
    
    // Fallback error
    throw new Error('Invalid admin credentials.');
  }

  static logout(): void {
    AdminAuthService.logout();
  }


  static async getParticipants(): Promise<Participant[]> {
    const session = this.getSession() as any;
    const response = await apiClient.post<any, { participants: Participant[] }>('getParticipants', { token: session?.token });
    return response.participants;
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    const session = this.getSession() as any;
    return apiClient.post<any, DashboardStats>('getDashboardStats', { token: session?.token });
  }

  static async updateStatus(id: string, status: string): Promise<StatusUpdateResponse> {
    const session = this.getSession() as any;
    // Send both id and registrationId to be safe
    const response = await apiClient.post<any, any>('updateStatus', { id, registrationId: id, status, token: session?.token });
    if (response && response.error) {
      throw new Error(response.error);
    }
    if (response && response.success === false) {
      throw new Error('Failed to update status');
    }
    return response;
  }

  static async updateStatuses(registrationIds: string[], status: string): Promise<BulkStatusUpdateResponse> {
    const session = this.getSession() as any;
    const response = await apiClient.post<any, any>('updateStatuses', { registrationIds, status, token: session?.token });
    if (response && response.error) {
      throw new Error(response.error);
    }
    return response;
  }

    static async checkInParticipant(registrationId: string, skipOfflineQueue = false): Promise<any> {
    const session = this.getSession() as any;
    
    if (!navigator.onLine && !skipOfflineQueue) {
      console.log('App is offline, saving check-in to queue...');
      const { OfflineQueueService } = await import('./OfflineQueueService');
      const adminId = session ? session.email : 'Unknown';
      await OfflineQueueService.enqueueCheckIn(registrationId, adminId);
      return { 
        success: true, 
        participant: { 
          id: registrationId, 
          name: 'Pending Sync',
          category: 'Offline',
          tshirtSize: 'Queued'
        },
        offline: true 
      };
    }

    let response;
    try {
      response = await apiClient.post<any, any>('checkInParticipant', {
        registrationId,
        adminId: session ? session.email : 'Unknown',
        token: session?.token
      });
    } catch (error: any) {
      if (!skipOfflineQueue && (error instanceof TypeError || error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Unable to connect'))) {
        console.log('Network request failed, saving check-in to queue...', error);
        const { OfflineQueueService } = await import('./OfflineQueueService');
        const adminId = session ? session.email : 'Unknown';
        await OfflineQueueService.enqueueCheckIn(registrationId, adminId);
        return { 
          success: true, 
          participant: { 
            id: registrationId, 
            name: 'Pending Sync',
            category: 'Offline',
            tshirtSize: 'Queued'
          },
          offline: true 
        };
      }
      throw error;
    }
    
    if (response && response.error) {
      throw new Error(response.error);
    }
    return response;
  }

  static async logScan(registrationId: string): Promise<void> {
    const session = this.getSession() as any;
    await apiClient.post<any, any>('logScan', { 
      registrationId, 
      adminId: session ? session.email : 'Unknown',
      token: session?.token
    });
  }

  static async getScanHistory(): Promise<ScanHistoryEntry[]> {
    const session = this.getSession() as any;
    const response = await apiClient.post<any, { history: ScanHistoryEntry[] }>('getScanHistory', { token: session?.token });
    return response.history || [];
  }
}
