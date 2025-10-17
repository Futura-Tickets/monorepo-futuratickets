"use client";
import React from 'react';

// PROVIDERS
import FuturaAdminProvider from './FuturaAdminProvider';

// STATE
import GlobalStateProvider from "@/components/GlobalStateProvider/GlobalStateProvider";

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <GlobalStateProvider>
      <FuturaAdminProvider>
        {children}
      </FuturaAdminProvider>
    </GlobalStateProvider>
  )
};

export default RootProvider;