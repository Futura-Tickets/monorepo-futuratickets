import { message } from 'antd';

/**
 * HTTP Utilities with automatic error handling and auth redirect
 */

interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

/**
 * Enhanced fetch wrapper with automatic 401/403 handling
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

    // Handle authentication errors
    if (!options.skipAuthRedirect && (response.status === 401 || response.status === 403)) {
      console.warn(`${response.status} response detected, redirecting to login...`);

      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('account');

        // Show error message
        message.error(
          response.status === 401
            ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
            : 'No tienes permisos para acceder a este recurso.'
        );

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }

      throw new Error(`Authentication failed: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Simplified GET request
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'GET',
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Simplified POST request
 */
export async function post<T>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Simplified PUT request
 */
export async function put<T>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Simplified PATCH request
 */
export async function patch<T>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Simplified DELETE request
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Handle async operations with loading and error states
 */
export async function handleAsync<T>(
  asyncFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<T | null> {
  try {
    const data = await asyncFn();

    if (options?.successMessage) {
      message.success(options.successMessage);
    }

    if (options?.onSuccess) {
      options.onSuccess(data);
    }

    return data;
  } catch (error) {
    console.error('Async operation failed:', error);

    const errorMessage = options?.errorMessage ||
      (error instanceof Error ? error.message : 'Ha ocurrido un error inesperado');

    message.error(errorMessage);

    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }

    return null;
  }
}
