"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// STATE
import { useGlobalState } from './GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { checkExpiration } from '@/shared/services';

// STYLES
import './FuturaAdminProvider.scss';

export default function FuturaAdminProvider({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  const [state, dispatch] = useGlobalState();

  // Session timeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  const initAccount = async (): Promise<void> => {

    const token = localStorage.getItem('token');

    if (token) {
      try {

        const tokenCheck = await checkExpiration();

        if (tokenCheck.expired) {
          dispatch({ isConnected: false, account: undefined });
          navigateTo('/login');
          return;
        }

        dispatch({ isConnected: true, account: tokenCheck });

      } catch (error) {
        dispatch({ isConnected: false, account: undefined });
        navigateTo('/login');
      }
    } else {
      dispatch({ isConnected: false, account: undefined });
      navigateTo('/login');
    }
  };

  const navigateTo = (route: string): void => {
    router.push(route);
  };

  const updateActivity = (): void => {
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const checkTimeout = (): void => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity);
      if (elapsed > SESSION_TIMEOUT) {
        console.log('Session timeout - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        dispatch({ isConnected: false, account: undefined });
        navigateTo('/login');
      }
    }
  };

  useEffect(() => {
    initAccount();

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check timeout every minute
    const timeoutInterval = setInterval(checkTimeout, 60 * 1000);

    // Initial activity update
    updateActivity();

    return () => {
      // Cleanup
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(timeoutInterval);
    };
  }, []);

  return (
    <div className="root-container">
      <div className="root-content">
        {children}
      </div>
    </div>
  );

}