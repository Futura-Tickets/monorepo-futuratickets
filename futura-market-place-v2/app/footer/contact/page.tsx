'use client';

import { Header } from '@/components/header';


export default function ContactPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-4'>Contact Us</h1>
          <h2 className='text-2xl font-bold mb-6'>We're Here to Help – Contact Futura Tickets Support</h2>
          
          <div className='prose prose-invert max-w-none mb-8'>
            <p>
              At Futura Tickets, we're committed to providing fast, reliable, and transparent customer support. 
              Whether you have a question about your tickets, need technical assistance, want to partner with us, 
              or require press information, our dedicated team is here to assist you.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>📨</span> General Support
              </h3>
              <div className='space-y-4 text-gray-300'>
                <div>
                  <p className='font-bold'>Email: support@futuratickets.com</p>
                  <p className='text-sm italic'>
                    (Recommended for all support requests and troubleshooting. Please include your order number or event name for faster assistance.)
                  </p>
                </div>
                <div>
                  <p className='font-bold'>Phone: +34 659 631 270</p>
                  <p className='text-sm italic'>
                    (Available Monday to Friday, 09:00–18:00 CET. For urgent issues outside these hours, leave a voicemail or use our live chat.)
                  </p>
                </div>
                <div>
                  <p className='font-bold'>Live Chat:</p>
                  <p className='text-sm'>
                    Access our chat widget at the bottom right of your screen for real-time help during business hours.
                    If our agents are offline, you can leave your message and we'll respond as soon as possible.
                  </p>
                </div>
              </div>
            </div>

            
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>🎟️</span> For Event Organizers & Partners
              </h3>
              <p className='text-gray-300'>
                <span className='font-bold'>Email: partners@futuratickets.com</span><br />
                <span className='text-sm italic'>
                  (For partnerships, integrations, business proposals, or to schedule a product demo.)
                </span>
              </p>
            </div>
          </div>

          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>📰</span> Media & Press Inquiries
              </h3>
              <p className='text-gray-300'>
                <span className='font-bold'>Email: press@futuratickets.com</span><br />
                <span className='text-sm italic'>
                  (For interviews, press releases, or to request company information.)
                </span>
              </p>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <h3 className='text-xl font-bold mb-4 flex items-center'>
                <span className='mr-2'>🛡️</span> Security & Privacy Concerns
              </h3>
              <p className='text-gray-300'>
                <span className='font-bold'>Email: security@futuratickets.com</span><br />
                <span className='text-sm italic'>
                  (For GDPR inquiries, data subject requests, or to report suspicious activity.)
                </span>
              </p>
            </div>
          </div>

          
          <div className='bg-white/5 border border-white/10 rounded-lg p-6 mt-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <span className='mr-2'>📄</span> Mailing Address
            </h3>
            <div className='text-gray-300'>
              <p>Futura Tickets S.L.</p>
              <p>Madrid, Spain</p>
            </div>
          </div>

         
          <div className='bg-white/5 border border-white/10 rounded-lg p-6 mt-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <span className='mr-2'>⏱️</span> Response Times
            </h3>
            <ul className='list-disc list-inside text-gray-300 space-y-2'>
              <li>General inquiries: within 24 hours on business days</li>
              <li>Urgent support: within 2–4 hours during business hours</li>
              <li>Security/Data Protection: within 72 hours in compliance with GDPR</li>
            </ul>
          </div>

          
          <div className='bg-white/5 border border-white/10 rounded-lg p-6 mt-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <span className='mr-2'>🛑</span> Before You Contact Us
            </h3>
            <ul className='list-disc list-inside text-gray-300 space-y-2'>
              <li>Check our Help Center and FAQ for instant answers to the most common questions.</li>
              <li>When emailing, please provide as much detail as possible (order number, event name, description of the issue).</li>
              <li>For privacy and security, never share your password or sensitive payment details via email or chat.</li>
            </ul>
          </div>

          
          <div className='bg-white/5 border border-white/10 rounded-lg p-6 mt-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <span className='mr-2'>🔒</span> Data Protection & Privacy
            </h3>
            <p className='text-gray-300'>
              All personal data provided through our contact forms or communication channels will be processed in accordance 
              with our Privacy Policy and the General Data Protection Regulation (GDPR). You have the right to access, 
              rectify, or erase your data at any time.
            </p>
          </div>

         
          <div className='bg-white/5 border border-white/10 rounded-lg p-6 mt-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <span className='mr-2'>🙌</span> We Value Your Feedback
            </h3>
            <p className='text-gray-300'>
              Your opinion matters. Whether you have suggestions for improvement or want to share your experience 
              with Futura Tickets, let us know at feedback@futuratickets.com.
            </p>
          </div>

          
          <div className='text-center mt-8 text-gray-300'>
            <p className='font-bold'>Thank you for choosing Futura Tickets.</p>
            <p>We're here to support you every step of the way!</p>
          </div>
        </div>
      </div>
    </div>
  );
}