'use client';
import { getUserProfile } from '@/app/shared/services/services';
import { createContext, useContext, useEffect, type ReactNode, useState, Dispatch, SetStateAction } from 'react';

// INTERFACES
import { UserData } from '@/app/shared/interface';

interface AuthContextType {
    isAuthLoading: boolean;
    isLoggedIn: boolean;
    userData: UserData | undefined;
    setUserData: Dispatch<SetStateAction<UserData | undefined>>;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
};

const authContextState = {
    isAuthLoading: true,
    isLoggedIn: false,
    userData: undefined,
    setUserData: (): void => {},
    setIsLoggedIn: (): void => {},
};

const AuthContext = createContext<AuthContextType | undefined>(authContextState);

export function AuthProvider({ children }: { children: ReactNode }) {

    // Estados de usuario
    const [userData, setUserData] = useState<UserData>();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

    const checkAuth = async (): Promise<void> => {
        
        setIsAuthLoading(true);
        // Verificar si hay un token de autenticación
        const token = localStorage.getItem('auth_token');

        if (token) {
            try {

                const userData = await getUserProfile();
      
                // Actualizar los estados con la información del usuario
                setUserData(userData);
                setIsLoggedIn(true);

            } catch (error) {
                console.error('Error al decodificar el token:', error);
                // Si hay un error al obtener los datos, eliminar el token
                localStorage.removeItem('auth_token');
                setIsLoggedIn(false);
            } finally {
                setIsAuthLoading(false);
            }
        } else {
            setIsAuthLoading(false);
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{
            userData,
            setUserData,
            setIsLoggedIn,
            isAuthLoading,
            isLoggedIn
        }}>
          {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};