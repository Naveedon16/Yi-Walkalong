import re

with open('src/services/AdminService.ts', 'r') as f:
    content = f.read()

new_method = """  static async checkInParticipant(registrationId: string): Promise<any> {
    const session = this.getSession() as any;
    const response = await apiClient.post<any, any>('checkInParticipant', { 
      registrationId, 
      adminId: session ? session.email : 'Unknown',
      token: session?.token 
    });
    if (response && response.error) {
      throw new Error(response.error);
    }
    return response;
  }
"""

content = content.replace("static async logScan", new_method + "  static async logScan")

with open('src/services/AdminService.ts', 'w') as f:
    f.write(content)

with open('src/pages/RegistrationStatus.tsx', 'r') as f:
    status_content = f.read()

# In RegistrationStatus.tsx, when an admin scans a QR code, we should call checkInParticipant
old_scan_flow = """            if (isAdmin) {
              AdminService.logScan(scannedId).then(() => {
                AdminService.getScanHistory().then(setScanHistory).catch(console.error);
              }).catch(console.error);
            }"""

new_scan_flow = """            if (isAdmin) {
              AdminService.checkInParticipant(scannedId).then((res) => {
                setLiveAnnouncement(`Registration ID ${scannedId} checked in successfully.`);
                AdminService.getScanHistory().then(setScanHistory).catch(console.error);
              }).catch(err => {
                console.error(err);
                // Fallback to log scan if checkInParticipant fails for some reason
                AdminService.logScan(scannedId).catch(console.error);
              });
            }"""

status_content = status_content.replace(old_scan_flow, new_scan_flow)

with open('src/pages/RegistrationStatus.tsx', 'w') as f:
    f.write(status_content)
print("Rewrote frontend files")
