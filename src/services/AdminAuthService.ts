export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

const SESSION_KEY = 'walkalong_admin_session';

export const AdminAuthService = {
  getSession(): AdminSession | null {
    const data = localStorage.getItem(SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  login(sessionData: AdminSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    // Also remove the old one just in case
    localStorage.removeItem('walkalong-admin-session');
  }
};
