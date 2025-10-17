'use client';
import {
  Account,
  CreateAccount,
  CreateAccess,
  LoginAccount,
  TokenCheck,
} from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Secure Authentication Service using httpOnly cookies
 * This service replaces localStorage token storage with secure httpOnly cookies
 * All requests include credentials: 'include' to send cookies automatically
 */

/**
 * Create a new account (registration) with automatic login via httpOnly cookie
 */
export async function createAccount(
  createAccount: CreateAccount
): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Essential for cookies
    body: JSON.stringify({ createAccount }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Registration error:', err);
      throw err;
    });
}

/**
 * Create a promoter account (admin action) with httpOnly cookie auth
 */
export async function createPromoterAccount(
  createPromoterAccount: CreateAccount
): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/create-promoter`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
    body: JSON.stringify({ createPromoterAccount }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Create promoter failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Create promoter error:', err);
      throw err;
    });
}

/**
 * Create an access account for event control with httpOnly cookie auth
 */
export async function createAccessAccount(
  createAccessAccount: CreateAccess
): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/create-access`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
    body: JSON.stringify({ createAccessAccount }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Create access account failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Create access account error:', err);
      throw err;
    });
}

/**
 * Login with email and password - Sets httpOnly cookie
 */
export async function loginAccount(
  loginAccount: LoginAccount
): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Essential for receiving and sending cookies
    body: JSON.stringify(loginAccount),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      const account = await response.json();
      // No need to store token - it's in httpOnly cookie!
      return account;
    })
    .catch((err) => {
      console.error('Login error:', err);
      throw err;
    });
}

/**
 * Login with Google OAuth - Sets httpOnly cookie
 */
export async function loginGoogle(codeResponse: string): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/login-google`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Essential for receiving and sending cookies
    body: JSON.stringify({ googleCode: codeResponse }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Google login failed: ${response.statusText}`);
      }
      const account = await response.json();
      // No need to store token - it's in httpOnly cookie!
      return account;
    })
    .catch((err) => {
      console.error('Google login error:', err);
      throw err;
    });
}

/**
 * Access login for event control - Sets httpOnly cookie
 */
export async function accessLogin(
  loginAccount: LoginAccount
): Promise<Omit<Account, 'token'>> {
  return await fetch(`${API_URL}/api/accounts/secure/access/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Essential for cookies
    body: JSON.stringify(loginAccount),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Access login failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Access login error:', err);
      throw err;
    });
}

/**
 * Logout - Clears httpOnly cookies
 */
export async function logout(): Promise<{ message: string }> {
  return await fetch(`${API_URL}/api/accounts/secure/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Essential for cookies
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Logout error:', err);
      throw err;
    });
}

/**
 * Validate current session from httpOnly cookie
 */
export async function validateSession(): Promise<TokenCheck | null> {
  return await fetch(`${API_URL}/api/accounts/secure/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends the httpOnly cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        return null;
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Validation error:', err);
      return null;
    });
}

/**
 * Get current user profile using httpOnly cookie
 */
export async function getProfile(): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Get profile failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching profile:', err);
      throw err;
    });
}

/**
 * Update account information using httpOnly cookie
 */
export async function updateAccount(account: any): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/secure/update`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
    body: JSON.stringify({ updateAccount: account }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Update account failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error updating account:', err);
      throw err;
    });
}

/**
 * Update admin account using httpOnly cookie
 */
export async function updateAdminAccount(account: any): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/secure/admin/update`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
    body: JSON.stringify({ updateAccount: account }),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Update admin account failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error updating admin account:', err);
      throw err;
    });
}

/**
 * Get all admin accounts using httpOnly cookie
 */
export async function getAdminAccounts(): Promise<Account[]> {
  return await fetch(`${API_URL}/api/accounts/secure/admin`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Get admin accounts failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching admin accounts:', err);
      return [];
    });
}

/**
 * Get event access accounts using httpOnly cookie
 */
export async function getEventAccessAccounts(event: string): Promise<Account[]> {
  return await fetch(`${API_URL}/api/accounts/secure/access/${event}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Get access accounts failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching access accounts:', err);
      return [];
    });
}

/**
 * Delete an admin account using httpOnly cookie
 */
export async function deleteAdminAccount(adminAccount: string): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/secure/admin/${adminAccount}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends auth cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Delete admin account failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting admin account:', err);
      throw err;
    });
}

/**
 * Export all clients to CSV using httpOnly cookie
 */
export async function exportAllClients(): Promise<Blob> {
  return await fetch(`${API_URL}/api/accounts/secure/export/all`, {
    method: 'GET',
    headers: {
      Accept: 'text/csv',
    },
    credentials: 'include', // Sends auth cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Export clients failed: ${response.statusText}`);
      }
      return await response.blob();
    })
    .catch((err) => {
      console.error('Error exporting clients:', err);
      throw err;
    });
}

/**
 * Migration helper: Check if we have a valid session
 * This helps determine if we need to prompt for login
 */
export async function hasValidSession(): Promise<boolean> {
  const session = await validateSession();
  return session !== null && session.exp > Date.now() / 1000;
}

/**
 * Refresh access token using refresh token from cookie
 */
export async function refreshAccessToken(): Promise<{ message: string }> {
  return await fetch(`${API_URL}/api/accounts/secure/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends the refresh token cookie
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Token refresh error:', err);
      throw err;
    });
}

/**
 * Automatic token refresh interceptor
 * Call this function to set up automatic token refresh when API calls fail with 401
 */
export async function setupAutomaticTokenRefresh(): Promise<void> {
  // This is a helper to be used in a global fetch interceptor
  // The actual implementation would be in your API client setup

  // Example usage:
  // Original fetch wrapper:
  // const originalFetch = window.fetch;
  // window.fetch = async (...args) => {
  //   const response = await originalFetch(...args);
  //   if (response.status === 401) {
  //     try {
  //       await refreshAccessToken();
  //       // Retry original request
  //       return await originalFetch(...args);
  //     } catch {
  //       // Redirect to login
  //       window.location.href = '/login';
  //     }
  //   }
  //   return response;
  // };
}

/**
 * Migration helper: Check if we have a valid session
 * This helps determine if we need to prompt for login
 */
export async function hasValidSession(): Promise<boolean> {
  const session = await validateSession();
  return session !== null && session.exp > Date.now() / 1000;
}

/**
 * Migration helper: Clear old localStorage token
 * Call this after successful migration to cookie-based auth
 */
export function clearLegacyToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  // Clear any other auth-related localStorage items
  localStorage.removeItem('account');
  localStorage.removeItem('user');
}