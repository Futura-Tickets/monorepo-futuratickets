'use client';

import { Header } from '@/components/header';

export default function TicketIssuePage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-4'>Ticket Issues</h1>
          <h2 className='text-2xl font-bold mb-6'>Having Trouble with Your Tickets? We&apos;re Here to Help</h2>
          
          <div className='prose prose-invert max-w-none mb-8'>
            <p>
              At Futura Tickets, we understand that issues with your tickets can be stressful&mdash;especially close to an event. 
              Our support team is dedicated to resolving your problem quickly and efficiently, whether it&apos;s a missing ticket, 
              invalid QR code, transfer error, or any other issue.
            </p>
          </div>

          <div className='space-y-8'>
           
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>🛠️</span> Common Ticket Problems and Solutions
              </h3>
              <div className='space-y-6'>
                <div>
                  <h4 className='font-bold text-futura-teal mb-2'>1. I can&apos;t find my ticket after purchase</h4>
                  <ul className='list-disc list-inside text-gray-300 space-y-2'>
                    <li>Double-check your &quot;My Tickets&quot; dashboard&mdash;sometimes tickets appear after refreshing the page.</li>
                    <li>Look for a confirmation email (check your spam/junk folder).</li>
                    <li>If you purchased multiple tickets, each should appear individually.</li>
                    <li>If your ticket is still missing, contact support with your order number and event details.</li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-bold text-futura-teal mb-2'>2. My QR code isn&apos;t working or is unreadable</h4>
                  <ul className='list-disc list-inside text-gray-300 space-y-2'>
                    <li>Make sure your device screen brightness is high when scanning at the venue.</li>
                    <li>Try downloading the PDF and printing your ticket.</li>
                    <li>If the QR code is still invalid, our support staff at the venue or online can immediately verify your ownership using blockchain records and resolve the issue.</li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-bold text-futura-teal mb-2'>3. Problem with ticket transfer or resale</h4>
                  <ul className='list-disc list-inside text-gray-300 space-y-2'>
                    <li>Confirm the recipient&apos;s email is correct and that they have (or created) a Futura Tickets account.</li>
                    <li>If the transfer is pending, you can cancel or resend the invitation from your dashboard.</li>
                    <li>If the recipient has not received the email, have them check spam folders or contact support.</li>
                    <li>If a transfer or resale fails, our technical team will assist in restoring the ticket or refunding the transaction, as appropriate.</li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-bold text-futura-teal mb-2'>4. Event cancellation, postponement, or changes</h4>
                  <ul className='list-disc list-inside text-gray-300 space-y-2'>
                    <li>If the event is cancelled, you are eligible for a refund as per our <a href="/refund-policy" className='text-futura-teal hover:underline'>Refund Policy</a>.</li>
                    <li>For postponed events, tickets usually remain valid for the new date.</li>
                    <li>If you cannot attend the new date, contact support to discuss possible solutions or refunds.</li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-bold text-futura-teal mb-2'>5. Ticket marked as "invalid" or "already used"</h4>
                  <ul className='list-disc list-inside text-gray-300 space-y-2'>
                    <li>This may occur if a ticket was transferred or resold after your purchase. Please contact support immediately with your order details for investigation and resolution.</li>
                  </ul>
                </div>
              </div>
            </div>

         
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>📝</span> What Information to Provide When Contacting Support
              </h3>
              <p className='text-gray-300 mb-4'>To help us solve your issue as fast as possible, please provide:</p>
              <ul className='list-disc list-inside text-gray-300 space-y-2'>
                <li>Your full name and email address used on your Futura Tickets account.</li>
                <li>The order number and event name.</li>
                <li>A clear description of the problem (e.g., missing ticket, error message).</li>
                <li>Screenshots or photos, if available.</li>
              </ul>
            </div>

         
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>🛡️</span> Your Rights and Protection
              </h3>
              <ul className='list-disc list-inside text-gray-300 space-y-2'>
                <li>All tickets are protected by blockchain technology, ensuring authenticity and allowing our team to verify the true status of every ticket instantly.</li>
                <li>Your consumer rights are fully respected under Spanish and EU law, including the right to refunds for cancelled events and protection against fraud.</li>
                <li>All your data is handled securely and in compliance with GDPR.</li>
              </ul>
            </div>

          
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>🧑‍💻</span> How to Reach Support
              </h3>
              <ul className='list-disc list-inside text-gray-300 space-y-2'>
                <li><strong>Email:</strong> support@futuratickets.com (recommended for most issues)</li>
                <li><strong>Live Chat:</strong> Use our online widget for real-time help during business hours</li>
                <li><strong>Phone:</strong> +34 659 631 270 (urgent problems only)</li>
                <li><strong>Venue Assistance:</strong> For urgent event-day issues, find the Futura Tickets help desk at the venue entrance.</li>
              </ul>
              <p className='text-gray-300 mt-4'>
                We aim to resolve all urgent ticket issues within a few hours during business days and provide immediate assistance during event times.
              </p>
            </div>

       
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>⚠️</span> Preventing Future Issues
              </h3>
              <ul className='list-disc list-inside text-gray-300 space-y-2'>
                <li>Always use your Futura Tickets account to manage tickets&mdash;never buy from unverified sources.</li>
                <li>Never share your account password or ticket QR codes with others.</li>
                <li>Keep your account information up to date to ensure smooth communication.</li>
              </ul>
            </div>

       
            <div className='text-center text-gray-300 mt-8'>
              <p className='font-bold'>Futura Tickets &ndash; Your safety and satisfaction are our top priority.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}