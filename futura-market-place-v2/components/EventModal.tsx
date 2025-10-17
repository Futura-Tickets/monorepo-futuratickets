'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  Info,
  Users,
  Music,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    title: string;
    venue: string;
    date: string;
    time: string | Date;
    price: number | string;
    image: string;
    description?: string;
    organizer?: string;
    ageRestriction?: string;
    category?: string;
    address?: string;
    capacity?: number;
    genres?: string[];
    formattedDate?: string;
    city?: string;
    country?: string;
  };
}

export default function EventModal({
  isOpen,
  onClose,
  event,
}: EventModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='max-w-3xl bg-black/95 border-gray-800 p-0 overflow-hidden'
      >
        <div className='grid md:grid-cols-5 gap-0'>
          <div className='md:col-span-3 relative'>
            {/* Botón de cierre en la izquierda */}
            <Button
              size='icon'
              variant='ghost'
              onClick={onClose}
              className='absolute top-4 left-4 bg-black/70 hover:bg-black/90 rounded-full w-9 h-9 z-10'
            >
              <X className='h-5 w-5 text-white' />
            </Button>

            <Image
              src={event.image || '/placeholder.svg'}
              alt={event.title}
              width={600}
              height={400}
              className='w-full h-full object-cover'
            />
            <div className='absolute top-4 right-4 flex gap-2'>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full w-8 h-8'
              >
                <Heart className='h-4 w-4' />
              </Button>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full w-8 h-8'
              >
                <Share2 className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='md:col-span-2 p-6'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>
                {event.title}
              </DialogTitle>
              {event.organizer && (
                <p className='text-sm text-gray-400'>
                  Organized by {event.organizer}
                </p>
              )}
            </DialogHeader>

            <div className="space-y-1">
              <p className="font-bold text-white/60 text-sm">Price</p>
              <p className="text-3xl font-bold text-futura-teal">
                {typeof event.price === 'number' 
                  ? `${event.price}€` 
                  : `${event.price}`}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
