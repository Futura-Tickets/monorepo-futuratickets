"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// SOCKET
import { initSocket } from './Socket';
import { initSocketAccess } from './SocketAccess';
import { initSocketMarketPlace } from './SocketMarketPlace';

// STATE
import { useGlobalState } from './GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import Loader from '@/shared/Loader/Loader';
import Menu from '@/shared/Menu/Menu';
import NotificationsMenu from './NotificationsMenu/NotificationsMenu';

// SERVICES
import { checkExpiration } from '@/shared/services';

// STYLES
import './FuturaAdminProvider.scss';

export default function FuturaAdminProvider({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const pathname = usePathname();

  const [state, dispatch] = useGlobalState();
  const [loader, setLoader] = useState<boolean>(true);

  const initAccount = async (): Promise<void> => {

    const token = localStorage.getItem('token');

    if (token) {
      try {

        const isExpired = await checkExpiration();

        if (!isExpired) {
          localStorage.removeItem('token');
          dispatch({ isConnected: false, account: undefined });
          navigateTo('/login');
          return;
        }

        initSocket();
        initSocketMarketPlace();
        initSocketAccess();

        dispatch({ isConnected: true, account: isExpired });
        setLoader(false);

      } catch (error) {
        localStorage.removeItem('token');
        dispatch({ isConnected: false, account: undefined });
        navigateTo('/login');
      }
    } else {
      setLoader(false);
    }
  };

  const navigateTo = (route: string): void => {
    router.push(route);
  };

  useEffect(() => {
    // Allow access to login and register pages without authentication
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      setLoader(false);
      return;
    }

    initAccount();
  }, [pathname]);

  // Allow access to login and register pages without authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return children;
  if (loader) return <Loader/>;

  return (
    <div className={`root-container ${state.menuState ? "active" : ""}`}>
      <Menu/>
      <div className="root-content">
        <NotificationsMenu />
        {children}
      </div>
    </div>
  );
}