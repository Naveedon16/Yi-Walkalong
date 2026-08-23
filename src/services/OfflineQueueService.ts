import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { RegistrationFormValues } from '../types';

interface WalkAlongDB extends DBSchema {
  registrations: {
    key: string;
    value: {
      id: string; // temporary local ID
      data: RegistrationFormValues;
      type: 'individual' | 'institution';
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<WalkAlongDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<WalkAlongDB>('walkalong-offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('registrations')) {
        db.createObjectStore('registrations', { keyPath: 'id' });
      }
    },
  });
}

export class OfflineQueueService {
  static async enqueueRegistration(data: RegistrationFormValues, type: 'individual' | 'institution'): Promise<string> {
    const db = await dbPromise;
    if (!db) throw new Error('IndexedDB not supported');
    
    // Generate a temporary local ID
    const localId = `OFF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    await db.put('registrations', {
      id: localId,
      data,
      type,
      timestamp: Date.now(),
    });
    
    // Attempt sync in background, this won't block since we are offline, but it's good practice
    this.registerSync();
    
    return localId;
  }
  
  static async getPendingRegistrations() {
    const db = await dbPromise;
    if (!db) return [];
    return db.getAll('registrations');
  }
  
  static async getPendingRegistrationById(id: string) {
    const db = await dbPromise;
    if (!db) return null;
    return db.get('registrations', id);
  }
  
  static async removePendingRegistration(id: string) {
    const db = await dbPromise;
    if (!db) return;
    await db.delete('registrations', id);
  }

  static async syncPendingRegistrations() {
    if (!navigator.onLine) return;
    
    const db = await dbPromise;
    if (!db) return;
    
    const pending = await db.getAll('registrations');
    if (pending.length === 0) return;

    console.log(`Attempting to sync ${pending.length} pending registrations...`);
    
    const { RegistrationService } = await import('./RegistrationService');
    const { InstitutionService } = await import('./InstitutionService');

    for (const record of pending) {
      try {
        if (record.type === 'individual') {
          await RegistrationService.submitIndividual(record.data, true); // true = skip offline queue on this internal call
        } else if (record.type === 'institution') {
          await InstitutionService.submitInstitution(record.data as any, true);
        }
        await db.delete('registrations', record.id);
        console.log(`Synced offline registration: ${record.id}`);
      } catch (err) {
        console.error(`Failed to sync registration ${record.id}`, err);
      }
    }
  }

  static registerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration: any) => {
        try {
          registration.sync.register('sync-registrations');
        } catch (err) {
          console.error('Background sync could not be registered', err);
        }
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    OfflineQueueService.syncPendingRegistrations();
  });
}
