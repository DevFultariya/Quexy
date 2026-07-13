/* =============================================
   Quexy — API Client
   Centralized API communication layer with Auth
   ============================================= */

import type {
  APIResponse,
  ConnectionStatus,
  QueryResponse,
  QueryHistoryItem,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Token helper getters/setters
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('quexy_token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('quexy_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('quexy_token');
  }
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('quexy_username');
}

export function setUsername(name: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('quexy_username', name);
  }
}

export function removeUsername() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('quexy_username');
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.detail || data.error || 'An error occurred',
      response.status
    );
  }

  return data;
}

// --- User Authentication ---

export async function registerUser(config: Record<string, string>): Promise<APIResponse<{ token: string; username: string }>> {
  return request<APIResponse<{ token: string; username: string }>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function loginUser(config: Record<string, string>): Promise<APIResponse<{ token: string; username: string }>> {
  return request<APIResponse<{ token: string; username: string }>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getMe(): Promise<APIResponse<{ id: string; username: string; email: string }>> {
  return request<APIResponse<{ id: string; username: string; email: string }>>('/auth/me');
}

// --- Data Source Ingestion & Profiles ---

export async function uploadFile(file: File): Promise<APIResponse<ConnectionStatus>> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE}/datasource/upload`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new APIError(data.detail || 'Upload failed', response.status);
  }
  return data;
}

export async function connectDatabase(config: Record<string, any>): Promise<APIResponse<ConnectionStatus>> {
  return request<APIResponse<ConnectionStatus>>('/datasource/connect', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getSavedConnections(): Promise<APIResponse<any[]>> {
  return request<APIResponse<any[]>>('/datasource/saved');
}

export async function activateConnection(id: string): Promise<APIResponse<ConnectionStatus>> {
  return request<APIResponse<ConnectionStatus>>(`/datasource/${id}/activate`, {
    method: 'POST',
  });
}

export async function deleteConnection(id: string): Promise<APIResponse<any>> {
  return request<APIResponse<any>>(`/datasource/${id}`, {
    method: 'DELETE',
  });
}

export async function getConnectionStatus(): Promise<APIResponse<ConnectionStatus>> {
  return request<APIResponse<ConnectionStatus>>('/datasource/status');
}

export async function getSchema(): Promise<APIResponse<any>> {
  return request<APIResponse<any>>('/datasource/schema');
}

export async function disconnectDataSource(): Promise<APIResponse<any>> {
  return request<APIResponse<any>>('/datasource/disconnect', {
    method: 'DELETE',
  });
}

// --- Query Routing ---

export async function submitQuery(
  question: string
): Promise<APIResponse<QueryResponse>> {
  return request<APIResponse<QueryResponse>>('/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function getQueryHistory(): Promise<APIResponse<QueryHistoryItem[]>> {
  return request<APIResponse<QueryHistoryItem[]>>('/query/history');
}

export async function getQueryById(
  queryId: string
): Promise<APIResponse<QueryResponse>> {
  return request<APIResponse<QueryResponse>>(`/query/${queryId}`);
}
