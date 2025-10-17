'use client';

import { Header } from '@/components/header';

export default function RefundPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>Refund Policy</h1>
            
           
            
            <p className='text-center mb-8'><strong>Last updated: 28/05/2025</strong></p>

            <p className='mb-12'>At Futura Tickets, we strive to provide clarity and fairness in all refund matters. This Refund Policy explains your rights and the procedures in case of event cancellation, significant changes, or problems with your tickets. Our policy complies with applicable Spanish and European Union consumer protection laws.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>1. Event Cancellation</h3>
            <p className='mb-4'>If an event is cancelled and not rescheduled, you are entitled to a full refund of the ticket price and any applicable service fees (except where stated otherwise).</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Refunds will be processed automatically to the original payment method within 7–14 business days after the official cancellation notice.</li>
              <li>You will be notified by email and/or in your Futura Tickets account dashboard with instructions and the timeline for your refund.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>2. Event Postponement or Significant Change</h3>
            <p className='mb-4'>If an event is postponed or significantly rescheduled, your ticket will usually remain valid for the new date.</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>If you cannot attend the rescheduled event, you may request a refund within the period specified in the notification (typically 7–14 days).</li>
              <li>Requests after this period may not be honored, except in cases of exceptional circumstances.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>3. Problems with Tickets</h3>
            <p className='mb-4'>If your ticket is invalid, not delivered, or there is a technical error attributable to Futura Tickets, you are entitled to a full refund or replacement ticket.</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Please contact support at support@futuratickets.com with your order details, and we will investigate and resolve the issue as quickly as possible.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>4. Refund Requests Procedure</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Refund requests must be submitted via your Futura Tickets account or by contacting support@futuratickets.com, including your order number, event name, and reason for the request.</li>
              <li>Refunds are issued to the original payment method. We cannot process refunds to different accounts or methods for security reasons.</li>
              <li>Once your refund is processed, you will receive a confirmation email.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>5. Fees and Exceptions</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Some service fees (such as payment processing fees) may be non-refundable, unless required by law or explicitly stated otherwise.</li>
              <li>Tickets purchased through resale may be subject to additional conditions, which will be stated at the time of purchase.</li>
              <li>Refunds are not provided for lost, stolen, damaged, or resold tickets outside the Futura Tickets platform.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>6. Force Majeure</h3>
            <p className='mb-8'>Futura Tickets is not responsible for events cancelled or altered due to force majeure (e.g., natural disasters, government restrictions, strikes, or public health emergencies), but we will always follow the refund and compensation guidelines provided by the event organizer and the law.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>7. Organizer-Initiated Refunds</h3>
            <p className='mb-8'>In some cases, refunds may be processed directly by the event organizer according to their own policies. Futura Tickets will inform you if this applies and provide all necessary instructions.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>8. Your Rights</h3>
            <p className='mb-8'>Nothing in this policy affects your statutory rights under Spanish or European law.</p>
            <p className='mb-8'>For additional information about your rights as a consumer, you may contact the Spanish Consumer Protection Agency (Agencia Española de Consumo) or your local consumer authority.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>9. Contact</h3>
            <p className='mb-4'>If you have any questions or need help with a refund, contact:</p>
            <p className='mb-8'>
              <strong>support@futuratickets.com</strong><br /><br />
              Futura Tickets S.L., Madrid, Spain
            </p>

            <div className='border-b border-white/10 mb-8' />

            <p className='text-center mt-12 font-bold'>Thank you for trusting Futura Tickets. We are committed to making your experience secure, transparent, and fair.</p>
          </div>
        </div>
      </div>
    </div>
  );
}