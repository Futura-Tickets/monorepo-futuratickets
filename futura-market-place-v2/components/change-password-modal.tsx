'use client';

import { useState } from 'react';

// Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Services
import { updateUserPassword } from '@/app/shared/services/services';

interface ChangePasswordModalProps {
  showMessage: (type: string, text: string) => void;
}

export function ChangePasswordModal({ showMessage }: ChangePasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please complete all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('The new password must have at least 6 characters');
      return;
    }    try {
      setIsLoading(true);
      await updateUserPassword(currentPassword, newPassword);
      showMessage('success', 'Password updated successfully');
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-futura-teal text-black hover:bg-teal-400">Change Password</Button>
      </DialogTrigger>
      <DialogContent className="bg-white/10 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-futura-teal">Change Password</DialogTitle>
          <DialogDescription className="text-white/70">
            Enter your current password and a new password to update your credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-red-500/20 p-2 rounded-md text-sm text-white border border-red-500/30">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="currentPassword" className="block text-sm text-white/80 mb-1">
              Current Password
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm text-white/80 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-white/80 mb-1">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-white/10 hover:bg-white/20 text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-futura-teal text-black hover:bg-teal-400"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
