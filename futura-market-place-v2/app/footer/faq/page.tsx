'use client';

import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-3xl font-bold mb-4'>FAQ</h1>
          <h2 className='text-2xl font-bold mb-6'>Frequently Asked Questions</h2>
          
          <div className='prose prose-invert max-w-none mb-8'>
            <p>
              Here you'll find clear answers to the most common questions about our ticketing platform, 
              event participation, ticket transfer and resale, refunds, security, and more. If you don't 
              find your answer here, please check our Help Center or Contact Us page.
            </p>
          </div>

          <div className='space-y-8'>
       
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>General</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='what-is'>
                  <AccordionTrigger>What is Futura Tickets and how does it work?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Futura Tickets is a secure digital platform for buying, selling, and managing event tickets using blockchain and artificial intelligence. Our system ensures ticket authenticity, prevents fraud, and offers data-driven insights to event organizers and attendees.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='account'>
                  <AccordionTrigger>Do I need to create an account to use Futura Tickets?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Yes, you need to create a user account to buy, sell, or transfer tickets. Registration is quick and helps ensure the security and traceability of all transactions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='events'>
                  <AccordionTrigger>Which events can I buy tickets for?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    You can buy tickets for all events listed on our platform: concerts, festivals, sports, and more. Use our search and filter tools to find your favorite events.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Ticket Purchase & Management</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='purchase'>
                  <AccordionTrigger>How do I purchase a ticket?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Browse events, select your preferred ticket, and follow the checkout process. Payments are processed securely using your chosen method. You will receive your ticket instantly in your Futura Tickets account.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='payment'>
                  <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    We accept major credit/debit cards, as well as selected cryptocurrencies and digital wallets. See our Payments Guide for full details.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='access'>
                  <AccordionTrigger>How do I access my ticket after purchase?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Your ticket is immediately available in your account dashboard. You can view the QR code, download a PDF, or add the ticket to your mobile wallet.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

      
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Ticket Transfer & Resale</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='transfer'>
                  <AccordionTrigger>Can I transfer my ticket to someone else?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Yes. Select the ticket in your dashboard, choose "Transfer Ticket," and enter the recipient's email. The transfer is processed securely via blockchain, ensuring authenticity.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='transfer-fee'>
                  <AccordionTrigger>Is there a fee for transferring tickets?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Standard transfers between users are usually free, but in some cases (e.g., certain event types or late transfers), a small administrative fee may apply. Details are shown before confirming the transfer.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='resale'>
                  <AccordionTrigger>How do I resell a ticket?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Go to your ticket, click "Sell," set your price, and list it on the Futura Tickets marketplace. Once sold, you'll receive payment minus the platform fee.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Event Attendance & Entry</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='entry'>
                  <AccordionTrigger>How do I enter an event with my ticket?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Show your digital ticket QR code at the entrance (either from your phone or a printed version). If you have any issues at the venue, staff can assist you on site.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='qr-issues'>
                  <AccordionTrigger>What happens if my ticket QR code doesn't work at the entrance?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Contact event staff or use our emergency support contact. Your ticket's blockchain record will be verified and any issue will be resolved promptly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Refunds & Cancellations</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='refund-policy'>
                  <AccordionTrigger>What is your refund policy?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    If the event is cancelled or significantly rescheduled, you are entitled to a full or partial refund as specified in the event terms. Refund requests must be submitted through your account within the period indicated for each event. Some service fees may be non-refundable.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='refund-time'>
                  <AccordionTrigger>How long does it take to receive a refund?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Refunds are typically processed within 7–14 business days after approval, depending on your payment method.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Security & Privacy</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='fraud-protection'>
                  <AccordionTrigger>How does Futura Tickets protect against fraud?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    We use blockchain technology for ticket issuance and tracking, making tickets tamper-proof and traceable. Our AI systems detect suspicious activity and prevent unauthorized resales or duplication.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='data-protection'>
                  <AccordionTrigger>Is my personal information safe?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Yes, Futura Tickets complies with GDPR and Spanish data protection laws. We only collect data necessary to provide our services and never share it with third parties without your consent.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

           
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Organizers & Promoters</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='sell-tickets'>
                  <AccordionTrigger>How can I sell tickets for my event on Futura Tickets?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Register as an organizer, complete the event setup form, and our team will review and approve your event. Once approved, you can start selling tickets and access real-time analytics.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='organizer-support'>
                  <AccordionTrigger>What support do organizers receive?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Organizers benefit from dedicated support, training resources, dashboard analytics, and integration tools for payments, marketing, and CRM.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

           
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Technical Issues</h3>
              <Accordion type='single' collapsible className='space-y-4'>
                <AccordionItem value='login-issues'>
                  <AccordionTrigger>I can't log in or reset my password—what should I do?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Click "Forgot Password" on the login page, enter your registered email, and follow the instructions. If you continue to have issues, contact our support team.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='technical-problems'>
                  <AccordionTrigger>The website/app isn't working properly—what now?</AccordionTrigger>
                  <AccordionContent className='text-gray-300'>
                    Try clearing your browser cache or updating the app. If the issue persists, contact support and describe your problem in detail, including your device and browser version.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 text-futura-teal'>Need More Help?</h3>
              <p className='text-gray-300'>
                If you can't find what you're looking for, please reach out via our Contact Us page, Live Chat, 
                or email support@futuratickets.com. We're here to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}