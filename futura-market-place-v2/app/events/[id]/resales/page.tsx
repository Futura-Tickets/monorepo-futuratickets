'use client'; 
import { use } from 'react'; 
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// ICONS
import { User, LogOut, Ticket } from 'lucide-react';

// PROVIDERS
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';

// COMPONENTS
import { CartIcon } from '@/components/cart-icon';
import { useToast } from '@/components/ui/use-toast';

// SERVICES 
import { getEventByUrl, getResaleTickets } from '@/app/shared/services/services';

// INTERFACES 
import type { ResaleTicket } from '@/app/shared/interface';

export default function ResalePage({ params }: { params: Promise<{ id: string }> }) {

  const { id: eventId } = use(params);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [resaleTickets, setResaleTickets] = useState<ResaleTicket[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [processingResaleId, setProcessingResaleId] = useState<string | null>(null);

  const { isLoggedIn, isAuthLoading, userData } = useAuth();

  const fetchResaleTickets = async (eventSlug: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const eventData = await getEventByUrl(eventSlug);
      
      if (!eventData || !eventData._id) {
        setError('No se pudo encontrar información del evento');
        setResaleTickets([]);
        return;
      }
      
      const data = await getResaleTickets(eventData._id);
      setResaleTickets(data);
    } catch (err) {
      console.error('Error al cargar tickets de reventa:', err);
      setError('No se pudieron cargar los tickets de reventa');
      setResaleTickets([]);
    } finally {
      setIsLoading(false);
    }
  }; 

  useEffect(() => {
    eventId && fetchResaleTickets(eventId); 
  }, []); 

  const handlePurchaseTicket = async (resale: ResaleTicket): Promise<void> => {
    if (processingResaleId === resale._id) return;
    
    try {
      setProcessingResaleId(resale._id);
      
      const eventAdapter = {
        id: resale.event._id, 
        url: eventId,
        title: `${resale.type} Ticket (Reventa)`,
        formattedDate: resale.resale.resaleDate,
        image: resale.event.image,
        organizer: `${resale.client.name} ${resale.client.lastName}`,
        venue: resale.event.location.venue,
        tickets: [{
          type: resale.type,
          price: resale.resale.resalePrice,
          capacity: 1
        }],
        resale: {
          isResale: true,
          isActive: true,
          maxPrice: resale.resale.resalePrice,
          royalty: 0
        }
      };
      
      addToCart(eventAdapter, resale.type, 1, resale._id);
      
      toast({
        title: "Ticket añadido al carrito",
        description: "El ticket de reventa ha sido añadido a tu carrito",
        variant: "default",
      });
    } catch (error) {
      console.error('Error al procesar el ticket de reventa:', error);
      
      toast({
        title: "Error",
        description: "No se pudo añadir el ticket al carrito",
        variant: "destructive",
      });
    } finally {
      setProcessingResaleId(null);
    }
  }; 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white flex flex-col'>
      {/* Header */}
      <nav className='fixed top-0 w-full bg-futura-dark/80 backdrop-blur-sm z-50 border-b border-white/10'>
        <div className='container mx-auto px-4'>
          <div className='h-16 flex items-center justify-between'>
            <Link href='/' className='hover:opacity-80 transition-opacity'>
              <Image
                src='/images/logo.png'
                alt='Futura Tickets'
                width={120}
                height={40}
                priority
                className='h-8 w-auto'
              />
            </Link>
            <div className='flex items-center gap-4'>
              <CartIcon />
              {isAuthLoading ? (
                <div className='h-8 w-24 bg-white/5 rounded-md animate-pulse hidden sm:block'/>
              ) : (
                isLoggedIn && (
                  <div className='hidden sm:block relative user-menu-container'>
                    <div
                      className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 cursor-pointer transition-all'
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <User className='h-4 w-4 text-futura-teal' />
                      <span className='text-futura-teal text-sm font-medium'>
                        {userData?.name} {userData?.lastName}
                      </span>
                    </div>
                    
                    {/* Menú desplegable */}
                    {showUserMenu && (
                      <div className='absolute right-0 mt-2 w-48 bg-futura-dark border border-white/10 rounded-md shadow-lg z-50 py-1'>
                        <Link href="/account?tab=profile">
                          <div className='px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer flex items-center gap-2'>
                            <User className='h-4 w-4 text-futura-teal' />
                            Perfil
                          </div>
                        </Link>
                        <Link href="/account?tab=tickets">
                          <div className='px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer flex items-center gap-2'>
                            <Ticket className='h-4 w-4 text-futura-teal' />
                            Mis Entradas
                          </div>
                        </Link>
                        <div className='border-t border-white/10 my-1'/>
                        <div
                          onClick={() => {
                            localStorage.removeItem('auth_token');
                            window.location.href = '/';
                          }}
                          className='px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer flex items-center gap-2'
                        >
                          <LogOut className='h-4 w-4' />
                          Cerrar sesión
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8 pt-24 flex-grow'>
        {isLoading ? (
          <div className='text-center py-12'>
            <p className='text-futura-teal text-lg'>
              Cargando tickets de reventa...
            </p>
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-400'>{error}</p>
            <Button 
              onClick={() => fetchResaleTickets(eventId)} 
              className='mt-4 bg-futura-teal'
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className='max-w-4xl mx-auto'>
            {/* Encabezado */}
            <h1 className='text-3xl font-bold text-white mb-6'>
              Resale Marketplace
            </h1>

            {/* Lista de tickets */}
            <div className='space-y-4'>
              {resaleTickets.map((resale, i: number) => (
                <div key={resale._id || i} className='bg-white/5 rounded-lg p-6 border border-white/10 hover:border-futura-teal transition-colors'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='text-xl font-semibold text-white'>
                        {resale.type} Ticket
                      </h3>
                      <div className='flex items-center gap-2 mt-2'>
                        <Badge variant='secondary' className='bg-white/10'>
                          Listed by {resale.client.name} {resale.client.lastName}
                        </Badge>
                        <Badge variant='secondary' className='bg-white/10'>
                          Listed on{' '}
                          {new Date(resale.resale.resaleDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-gray-400'>
                        Original price: {resale.price}€
                      </p>
                      <p className='text-2xl font-bold text-futura-orange mt-1'>
                        {resale.resale.resalePrice}€
                      </p>
                    </div>
                  </div>
                  <div className='mt-4 flex justify-end'>
                    <Button
                      onClick={() => handlePurchaseTicket(resale)}
                      variant='default'
                      className='bg-futura-teal hover:bg-futura-teal/90'
                      disabled={processingResaleId === resale._id}
                    >
                      {processingResaleId === resale._id ? 'Processing...' : 'Buy ticket'}
                    </Button>
                  </div>
                  <div className='grid gap-4'>
                    {Array.isArray(resale.tickets) &&
                      resale.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className='flex flex-col md:flex-row md:items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors'
                        >
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay tickets */}
            {resaleTickets.length === 0 && (
              <div className='text-center py-12 text-gray-400'>
                No hay tickets de reventa disponibles en este momento
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
