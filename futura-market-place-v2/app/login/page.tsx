'use client';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';

import { User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/auth-context';
import { UserData } from '../shared/interface';

// SERVICES
import { loginWithGoogle, registerWithCredentials, loginWithCredentials} from '@/app/shared/services/services';

export default function LoginPage() {

  const { setUserData, setIsLoggedIn } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Detectar el modo desde los parámetros de URL
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'login' || modeParam === 'register') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {

      const response = await registerWithCredentials(formData.name, formData.email, formData.password);

      // Guardar el token en localStorage
      localStorage.setItem('auth_token', response.token);

      // Cambiar a la pestaña de login en lugar de redireccionar
      setMode('login');

      // Limpiar el formulario
      setFormData({ name: '', email: '', password: '' });

    } catch (error: any) {
      setError(error.message || 'Error durante el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    try {

      const response = await loginWithCredentials(
        loginData.email,
        loginData.password
      );

      setUserData(response as any as UserData);
      setIsLoading(false);
      setIsLoggedIn(true);

      // Guardar el token en localStorage
      localStorage.setItem('auth_token', response.token);

      // Redirigir al usuario
      router.push('/');

    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      setIsLoading(false);
      setIsLoggedIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.id]: e.target.value,
    });
  };

  const signInGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
        const account = await loginWithGoogle(codeResponse.access_token);

        setUserData(account as any as UserData);

        localStorage.setItem('auth_token', account.token!);

        router.push(`/`);
    },
    flow: 'implicit',
    // Especificar explícitamente la redirect_uri para desarrollo local
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003',
  });

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-futura-dark to-black text-white'>
      {/* Header */}
      <Header/>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          {/* Título principal */}
          <h1 className='text-3xl font-bold mb-2 text-futura-teal text-center'>Futura Tickets</h1>
          <p className='text-center text-gray-400 mb-6'>Access your account to manage tickets and events</p>
          
          {/* Pestañas de Login/Register */}
          <div className='grid grid-cols-2 gap-2 mb-6'>
            <button 
              className={`py-3 rounded-md font-medium transition-colors ${
                mode === 'login' 
                  ? 'bg-futura-teal text-white' 
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button 
              className={`py-3 rounded-md font-medium transition-colors ${
                mode === 'register' 
                  ? 'bg-futura-teal text-white' 
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          {/* Contenedor principal del formulario */}
          <div className='bg-black/50 border border-white/10 rounded-lg p-6'>
            {mode === 'login' ? (
              // Formulario de login
              <div>
                <h2 className='text-xl font-bold mb-2'>Login</h2>
                <p className='text-gray-400 text-sm mb-6'>Enter your credentials to access your account</p>
                
                <form onSubmit={handleLoginSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='email'
                        type='email'
                        placeholder='name@example.com'
                        className='pl-10 bg-white/5 border-white/10'
                        required
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='password'>Password</Label>
                      <Link
                        href='/login/send-email-to-recover'
                        className='text-xs text-futura-teal hover:text-futura-teal/80'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='password'
                        type='password'
                        className='pl-10 bg-white/5 border-white/10'
                        required
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                      />
                    </div>
                  </div>
                  <Button
                    type='submit'
                    className='w-full bg-futura-teal hover:bg-futura-teal/90'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </Button>

                  {error && (
                    <div className='mt-4 text-red-500 text-sm text-center'>
                      {error}
                    </div>
                  )}
                </form>

                <div className='relative my-6'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-white/10' />
                  </div>
                  <div className='relative flex justify-center text-xs'>
                    <span className='bg-[#001810] px-2 text-gray-400'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => signInGoogle()}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 font-medium py-2 px-4 rounded-md transition-colors border border-gray-300"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6,20H24v8h11.3c-1.1,5.4-5.9,8.8-11.3,8.8c-6.6,0-12-5.4-12-12s5.4-12,12-12c3,0,5.8,1.1,7.9,3l6.1-6.1	C33.8,6.8,29.1,5,24,5C13,5,4,14,4,25s9,20,20,20s20-9,20-20C44,23.2,43.9,21.6,43.6,20z"/>
                    <path fill="#FF3D00" d="M6.3,14.7l7.1,5.3c1.8-4.4,6-7.5,10.7-7.5c3,0,5.8,1.1,7.9,3l6.1-6.1C33.8,6.8,29.1,5,24,5	C16.3,5,9.6,8.9,6.3,14.7z"/>
                    <path fill="#4CAF50" d="M24,45c5,0,9.6-1.7,13.3-4.6l-6.5-5.5c-2,1.4-4.6,2.1-6.8,2.1c-5.4,0-10.1-3.4-11.3-8.8l-7.2,5.5	C9.6,41.3,16.2,45,24,45z"/>
                    <path fill="#1976D2" d="M43.6,20H24v8h11.3c-0.5,2.5-2,4.7-4.1,6.1l6.5,5.5C41.1,36.5,44,31.5,44,25C44,23.2,43.9,21.6,43.6,20z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </div>
            ) : (
              // Formulario de registro
              <div>
                <h2 className='text-xl font-bold mb-2'>Register</h2>
                <p className='text-gray-400 text-sm mb-6'>Create an account to access Futura Tickets</p>
                
                <form onSubmit={handleRegisterSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Name</Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='name'
                        placeholder='John Doe'
                        className='pl-10 bg-white/5 border-white/10'
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='email'
                        type='email'
                        placeholder='name@example.com'
                        className='pl-10 bg-white/5 border-white/10'
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='password'
                        type='password'
                        className='pl-10 bg-white/5 border-white/10'
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <Button
                    type='submit'
                    className='w-full bg-futura-teal hover:bg-futura-teal/90'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Register'}
                  </Button>

                  {error && (
                    <div className='mt-4 text-red-500 text-sm text-center'>
                      {error}
                    </div>
                  )}
                </form>

                <div className='relative my-6'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-white/10'></div>
                  </div>
                  <div className='relative flex justify-center text-xs'>
                    <span className='bg-[#001810] px-2 text-gray-400'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => signInGoogle()}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 font-medium py-2 px-4 rounded-md transition-colors border border-gray-300"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6,20H24v8h11.3c-1.1,5.4-5.9,8.8-11.3,8.8c-6.6,0-12-5.4-12-12s5.4-12,12-12c3,0,5.8,1.1,7.9,3l6.1-6.1	C33.8,6.8,29.1,5,24,5C13,5,4,14,4,25s9,20,20,20s20-9,20-20C44,23.2,43.9,21.6,43.6,20z"/>
                    <path fill="#FF3D00" d="M6.3,14.7l7.1,5.3c1.8-4.4,6-7.5,10.7-7.5c3,0,5.8,1.1,7.9,3l6.1-6.1C33.8,6.8,29.1,5,24,5	C16.3,5,9.6,8.9,6.3,14.7z"/>
                    <path fill="#4CAF50" d="M24,45c5,0,9.6-1.7,13.3-4.6l-6.5-5.5c-2,1.4-4.6,2.1-6.8,2.1c-5.4,0-10.1-3.4-11.3-8.8l-7.2,5.5	C9.6,41.3,16.2,45,24,45z"/>
                    <path fill="#1976D2" d="M43.6,20H24v8h11.3c-0.5,2.5-2,4.7-4.1,6.1l6.5,5.5C41.1,36.5,44,31.5,44,25C44,23.2,43.9,21.6,43.6,20z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
