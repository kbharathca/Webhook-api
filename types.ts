export interface WebhookHeader {
  key: string;
  value: string;
}

export interface WebhookRequest {
  id: string;
  endpointId: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  timestamp: number;
  headers: WebhookHeader[];
  query: Record<string, string>;
  body: any; // JSON payload
  size: number; // in bytes
  contentType: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  createdAt: number;
  description?: string;
  methodFilter?: string[];
  color: string;
}

export interface AISummary {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keyFields: string[];
}

export type ViewMode = 'PRETTY' | 'RAW' | 'HEADERS';

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}