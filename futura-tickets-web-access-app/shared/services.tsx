"use client";
import { Account, Attendant, LoginAccount, TokenCheck } from "./interfaces";

export async function checkExpiration(): Promise<TokenCheck> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/accounts/validate`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: localStorage.getItem('token') })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking token expiration:', error);
        throw error;
    }
}

export async function loginAccount(loginAccount: LoginAccount): Promise<Account> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/accounts/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loginAccount })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

export async function checkAccess(sale: string): Promise<{ access: string; reason: string; name?: string; email?: string; type?: string; price?: number; }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/access`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ sale })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking access:', error);
        throw error;
    }
}

export async function getAttendants(event: string): Promise<Attendant[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/attendants/${event}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting attendants:', error);
        throw error;
    }
}