'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfile from '@/components/user-info';
import UserTickets from '@/components/user-tickets';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/auth-context';

export default function AccountPage() {

  const searchParams = useSearchParams();

  const { userData } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'tickets');
  
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const showMessage = (type: string, text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white flex flex-col'> 
      <Header/>

      {statusMessage.text && (
        <div className={`fixed top-4 right-4 p-3 rounded-md z-50 ${statusMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg`}>
          {statusMessage.text}
        </div>
      )}

      <main className='flex-grow flex items-start justify-center p-4 py-8'>
        <div className='w-full max-w-4xl'>
          <div className='text-center mb-6'>
            <h1 className='text-2xl font-bold text-futura-teal'>Welcome, {userData?.name}</h1>
            <p className='text-gray-400 mt-2'>Manage your account and check your tickets</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid grid-cols-2 bg-white/5 mb-6'>
              <TabsTrigger value='tickets'>My Tickets</TabsTrigger>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
            </TabsList>

            <TabsContent value='tickets'>
              <UserTickets showMessage={showMessage} />
            </TabsContent>

            <TabsContent value='profile'>
              <UserProfile showMessage={showMessage} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}