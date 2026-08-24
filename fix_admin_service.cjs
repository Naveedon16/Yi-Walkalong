const fs = require('fs');
let code = fs.readFileSync('src/services/AdminService.ts', 'utf8');

code = code.replace(
  /static async checkInParticipant\(registrationId: string, skipOfflineQueue = false\): Promise<any> \{[\s\S]*?static async logScan/m,
  `static async checkInParticipant(registrationId: string, skipOfflineQueue = false): Promise<any> {
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

  static async logScan`
);

fs.writeFileSync('src/services/AdminService.ts', code);
