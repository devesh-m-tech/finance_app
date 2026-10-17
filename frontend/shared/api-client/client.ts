import { PermissionKey } from '../generated/permission-types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed?: (newToken: string) => void;
  onUnauthorized?: () => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requiredPermission?: PermissionKey;
    statusCode: number;
  };
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const token = this.config.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Attempt refresh
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry original request
          headers['Authorization'] = `Bearer ${this.config.getAccessToken()}`;
          const retryRes = await fetch(url, { ...options, headers });
          return retryRes.json();
        } else {
          this.config.onUnauthorized?.();
        }
      }

      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Network request failed',
          statusCode: 0,
        },
      };
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.config.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.config.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        this.config.onTokenRefreshed?.(data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Typed convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
