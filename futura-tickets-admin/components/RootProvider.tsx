"use client";
import React, { useEffect } from 'react';

// GOOGLE OAUTH
import { GoogleOAuthProvider } from '@react-oauth/google';

// PROVIDERS
import FuturaAdminProvider from './FuturaAdminProvider';

// STATE
import GlobalStateProvider from "@/components/GlobalStateProvider/GlobalStateProvider";

// ERROR BOUNDARY
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  // Suppress Ant Design React 19 warning
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('antd v5 support React is 16 ~ 18')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <GlobalStateProvider>
        <GoogleOAuthProvider clientId="741584753336-4k6pd7e6eolc29g0v96dso9o78148577.apps.googleusercontent.com">
          <FuturaAdminProvider>
            {children}
          </FuturaAdminProvider>
        </GoogleOAuthProvider>
      </GlobalStateProvider>
    </ErrorBoundary>
  )
};

export default RootProvider;