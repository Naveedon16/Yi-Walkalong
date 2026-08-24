/// <reference types="vite/client" />
const DIRECT_GAS_ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT;
const GAS_ENDPOINT = DIRECT_GAS_ENDPOINT || '/api/gas';

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const isConfigError = (msg: string) => {
  const lower = msg.toLowerCase();
  return lower.includes('invalid action') || 
         lower.includes('missing configuration') || 
         lower.includes('missing spreadsheet') || 
         lower.includes('spreadsheet_id') || 
         lower.includes('settings unavailable') || 
         lower.includes('google sheets configuration failure');
};

const DEFAULT_TIMEOUT_MS = 45000;

export const apiClient = {
  async post<T, R>(action: string, payload: T, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<R> {
    if (!GAS_ENDPOINT) {
      throw new ApiError('The registration service is temporarily unavailable. Please try again shortly.', 'CONFIGURATION_ERROR');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    let response;
    try {
      const isDirect = !!DIRECT_GAS_ENDPOINT;
      response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action, payload }),
        headers: {
          'Content-Type': isDirect ? 'text/plain;charset=utf-8' : 'application/json',
        },
        signal: controller.signal
      });
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new ApiError('The registration service is taking longer than expected. Please try again.', 'TIMEOUT_ERROR');
      }
      if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
        throw new ApiError('Unable to connect to the registration service. Please check your internet connection and try again.', 'NETWORK_ERROR');
      }
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
      }
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    if (data.error || data.success === false) {
      if (data.code === 'UNAUTHORIZED') {
        localStorage.removeItem('walkalong_admin_session');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') { window.location.href = '/admin/login'; }
      }
      const errorMsg = data.error || 'Unknown error occurred';
      if (isConfigError(errorMsg)) {
        throw new ApiError('The registration service is temporarily unavailable. Please try again shortly.', 'CONFIGURATION_ERROR');
      }
      throw new ApiError(errorMsg, data.code || 'APPLICATION_ERROR');
    }
    
    return data.result;
  },
  
  async get<R>(action: string, params?: Record<string, string>, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<R> {
    if (!GAS_ENDPOINT) {
      throw new ApiError('The registration service is temporarily unavailable. Please try again shortly.', 'CONFIGURATION_ERROR');
    }
    
    const url = new URL(GAS_ENDPOINT, window.location.origin);
    url.searchParams.append('action', action);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    let response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal
      });
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new ApiError('The registration service is taking longer than expected. Please try again.', 'TIMEOUT_ERROR');
      }
      if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
        throw new ApiError('Unable to connect to the registration service. Please check your internet connection and try again.', 'NETWORK_ERROR');
      }
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
      }
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new ApiError('Something went wrong while contacting the registration service. Please try again.', 'SERVER_ERROR');
    }
    
    if (data.error || data.success === false) {
      if (data.code === 'UNAUTHORIZED') {
        localStorage.removeItem('walkalong_admin_session');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') { window.location.href = '/admin/login'; }
      }
      const errorMsg = data.error || 'Unknown error occurred';
      if (isConfigError(errorMsg)) {
        throw new ApiError('The registration service is temporarily unavailable. Please try again shortly.', 'CONFIGURATION_ERROR');
      }
      throw new ApiError(errorMsg, data.code || 'APPLICATION_ERROR');
    }
    
    return data.result;
  }
};
