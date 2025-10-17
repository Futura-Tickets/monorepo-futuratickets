'use client';

import { Header } from '@/components/header';

export default function TransferTicketsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>Transfer Tickets</h1>
            
           
            
            <p className='text-2xl text-center mb-8'><strong>Easily and Securely Transfer Your Event Tickets</strong></p>

            <p className='mb-12'>At Futura Tickets, we make it simple to transfer your tickets to friends, family, or colleagues—all with full security, instant traceability, and total control. Our blockchain-powered technology guarantees that every transfer is genuine, eliminating the risk of fraud and counterfeiting.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🔄 How to Transfer a Ticket</h3>
            <ol className='list-decimal pl-6 mb-8 space-y-2'>
              <li><strong>Go to "My Tickets" in your dashboard.</strong></li>
              <li>Select the ticket you want to transfer.</li>
              <li>Click on the "Transfer Ticket" button.</li>
              <li>Enter the recipient's email address (make sure it's correct; this will become the new ticket owner's account).</li>
              <li>Confirm the transfer. You may be asked to verify your identity for security reasons.</li>
              <li>The recipient will receive an email with instructions to accept the ticket and access it from their own Futura Tickets account.</li>
              <li>You will receive a confirmation as soon as the transfer is completed. The ticket will immediately be removed from your list and registered in the new owner's account.</li>
            </ol>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🛡️ Security & Blockchain Verification</h3>
            <ul className='mb-8 space-y-4'>
              <li>
                <strong>Every transfer is permanently registered on the blockchain.</strong>
                <p className='mt-2'>This guarantees the ticket is authentic and cannot be duplicated or stolen in the process.</p>
              </li>
              <li>
                <strong>Only the final holder of the ticket will be granted access at the event.</strong>
                <p className='mt-2'>The QR code is updated after the transfer, making any previous copies invalid.</p>
              </li>
              <li>
                <strong>Transfer history is fully traceable.</strong>
                <p className='mt-2'>Both you and the recipient can view the transfer's verification record for complete transparency.</p>
              </li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>📝 Requirements & Rules</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Recipient must have (or create) a Futura Tickets account</strong> to receive and use the ticket.</li>
              <li><strong>Transfers can be made up to a specified cut-off time</strong> before the event (set by the organizer).</li>
              <li><strong>Some events may have restrictions on resale or transfers</strong> due to promoter policies or legal requirements. If transfers are not allowed, you will be notified before confirming.</li>
              <li><strong>Futura Tickets never asks for your password or payment details during a transfer.</strong> Beware of phishing attempts.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>💸 Fees</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Standard transfers between users are free</strong> unless otherwise specified by the event organizer.</li>
              <li><strong>Late or last-minute transfers</strong> may incur an administrative fee, shown during the process.</li>
              <li><strong>Check specific event rules</strong> for any additional conditions or restrictions.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>❗ Common Issues & Troubleshooting</h3>
            <ul className='mb-8 space-y-4'>
              <li>
                <strong>Entered the wrong email?</strong>
                <p className='mt-2'>If the recipient has not accepted the ticket yet, you can cancel and resend the transfer.</p>
              </li>
              <li>
                <strong>Recipient didn't receive the email?</strong>
                <p className='mt-2'>Ask them to check their spam folder, or contact support with the transfer details.</p>
              </li>
              <li>
                <strong>Transferred by mistake?</strong>
                <p className='mt-2'>Once the recipient accepts the ticket, the transfer is permanent. If not accepted, you may be able to revoke it within a limited time.</p>
              </li>
              <li>
                <strong>Technical difficulties or urgent problems?</strong>
                <p className='mt-2'>Contact our support team immediately via [Live Chat], email support@futuratickets.com, or phone for priority help.</p>
              </li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>⚖️ Legal & Security Notice</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>All transfers are subject to Futura Tickets' Terms and Conditions, as well as any event-specific regulations.</strong></li>
              <li><strong>Transfer misuse, attempts to resell for profit where not allowed, or fraudulent activities are strictly prohibited and may result in account suspension or legal action.</strong></li>
              <li><strong>All personal data is processed in accordance with our Privacy Policy and GDPR requirements.</strong></li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>🤝 Need Help?</h3>
            <p className='mb-4'>If you have questions or need help with a ticket transfer, visit our [Help Center] or contact us directly.</p>
            <p className='mb-8'>Our team is here to ensure your transfer is safe, fast, and problem-free.</p>

            <div className='border-b border-white/10 mb-8' />

            <p className='text-center mt-12 font-bold'>Futura Tickets – Empowering you to share experiences, safely and instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}