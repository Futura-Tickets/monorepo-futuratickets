import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// PROVIDERS
import { useAuth } from '@/contexts/auth-context';
import { useGlobal } from '@/contexts/global-context';

// COMPONENTS
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// ICONS
import { Search, User, ChevronDown, Globe, Menu, LogOut, Ticket as TicketIcon } from 'lucide-react';
import { CartIcon } from './cart-icon';

// CONSTANTS
import { Country } from '@/lib/countries-data';

// Modifica la definición de la función para aceptar props
export function Header({ isCartVisible = true }: { isCartVisible?: boolean }) {
    const { availableCountries, currentCountry } = useGlobal();
    const { isLoggedIn, isAuthLoading, userData } = useAuth();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [country, setCountry] = useState<string>('');
    const [cartUpdate, setCartUpdate] = useState(0);
    
    const clearSearch = () => setSearchTerm('');

    const logOut = () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
    };

    return (
        <header className='border-b border-white/10 py-4 bg-futura-dark/80 backdrop-blur-sm sticky top-0 z-50'>
            <div className='container mx-auto px-4 flex items-center justify-between'>
                <div className='flex items-center gap-4 sm:gap-8'>
                    <Link href='/' className='hover:opacity-80 transition-opacity'>
                    <Image
                        src='/images/logo.png'
                        alt='Futura Tickets'
                        width={120}
                        height={40}
                        priority
                        className='h-8 w-auto'
                        onError={(e) => {
                        // Si la imagen falla al cargar, mostramos un mensaje en consola y usamos una alternativa
                        console.error('Error al cargar la imagen del logo');
                        e.currentTarget.src = '/images/futura-logo.png'; // Intenta con otra ruta alternativa
                        }}
                    />
                    </Link>
                    <form onSubmit={(e) => e.preventDefault()} className='relative hidden md:block'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                            className='w-[300px] pl-10 bg-white/5 border-white/10 focus:border-futura-teal'
                            placeholder='Search events, artists or venues...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button type='button' onClick={clearSearch} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            >
                                <line x1='18' y1='6' x2='6' y2='18'/>
                                <line x1='6' y1='6' x2='18' y2='18'/>
                            </svg>
                            </button>
                        )}
                    </form>
                </div>
                <div className='hidden md:flex items-center gap-4'>
                    {availableCountries.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='sm' className='flex items-center gap-1 border-white/10 bg-white/5'>
                                    <Globe className='h-4 w-4 mr-1 text-futura-teal' />
                                    {currentCountry.flag} {country || 'Select Country'}
                                    <ChevronDown className='h-4 w-4 ml-1' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='bg-futura-dark border-white/10'>
                                <DropdownMenuRadioGroup value={country} onValueChange={setCountry}>
                                    {availableCountries.map((country: Country) => (
                                        <DropdownMenuRadioItem key={country.id} value={country.name} className='cursor-pointer hover:bg-white/5 focus:bg-white/5'>
                                            {country.flag} {country.name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {isCartVisible && <CartIcon key={cartUpdate} />}

                    {userData?.role === 'ADMIN' && (
                        <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 font-medium px-3 py-1 bg-futura-teal/10 rounded-md border border-futura-teal/30 hover:bg-futura-teal/20 transition-all">
                            Admin Panel
                        </Link>
                    )}

                    {isAuthLoading ? (
                        <div className='h-9 w-24 bg-white/5 rounded-md animate-pulse'/>
                    ) : isLoggedIn ? (
                        <div className='relative user-menu-container'>
                            <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 cursor-pointer transition-all' onClick={() => setShowUserMenu(!showUserMenu)}>
                                <User className='h-4 w-4 text-futura-teal' />
                                <span className='hidden sm:inline text-futura-teal text-sm font-medium'>
                                    {userData?.name} {userData?.lastName}
                                </span>
                            </div>
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
                                        <TicketIcon className='h-4 w-4 text-futura-teal' />
                                        Mis Entradas
                                    </div>
                                </Link>
                                <div className='border-t border-white/10 my-1'></div>
                                <div onClick={logOut} className='px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer flex items-center gap-2'>
                                    <LogOut className='h-4 w-4' /> Cerrar sesión
                                </div>
                            </div>
                            )}
                        </div>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='sm' className='flex items-center gap-2 border-white/10 bg-white/5'>
                                    <User className='h-4 w-4' />
                                    <span className='hidden sm:inline'>Login / Register</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='bg-futura-dark border-white/10'>
                                <Link href='/login?mode=login'>
                                    <div className='px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer flex items-center gap-2'>
                                        <User className='h-4 w-4 text-futura-teal' /> Login
                                    </div>
                                </Link>
                                <Link href='/login?mode=register'>
                                    <div className='px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer flex items-center gap-2'>
                                        <User className='h-4 w-4 text-green-500' /> Register
                                    </div>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <div className='flex items-center gap-2 md:hidden'>
                    {isCartVisible && <CartIcon />}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant='ghost' size='icon'>
                                <Menu className='h-6 w-6' />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='right' className='bg-futura-dark border-white/10 p-0'>
                            <div className='flex flex-col h-full'>
                                <div className='p-4 border-b border-white/10'>
                                    <div className='relative mb-6'>
                                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                        <form onSubmit={(e) => e.preventDefault()}>
                                            <Input  className='w-full pl-10 bg-white/5 border-white/10 focus:border-futura-teal' placeholder='Search events, artists or venues...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                            {searchTerm && (
                                                <button type='button' onClick={() => setSearchTerm('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'>
                                                    <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='16'
                                                    height='16'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    >
                                                    <line x1='18' y1='6' x2='6' y2='18'/>
                                                    <line x1='6' y1='6' x2='18' y2='18'/>
                                                    </svg>
                                                </button>
                                            )}
                                        </form>
                                    </div>

                                    <div className='space-y-4'>
                                        <div className='space-y-2'>
                                            <p className='text-sm text-gray-400'>Select Country</p>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {availableCountries.map((c) => (
                                                    <Button key={c.id} variant={country === c.name ? 'default' : 'outline'} size='sm' className='justify-start border-white/10' onClick={() => setCountry(c.name)}>
                                                        {c.flag} {c.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-4 border-b border-white/10'>
                                    {isAuthLoading ? (
                                        <div className='h-9 w-full bg-white/5 rounded-md animate-pulse'/>
                                    ) : isLoggedIn ? (
                                        <div className='space-y-2'>
                                            <Link href='/account?tab=profile'>
                                                <Button variant='outline' size='sm' className='w-full justify-start border-white/10'>
                                                    <User className='h-4 w-4 mr-2 text-futura-teal' />
                                                    <span className='text-futura-teal'>Perfil</span>
                                                </Button>
                                            </Link>
                                            <Link href='/account?tab=tickets'>
                                                <Button variant='outline' size='sm' className='w-full justify-start border-white/10'>
                                                    <TicketIcon className='h-4 w-4 mr-2 text-futura-teal' />
                                                    <span className='text-futura-teal'>Mis Entradas</span>
                                                </Button>
                                            </Link>
                                            <Button variant='outline' size='sm' className='w-full justify-start border-white/10 text-red-400' onClick={logOut}>
                                                <LogOut className='h-4 w-4 mr-2' /> Cerrar sesión
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className='space-y-2'>
                                            <Link href='/login?mode=login'>
                                                <Button variant='outline' size='sm' className='w-full justify-start border-white/10'>
                                                    <User className='h-4 w-4 mr-2 text-futura-teal' />
                                                    Login
                                                </Button>
                                            </Link>
                                            <Link href='/login?mode=register'>
                                                <Button variant='outline' size='sm' className='w-full justify-start border-white/10'>
                                                    <User className='h-4 w-4 mr-2 text-green-500' />
                                                    Register
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
