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
 * Create a new account (registration)
 */
export async function createAccount(
  createAccount: CreateAccount
): Promise<any> {
  return await fetch(`${API_URL}/api/accounts`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ createAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Create a promoter account (admin action)
 */
export async function createPromoterAccount(
  createPromoterAccount: CreateAccount
): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ createPromoterAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Create an access account for event control
 */
export async function createAccessAccount(
  createAccessAccount: CreateAccess
): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts/create-access`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ createAccessAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Login with email and password
 */
export async function loginAccount(
  loginAccount: LoginAccount
): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Login with Google OAuth
 */
export async function loginGoogle(codeResponse: string): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts/login-google`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ googleCode: codeResponse }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Check token expiration
 */
export async function checkExpiration(): Promise<TokenCheck> {
  return await fetch(`${API_URL}/api/accounts/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: localStorage.getItem('token') }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error checking token expiration:', err);
      throw err;
    });
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<Account> {
  return await fetch(`${API_URL}/api/accounts`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching profile:', err);
      throw err;
    });
}

/**
 * Update account information
 */
export async function updateAccount(account: any): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/create`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(account),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error updating account:', err);
      throw err;
    });
}

/**
 * Get all admin accounts
 */
export async function getAdminAccounts(): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/admin`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching admin accounts:', err);
      return [];
    });
}

/**
 * Delete an admin account
 */
export async function deleteAdminAccount(adminAccount: string): Promise<any> {
  return await fetch(`${API_URL}/api/accounts/admin/${adminAccount}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting admin account:', err);
      throw err;
    });
}
