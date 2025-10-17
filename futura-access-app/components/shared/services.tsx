import AsyncStorage from '@react-native-async-storage/async-storage';

// INTERFACES
import { Account, DecodedToken, Event, LoginAccount } from '../shared/interfaces';

export async function getEvents(): Promise<Event[]> {
    return await fetch(`http://192.168.1.135:3000/admin/events`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`
        },
    }).then(async(response: Response) => {
        return response.json();
    }).catch((err) => console.log(err));
};

export async function loginAccount(loginAccount: LoginAccount): Promise<Account> {
    return await fetch(`http://192.168.1.135:3000/accounts/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginAccount })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function checkExpiration(): Promise<DecodedToken> {
    return await fetch(`http://192.168.1.135:3000/accounts/validate`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: await AsyncStorage.getItem('@token') })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch(async (err) => await err.json());
};

export async function checkAccess(sale: string): Promise<{ access: string; reason: string; }> {
    return await fetch(`http://192.168.1.135:3000/admin/events/access`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`
        },
        body: JSON.stringify({ sale })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch(async (err) => await err.json());
};