"use client";
import React, { Suspense } from 'react';

// GOOGLE SIGNIN
import { GoogleOAuthProvider } from '@react-oauth/google';

// PROVIDERS
import FuturaTickets from './FuturaTickets';

// STATE
import GlobalStateProvider from "@/components/GlobalStateProvider/GlobalStateProvider";

// COMPONENTS
import Header from './shared/Header/Header';
import Footer from './shared/Footer/Footer';

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <GlobalStateProvider>
      <GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">
        <Suspense>  
          <FuturaTickets>
            <Header/>
              {children}
            <Footer/>
          </FuturaTickets>
        </Suspense>
      </GoogleOAuthProvider>
    </GlobalStateProvider>
  )
};

export default RootProvider;