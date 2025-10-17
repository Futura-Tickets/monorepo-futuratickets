'use client';

import { Header } from '@/components/header';

export default function MyTicketsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>My tickets</h1>
            
           
            
            <p className='text-2xl text-center mb-8'><strong>Welcome to Your Futura Tickets Dashboard</strong></p>

            <p className='mb-12'>This is your personal space to view, manage, and use all your event tickets securely. With Futura Tickets, you are always in control—every ticket is protected by advanced blockchain technology for authenticity and peace of mind.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🎟️ What You Can Do Here</h3>
            <ul className='mb-8 space-y-4'>
              <li>
                <strong>View Your Tickets:</strong>
                <p className='mt-2'>Instantly access all tickets you have purchased, received, or transferred to your account. Tickets are displayed with event details, purchase date, and status.</p>
              </li>
              <li>
                <strong>Download or Add to Wallet:</strong>
                <p className='mt-2'>Download tickets as PDFs or add them to your Apple/Google Wallet for fast entry at events. Each ticket includes a unique, tamper-proof QR code.</p>
              </li>
              <li>
                <strong>Check Event Information:</strong>
                <p className='mt-2'>View detailed information for each event: venue, date, seat assignment (if applicable), and organizer contact.</p>
              </li>
              <li>
                <strong>Transfer or Resell Tickets:</strong>
                <p className='mt-2'>If your plans change, you can securely transfer tickets to friends or list them for resale directly from this page. All transfers and sales are tracked and protected by blockchain verification.</p>
              </li>
              <li>
                <strong>Track Ticket History:</strong>
                <p className='mt-2'>See the full history of each ticket—purchases, transfers, resales—ensuring transparency and preventing fraud.</p>
              </li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🛡️ Ticket Security & Authenticity</h3>
            <p className='mb-4'>All tickets in your dashboard are protected by blockchain, ensuring they are genuine and cannot be counterfeited or duplicated. Only the verified ticket holder will be granted access to the event.</p>
            <ul className='mb-8 space-y-4'>
              <li>
                <strong>Verified Ownership:</strong>
                <p className='mt-2'>You can prove ownership of your ticket at any time. For each ticket, you can view its blockchain verification record.</p>
              </li>
              <li>
                <strong>Secure QR Codes:</strong>
                <p className='mt-2'>Your QR code is unique and cannot be copied for fraudulent use. Scanning at the event is instant and 100% secure.</p>
              </li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>⚠️ Problems with Your Tickets?</h3>
            <p className='mb-4'>If you cannot see a ticket you purchased, if details are incorrect, or if a QR code isn't working, please:</p>
            <ol className='list-decimal pl-6 mb-8 space-y-2'>
              <li>Refresh the page or log out and back in.</li>
              <li>Check your purchase confirmation email for the order number.</li>
              <li>Contact our support team immediately at support@futuratickets.com, providing your name, event details, and order number for fastest resolution.</li>
            </ol>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🔁 Ticket Transfer & Resale</h3>
            <ul className='mb-8 space-y-4'>
              <li>
                <strong>To Transfer a Ticket:</strong>
                <ul className='list-disc pl-6 mt-2 space-y-2'>
                  <li>Select the ticket.</li>
                  <li>Click "Transfer Ticket."</li>
                  <li>Enter the recipient's email address.</li>
                  <li>Confirm the transfer—blockchain will record and verify it.</li>
                  <li>The new owner will receive a confirmation email and instant access.</li>
                </ul>
              </li>
              <li>
                <strong>To Resell a Ticket:</strong>
                <ul className='list-disc pl-6 mt-2 space-y-2'>
                  <li>Click "Sell Ticket."</li>
                  <li>Set your resale price (may be subject to event rules).</li>
                  <li>Confirm and list the ticket on our marketplace.</li>
                  <li>Once sold, payment is processed and your ticket status is updated.</li>
                </ul>
              </li>
            </ul>
            <p className='mb-8 italic'>For full rules and possible transfer/re-sale fees, see our [Terms & Conditions] or the [FAQ].</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🔒 Privacy and Security</h3>
            <p className='mb-8'>Your ticket and personal information are stored securely and in compliance with GDPR and Spanish data protection laws. Only you can access your tickets unless you explicitly transfer or resell them.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>📅 Upcoming Events</h3>
            <p className='mb-8'>A special section highlights your next events at a glance, so you never miss a date. Set event reminders or sync with your personal calendar directly from your dashboard.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>📱 Access Anywhere</h3>
            <p className='mb-8'>You can access "My Tickets" from any device—mobile, tablet, or desktop. For convenience and extra security, enable two-factor authentication in your account settings.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🧾 Download Receipts</h3>
            <p className='mb-8'>For each ticket, you can download a purchase receipt or invoice for your records or reimbursement purposes.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>Need Further Help?</h3>
            <p className='mb-4'>If you experience any issue or need assistance managing your tickets, please contact our support team via [Contact Us], [Live Chat], or email support@futuratickets.com.</p>
            <p className='mb-8'>We are here to ensure you never lose access to your events!</p>

            <div className='border-b border-white/10 mb-8' />

            <p className='text-center mt-12 font-bold'>Futura Tickets – Secure, smart ticket management for every event.</p>
          </div>
        </div>
      </div>
    </div>
  );
}