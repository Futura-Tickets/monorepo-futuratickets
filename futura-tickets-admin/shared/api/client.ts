/**
 * API Client - Base HTTP client with error handling and auth
 */

import { message } from 'antd';

const API_BASE_URL = process.env.NEXT_PUBLIC_FUTURA;

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipErrorNotification?: boolean;
}

/**
 * Base HTTP client with automatic auth header injection and error handling
 */
class APIClient {
  private getHeaders(config?: RequestConfig): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (!config?.skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response, config?: RequestConfig): Promise<T> {
    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('account');

        if (!config?.skipErrorNotification) {
          message.error(
            response.status === 401
              ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
              : 'No tienes permisos para acceder a este recurso.'
          );
        }

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }

      throw new Error(`Authentication failed: ${response.status}`);
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      const error = new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);

      if (!config?.skipErrorNotification) {
        message.error(`Error: ${error.message}`);
      }

      throw error;
    }

    // Parse successful response
    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(config),
      ...config,
    });

    return this.handleResponse<T>(response, config);
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return this.handleResponse<T>(response, config);
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return this.handleResponse<T>(response, config);
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return this.handleResponse<T>(response, config);
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(config),
      ...config,
    });

    return this.handleResponse<T>(response, config);
  }
}

export const apiClient = new APIClient();
