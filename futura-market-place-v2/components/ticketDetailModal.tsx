'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { X, MapPin } from 'lucide-react';

import type { TicketDetailModalProps } from '@/app/shared/interface';

export default function TicketDetailModal({ isOpen, onClose, order: ticket }: TicketDetailModalProps) {
  if (!ticket) return null;

  const formatDate = (dateString: string) => {
      if (!dateString) return 'Fecha no disponible';
      
          try {
              const parts = dateString.split('T')[0].split('-');
          
              const year = parts[0];
              const month = parts[1];
              const day = parts[2];
          
              return `${day}/${month}/${year}`;
          } catch (error) {
              console.error('Error al formatear la fecha:', error);
              return 'Fecha no disponible';
          }
      };

  const eventDate = ticket.event?.dateTime?.startDate;
  const purchaseDate = ticket.createdAt;

  const eventImage = ticket.event?.image;
  const imageUrl = eventImage?.startsWith('http') 
    ? eventImage 
    : eventImage 
    ? `${process.env.NEXT_PUBLIC_BLOB_URL}/${eventImage}` 
    : '/images/placeholder.svg';

  const locationAddress = ticket.event?.location?.address;
  const locationCity = ticket.event?.location?.city;
  let displayLocation = 'Ubicación no disponible';
  if (locationAddress && locationCity) {
    displayLocation = `${locationAddress}, ${locationCity}`;
  } else if (locationAddress) {
    displayLocation = locationAddress;
  } else if (locationCity) {
    displayLocation = locationCity;
  } else if (ticket.event?.location?.venue) {
    displayLocation = ticket.event.location.venue;
  }

  const status = ticket.status?.toUpperCase();
  let statusBadgeClass = 'bg-gray-400';
  let statusText = status;

  if (status === 'SUCCEEDED' || status === 'OPEN') {
    statusBadgeClass = 'bg-green-500';
    statusText = status === 'SUCCEEDED' ? 'SUCCEEDED' : 'OPEN';
  } else if (status === 'PENDING') {
    statusBadgeClass = 'bg-yellow-500';
  } else if (status === 'CLOSED') {
    statusBadgeClass = 'bg-red-500';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1D2B2A] border-white/10 text-white p-0 max-w-md">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl text-white">Ticket details</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="px-6 pt-2 pb-6">
          <div className="relative h-24 w-full rounded-md overflow-hidden mb-4">
            <Image
              src={imageUrl}
              alt={"Event image"}
              layout="fill"
              objectFit="cover"
            />
          </div>

          <h2 className="text-2xl font-bold text-futura-teal text-center">{ticket.event?.name}</h2>
          <p className="text-sm text-white/60 text-center mb-1">{displayLocation}</p>
          <p className="text-xs text-white/40 text-center mb-6">Order #{ticket.order?.slice(-8) || ticket._id?.slice(-8)}</p>

          <div className="bg-white p-4 rounded-lg mb-6 flex justify-center items-center">
            {ticket.qrCode ? (
              <Image
                src={ticket.qrCode}
                alt="QR Code"
                width={200}
                height={200}
                objectFit="contain"
              />
            ) : (
              <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center text-gray-500">
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-white/70">Type:</span>
              <span className="font-medium">{ticket.type || 'Regular'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Price:</span>
              <span className="font-medium text-futura-teal">€{parseFloat(ticket.price || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Date:</span>
              <span className="font-medium">
                {formatDate(ticket.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Status:</span>
              <Badge className={`${statusBadgeClass} text-white px-2 py-0.5 text-xs`}>{statusText}</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}