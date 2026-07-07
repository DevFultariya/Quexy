/* =============================================
   Quexy — API Client
   Centralized API communication layer
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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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

// --- Data Source ---

export async function uploadFile(file: File): Promise<APIResponse<ConnectionStatus>> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE}/datasource/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new APIError(data.detail || 'Upload failed', response.status);
  }
  return data;
}

export async function connectDatabase(config: {
  db_type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}): Promise<APIResponse<ConnectionStatus>> {
  return request<APIResponse<ConnectionStatus>>('/datasource/connect', {
    method: 'POST',
    body: JSON.stringify(config),
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

// --- Query ---

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
