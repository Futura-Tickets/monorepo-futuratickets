'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { recoveryEmail } from '@/app/shared/services/services';

export default function SendEmailToRecoverPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await recoveryEmail(email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Error sending recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border border-white/10">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-futura-teal mx-auto" />
            <h2 className="text-xl font-semibold text-white">Email Sent!</h2>
            <p className="text-gray-400">
              We've sent a recovery link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="pt-4 space-y-2">
              <Link href="/login" className="block text-futura-teal hover:text-futura-teal/80">
                Back to login
              </Link>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="block text-sm text-gray-400 hover:text-white mx-auto"
              >
                Send another email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/50 border border-white/10">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/login" className="text-futura-teal hover:text-futura-teal/80">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-xl text-white">Forgot Password</CardTitle>
          </div>
          <p className="text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-futura-orange/20 p-3 rounded-md text-sm text-futura-orange border border-futura-orange/30">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-futura-teal hover:bg-futura-teal/90 text-white"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Recovery Email'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-futura-teal hover:text-futura-teal/80">
              Remember your password? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}