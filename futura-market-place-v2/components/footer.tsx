import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Footer() {

    return (
        <footer className='bg-futura-dark border-t border-white/10 py-8 sm:py-12'>
            <div className='container mx-auto px-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
                    <div>
                        <h3 className='text-lg font-semibold mb-4 text-futura-teal'>
                            Futura Tickets
                        </h3>
                        <p className='text-gray-400 text-sm'>
                            The ultimate platform to discover, buy <br /> and sell your tickets.
                        </p>
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold mb-4 text-futura-teal'>
                            Support
                        </h3>
                        <ul className='space-y-2 text-gray-400 text-sm'>
                            <li>
                                <Link href='/footer/help' className='hover:text-futura-orange transition-colors'>
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href='/footer/contact' className='hover:text-futura-orange transition-colors'>
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href='/footer/faq' className='hover:text-futura-orange transition-colors'>
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold mb-4 text-futura-teal'>
                            Tickets
                        </h3>
                        <ul className='space-y-2 text-gray-400 text-sm'>
                            <li>
                            <Link href='/footer/tickets/my-tickets' className='hover:text-futura-orange transition-colors'>
                                My tickets
                            </Link>
                            </li>
                            <li>
                            <Link href='/footer/tickets/transfer-tickets' className='hover:text-futura-orange transition-colors'>
                                Transfer tickets
                            </Link>
                            </li>
                            <li>
                            <Link href='/footer/tickets/ticket-issue' className='hover:text-futura-orange transition-colors'>
                                Ticket issue
                            </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                    <h3 className='text-lg font-semibold mb-4 text-futura-teal'>
                        Legal
                    </h3>
                    <ul className='space-y-2 text-gray-400 text-sm'>
                        <li>
                            <Link href='/footer/terms' className='hover:text-futura-orange transition-colors'>
                             Terms and Conditions
                            </Link>
                        </li>
                        <li>
                        <Link href='/footer/privacy' className='hover:text-futura-orange transition-colors'>
                            Privacy Policy
                        </Link>
                        </li>
                        <li>
                        <Link href='/footer/cookies' className='hover:text-futura-orange transition-colors'>
                            Cookies Policy
                        </Link>
                        </li>
                        <li>
                        <Link href='/footer/refund' className='hover:text-futura-orange transition-colors'>
                            Refund Policy
                        </Link>
                        </li>
                    </ul>
                    </div>
                </div>
                <div className='border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-gray-400 text-sm mb-4 md:mb-0'>
                    © {new Date().getFullYear()} Futura Tickets. All rights reserved.
                    </p>
                    <div className='flex gap-4'>
    <Link 
        href="https://www.linkedin.com/company/futuratickets" 
        target="_blank" 
        rel="noopener noreferrer"
    >
        <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full hover:bg-white/5 hover:text-futura-teal'
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        </Button>
    </Link>
    <Link 
        href="https://www.instagram.com/futuratickets/" 
        target="_blank" 
        rel="noopener noreferrer"
    >
        <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full hover:bg-white/5 hover:text-futura-teal'
        >
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
                <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
            </svg>
        </Button>
    </Link>
    <Link 
        href="https://twitter.com/futuratickets" 
        target="_blank" 
        rel="noopener noreferrer"
    >
        <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full hover:bg-white/5 hover:text-futura-teal'
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 50 50"
                fill="currentColor"
                stroke="none"
            >
                <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
            </svg>
        </Button>
    </Link>
    <Link 
        href="https://www.tiktok.com/@futuratickets" 
        target="_blank" 
        rel="noopener noreferrer"
    >
        <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full hover:bg-white/5 hover:text-futura-teal'
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
        </Button>
    </Link>
</div>
                </div>
            </div>
        </footer>
    )

}