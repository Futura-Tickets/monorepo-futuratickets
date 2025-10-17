'use client';

import { Header } from '@/components/header';

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>Term and conditions</h1>
            
            <h2 className='text-4xl font-bold text-center mb-8'>Terms and Conditions</h2>
            
            <p className='text-center mb-8'><strong>Last updated: 28/05/2025</strong></p>

            <p className='mb-12'>Welcome to Futura Tickets. These Terms and Conditions ("Terms") govern your access to and use of the Futura Tickets platform, services, and any associated applications, whether you are a ticket buyer, event organizer, promoter, or visitor. By using our services, you agree to comply with these Terms and all applicable laws and regulations.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>1. About Futura Tickets</h3>
            <p className='mb-8'>Futura Tickets is a secure, digital platform for buying, selling, transferring, and managing event tickets using advanced blockchain and AI technology. The service is operated by Futura Tickets S.L., registered in Spain (CIF: B56827157), Madrid.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>2. Eligibility and Account Registration</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>You must be at least 16 years old to register and use Futura Tickets.</li>
              <li>All users must provide accurate, current, and complete information during registration and keep it updated.</li>
              <li>You are responsible for maintaining the confidentiality and security of your account credentials.</li>
              <li>Any unauthorized use of your account must be reported to Futura Tickets immediately.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>3. Use of the Platform</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>You agree to use Futura Tickets only for lawful purposes and not for fraudulent, speculative, or abusive activities.</li>
              <li>Tickets purchased or obtained through the platform are for personal use unless otherwise specified.</li>
              <li>You may not resell tickets outside the Futura Tickets marketplace if such resale is prohibited by the event organizer or by law.</li>
              <li>Attempts to manipulate, copy, or counterfeit tickets are strictly prohibited and may result in legal action.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>4. Ticket Purchase, Transfer, and Resale</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>All purchases are binding once confirmed, subject to the event's specific terms (e.g., age restrictions, entry requirements).</li>
              <li>Transfers and resales must be conducted through Futura Tickets' secure system. Blockchain technology ensures authenticity and transparency in every transaction.</li>
              <li>Some events may restrict transfers or resales. All restrictions will be clearly stated before purchase.</li>
              <li>Futura Tickets is not responsible for tickets acquired outside the official platform or via unauthorized third parties.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>5. Payments and Fees</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>All prices and fees will be displayed in euros (€) and include taxes unless otherwise specified.</li>
              <li>Accepted payment methods include credit/debit cards, select digital wallets, and cryptocurrencies as indicated at checkout.</li>
              <li>Service fees, transaction fees, or resale commissions may apply and will be shown before confirming your order.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>6. Cancellations, Refunds, and Changes</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Refunds are granted only in cases of event cancellation, significant schedule changes, or as otherwise required by law or event-specific terms.</li>
              <li>To request a refund, follow the procedures detailed in our [Refund Policy]. Some service fees may be non-refundable.</li>
              <li>If an event is postponed, your ticket will remain valid for the new date unless otherwise communicated.</li>
              <li>Futura Tickets will communicate event changes via email or your account dashboard as soon as information is received from the event organizer.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>7. Organizer and Promoter Responsibilities</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Organizers are responsible for providing accurate event information, delivering the contracted experience, and honoring all valid tickets sold through the platform.</li>
              <li>Futura Tickets reserves the right to withhold payouts or suspend events in cases of suspected fraud, legal noncompliance, or unresolved disputes.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>8. User Conduct</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Users may not use the platform to harass, threaten, or abuse others, nor to upload malicious software or attempt unauthorized access.</li>
              <li>Futura Tickets reserves the right to suspend or terminate accounts that violate these terms, with or without notice.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>9. Data Protection & Privacy</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Futura Tickets processes personal data in accordance with the General Data Protection Regulation (GDPR) and Spanish data protection law.</li>
              <li>Please see our [Privacy Policy] for details on how your data is collected, stored, and used.</li>
              <li>You have the right to access, rectify, or delete your data, as well as to object to certain processing activities.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>10. Intellectual Property</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>All software, content, branding, and trademarks on the Futura Tickets platform are the exclusive property of Futura Tickets S.L. or its licensors.</li>
              <li>You may not use, copy, or distribute any part of the platform without express written consent.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>11. Disclaimers & Limitation of Liability</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Futura Tickets provides its services "as is" and does not guarantee that the platform will always be secure, error-free, or uninterrupted.</li>
              <li>Futura Tickets is not liable for losses arising from force majeure events, third-party actions, or issues outside its reasonable control.</li>
              <li>To the fullest extent permitted by law, Futura Tickets' liability is limited to the value of the affected ticket or transaction.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>12. Changes to Terms</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Futura Tickets reserves the right to modify these Terms at any time. Users will be notified of significant changes via email or platform notice.</li>
              <li>Continued use of the platform after updates constitutes acceptance of the revised Terms.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>13. Governing Law & Jurisdiction</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>These Terms are governed by Spanish law. Any disputes arising from these Terms or the use of Futura Tickets shall be subject to the exclusive jurisdiction of the courts of Madrid, Spain.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>14. Contact</h3>
            <p className='mb-8'>For any questions or concerns regarding these Terms, please contact us at:</p>

            <p className='mb-4'><strong>Email:</strong> legal@futuratickets.com</p>

            <p className='mb-8'><strong>Mail:</strong> Futura Tickets S.L., Madrid, Spain</p>

            <p className='text-center mt-12 font-bold'>By using Futura Tickets, you acknowledge and agree to these Terms and Conditions. Thank you for trusting us with your events and experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}