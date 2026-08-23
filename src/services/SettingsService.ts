import { apiClient } from './apiClient';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface SettingsResponse {
  isOpen: boolean;
  eventDate: string;
  categories: DropdownOption[];
  tshirtSizes: DropdownOption[];
  disabilityTypes: DropdownOption[];
  genders: DropdownOption[];
}

let cachedSettings: SettingsResponse | null = null;

export class SettingsService {
  static async getSettings(): Promise<SettingsResponse> {
    if (cachedSettings) return cachedSettings;
    cachedSettings = await apiClient.get<SettingsResponse>('getSettings');
    return cachedSettings;
  }
}
