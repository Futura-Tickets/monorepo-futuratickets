'use client';
import { useState, useEffect } from 'react';
import { Eye, ArrowRight, Repeat, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserTickets, cancelResaleSale } from '@/app/shared/services/services';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import TicketDetailModal from './ticketDetailModal';
import TransferTicketModal from './TransferTicketModal';
import ResellTicketModal from './ResellTicketModal';


export default function UserTickets({ showMessage }: { showMessage?: (type: string, text: string) => void }) {

    const { userData } = useAuth()
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [selectedTicketForTransfer, setSelectedTicketForTransfer] = useState<any | null>(null);
    const [selectedTicketForResell, setSelectedTicketForResell] = useState<any | null>(null);
    const [cancelingTicketId, setCancelingTicketId] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    
        try {
            const parts = dateString.split('T')[0].split('-');
        
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
        
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Date not available';
        }
    };

    const loadTickets = async (userId: string) => {
        setIsLoading(true);
        setError(null);

        try {

            const ticketsData = await getUserTickets(userId);
            setTickets(ticketsData);

        } catch (err) {
            console.error('Error loading tickets:', err);
            setError('Error loading your tickets.');
            if (showMessage) {
                showMessage('error', 'Could not load your tickets');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        userData?._id && loadTickets(userData._id);
    }, [userData]);

    const handleCancelResale = async (ticketId: string) => {
        if (!ticketId) return;
        
        try {
            setCancelingTicketId(ticketId);

            await cancelResaleSale(ticketId);
            
            setTickets(prevTickets => 
                prevTickets.map(ticket => 
                    ticket._id === ticketId 
                        ? { ...ticket, status: 'OPEN' } 
                        : ticket
                )
            );
            
        } catch (err) {
            console.error('Error canceling resale:', err);
            if (showMessage) {
                showMessage('error', 'Could not cancel ticket resale');
            }
        } finally {
            setCancelingTicketId(null);
        }
    };

    const handleTicketResale = (ticketId: string) => {
        setTickets(prevTickets => 
            prevTickets.map(ticket => 
                ticket._id === ticketId 
                    ? { ...ticket, status: 'SALE' } 
                    : ticket
            )
        );
    };

    const handleTicketTransfer = (ticketId: string) => {
        setTickets(prevTickets => 
            prevTickets.map(ticket => 
                ticket._id === ticketId 
                    ? { ...ticket, status: 'TRANSFERED' } 
                    : ticket
            )
        );
    };

    if (isLoading) {
        return (
            <div className='bg-white/5 p-6 rounded-lg border border-white/10 text-center text-white/70'>
                Loading your tickets...
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-white/5 p-6 rounded-lg border border-white/10 text-center text-red-500'>
                {error} 
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className='bg-white/5 p-6 rounded-lg border border-white/10 text-center text-white/70'>
                You don't have any tickets at the moment.
            </div>
        );
    }

    const getStatusBadgeClass = (status: string) => {
        status?.toUpperCase();
        if (status === 'OPEN') return 'bg-green-500';
        if (status === 'PENDING') return 'bg-yellow-500';
        if (status === 'PROCESSED') return 'bg-green-500';
        if (status === 'CLOSED') return 'bg-red-500';
        if (status === 'SUCCEEDED') return 'bg-green-500';
        if (status === 'SALE') return '#046F95';
        return 'bg-gray-500';
    };

    return (
        <div className='space-y-6'>
            <Card className='bg-transparent border-none shadow-none'>
                <CardHeader className='px-0 pt-0'>
                    <CardTitle className='text-xl font-semibold text-futura-teal'>Your tickets</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6 px-0'>
                    {tickets.map((ticket, index) => {

                        const eventName = ticket.event?.name;
                        const location = ticket.event?.location;
                        const venue = location?.venue ;
                        const city = location?.city;
                        const displayLocation = `${venue}, ${city}`;
                        const eventImage = ticket.event?.image;
                        const imageUrl = eventImage?.startsWith('http') 
                            ? eventImage 
                            : eventImage 
                                ? `${process.env.NEXT_PUBLIC_BLOB_URL}/${eventImage}` 
                                : '/images/placeholder.svg';
                        
                        const status = ticket.status;
                        const badgeBgClass = getStatusBadgeClass(status);
                        
                        const ticketType = ticket.type ;
                        const price = Number.parseFloat(ticket.price);

                        return (
                            <div key={`ticket-${ticket._id || index}`} className='rounded-lg overflow-hidden shadow-lg border border-white/10 bg-futura-dark'>
                                <div className='relative h-48 w-full'>
                                    <Image 
                                        src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${eventImage}` }
                                        alt={eventName}
                                        layout='fill'
                                        objectFit='cover'
                                    />
                                    <Badge className={`absolute top-3 right-3 ${badgeBgClass} text-white px-2.5 py-1 text-xs font-semibold rounded-md border-2 border-[#2A3C3B]`}>
                                        {status}
                                    </Badge>
                                </div>
                                <div className='p-5 bg-[#0C1C1A]/75'>
                                    <h3 className='text-xl font-bold text-white mb-1 truncate'>{eventName}</h3>
                                    <p className='text-sm text-gray-300 mb-5 truncate'>{displayLocation}</p>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
                                        <span className="text-gray-400">Token Id:</span>
                                        <span className="text-right text-white font-medium"># {ticket.tokenId || "N/A"} </span>
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-right text-white font-medium">{ticketType}</span>

                                        <span className="text-gray-400">Price:</span>
                                        <span className="text-right text-futura-teal font-semibold">€{price.toFixed(2)}</span>
                                        
                                        <span className="text-gray-400">Date:</span>
                                        <span className="text-right text-white font-medium">{formatDate(ticket.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 bg-[#0B1B19] rounded-b-lg border-t border-white/10">
                                    <Button 
                                        variant="ghost" 
                                        className="bg-[#0B1B19] hover:bg-[#1D2B2A] text-white rounded-none rounded-bl-lg py-3 flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1B19] focus:ring-futura-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setSelectedTicket(ticket)}
                                        disabled={status === 'TRANSFERED' || status === 'PENDING' || status === 'PROCESSING'} 
                                    >
                                        <Eye className="h-4 w-4 mr-1 sm:mr-2" /> View
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="bg-[#0B1B19] hover:bg-[#1D2B2A] text-white rounded-none py-3 flex items-center justify-center border-l border-r border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1B19] focus:ring-futura-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setSelectedTicketForTransfer(ticket)}
                                        disabled={status === 'TRANSFERED' || status === 'PENDING' || status === 'SALE' || status === 'PROCESSING'} 
                                    >
                                        <ArrowRight className="h-4 w-4 mr-1 sm:mr-2" /> Transfer
                                    </Button>
                                    
                                    {status === 'SALE' ? (
                                        <Button 
                                            variant="ghost" 
                                            className="bg-[#0B1B19] hover:bg-[#1D2B2A] text-white rounded-none py-3 flex items-center justify-center border-l border-r border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1B19] focus:ring-futura-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => handleCancelResale(ticket._id)}
                                            disabled={status === 'TRANSFERED' ||status === 'PENDING' || status === 'PROCESSING' || cancelingTicketId === ticket._id}
                                        >
                                            {cancelingTicketId === ticket._id ? (
                                                'Canceling...'
                                            ) : (
                                                <>
                                                    <Ban className="h-4 w-4 mr-1 sm:mr-2" /> Cancel
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="ghost" 
                                            className="bg-[#0B1B19] hover:bg-[#1D2B2A] text-white rounded-none py-3 flex items-center justify-center border-l border-r border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1B19] focus:ring-futura-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => setSelectedTicketForResell(ticket)}
                                            disabled={status === 'TRANSFERED' || status === 'PENDING' || status === 'PROCESSING'} 
                                        >
                                            <Repeat className="h-4 w-4 mr-1 sm:mr-2" /> Resale
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {selectedTicket && (
                <TicketDetailModal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    order={selectedTicket}
                />
            )}
            
            {selectedTicketForTransfer && (
                <TransferTicketModal
                    isOpen={!!selectedTicketForTransfer}
                    onClose={() => setSelectedTicketForTransfer(null)}
                    order={selectedTicketForTransfer}
                    saleId={selectedTicketForTransfer._id} 
                    onTransferSuccess={() => handleTicketTransfer(selectedTicketForTransfer._id)} 
                />
            )}
            
            {selectedTicketForResell && (
                <ResellTicketModal
                    isOpen={!!selectedTicketForResell}
                    onClose={() => setSelectedTicketForResell(null)}
                    order={selectedTicketForResell}
                    saleId={selectedTicketForResell._id}
                    onResaleSuccess={() => handleTicketResale(selectedTicketForResell._id)}  
                />
            )}
        </div>
    );
}