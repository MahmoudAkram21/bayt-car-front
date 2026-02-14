import api from './api';

export interface SystemSettings {
  [key: string]: string;
}

export const systemSettingsService = {
  getSettings: async () => {
    const response = await api.get<SystemSettings>('/system-settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    const response = await api.put<SystemSettings>('/system-settings', settings);
    return response.data;
  },
};
