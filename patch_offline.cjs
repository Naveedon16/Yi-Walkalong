const fs = require('fs');
let code = fs.readFileSync('src/services/OfflineQueueService.ts', 'utf8');

code = code.replace(
  /interface WalkAlongDB extends DBSchema \{/m,
  `interface WalkAlongDB extends DBSchema {
  checkins: {
    key: string;
    value: {
      id: string; // unique local scan id
      registrationId: string;
      adminId: string;
      timestamp: number;
    };
  };`
);

code = code.replace(
  /upgrade\(db\) \{[\s\S]*?      \}/m,
  `upgrade(db) {
      if (!db.objectStoreNames.contains('registrations')) {
        db.createObjectStore('registrations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('checkins')) {
        db.createObjectStore('checkins', { keyPath: 'id' });
      }
    }`
);

code = code.replace(
  /static async enqueueRegistration/m,
  `static async enqueueCheckIn(registrationId: string, adminId: string): Promise<string> {
    const db = await dbPromise;
    if (!db) throw new Error('IndexedDB not supported');
    const localId = \`SCN-\${Math.random().toString(36).substring(2, 9).toUpperCase()}\`;
    await db.put('checkins', {
      id: localId,
      registrationId,
      adminId,
      timestamp: Date.now(),
    });
    this.registerSync();
    return localId;
  }
  
  static async getPendingCheckIns() {
    const db = await dbPromise;
    if (!db) return [];
    return db.getAll('checkins');
  }

  static async enqueueRegistration`
);

code = code.replace(
  /static async syncPendingRegistrations\(\) \{[\s\S]*?console\.log\(\`Attempting to sync \$\{pending\.length\} pending registrations\.\.\.\`\);/m,
  `static async syncPendingRegistrations() {
    if (!navigator.onLine) return;
    const db = await dbPromise;
    if (!db) return;
    
    // Sync check-ins
    const checkins = await db.getAll('checkins');
    if (checkins.length > 0) {
      console.log(\`Attempting to sync \${checkins.length} pending checkins...\`);
      const { AdminService } = await import('./AdminService');
      for (const record of checkins) {
        try {
          // This will throw if ALREADY_CHECKED_IN, which is fine, we want to resolve it
          await AdminService.checkInParticipant(record.registrationId, true);
          await db.delete('checkins', record.id);
          console.log(\`Synced offline check-in for: \${record.registrationId}\`);
        } catch (err: any) {
          if (err.message === 'ALREADY_CHECKED_IN' || err.message === 'Registration not found') {
            await db.delete('checkins', record.id);
          } else {
            console.error(\`Failed to sync check-in \${record.id}\`, err);
          }
        }
      }
    }
    
    const pending = await db.getAll('registrations');
    if (pending.length === 0) return;
    console.log(\`Attempting to sync \${pending.length} pending registrations...\`);`
);

fs.writeFileSync('src/services/OfflineQueueService.ts', code);
