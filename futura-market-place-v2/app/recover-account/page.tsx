'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { recoveryPassword } from '@/app/shared/services/services';

export default function RecoverAccountPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or expired recovery token');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid recovery token');
      return;
    }

    setIsLoading(true);
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please complete all fields');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await recoveryPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Error updating password');
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
            <h2 className="text-xl font-semibold text-white">Password Updated!</h2>
            <p className="text-gray-400">
              Your password has been successfully updated. You will be redirected to login in a few seconds.
            </p>
            <div className="pt-4">
              <Link href="/login" className="text-futura-teal hover:text-futura-teal/80">
                Go to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border border-white/10">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-futura-orange mx-auto" />
            <h2 className="text-xl font-semibold text-white">Invalid Link</h2>
            <p className="text-gray-400">
              The recovery link is invalid or has expired. Please request a new recovery link.
            </p>
            <div className="pt-4">
              <Link href="/login/send-email-to-recover" className="text-futura-teal hover:text-futura-teal/80">
                Request new link
              </Link>
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
            <CardTitle className="text-xl text-white">Reset Password</CardTitle>
          </div>
          <p className="text-sm text-gray-400">
            Enter your new password to complete account recovery.
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
              <Label htmlFor="newPassword" className="text-white">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-futura-teal hover:bg-futura-teal/90 text-white"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-futura-teal hover:text-futura-teal/80">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
