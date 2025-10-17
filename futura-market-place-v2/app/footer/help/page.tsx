'use client';

import { Header } from '@/components/header';

export default function HelpCenterPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-8'>Help Center</h1>
          
       
          <div className='prose prose-invert max-w-none'>
            <div className='bg-white/5 border border-white/10 rounded-lg p-6 mb-8'>
              <h2 className='text-2xl font-bold mb-4 text-futura-teal'>Welcome to Futura Tickets Help Center</h2>
              <p className='text-gray-300 mb-4'>
                At Futura Tickets, our mission is to make your experience as secure, seamless, and enjoyable as possible—whether you are a ticket buyer, event organizer, or reseller.
              </p>
            </div>
 
            <div className='space-y-8'>
             
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>1. Getting Started with Futura Tickets</h3>
                
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>What is Futura Tickets?</h4>
                    <p className='text-gray-300'>
                      Futura Tickets is a next-generation ticketing platform designed to provide secure, transparent, and efficient ticket sales and resales for events using blockchain and AI technology.
                    </p>
                  </div>

                  <div>
                    <h4 className='font-bold text-white mb-2'>Creating an Account</h4>
                    <p className='text-gray-300'>
                      Step-by-step instructions on how to sign up, verify your identity, and get started.
                    </p>
                  </div>

                  <div>
                    <h4 className='font-bold text-white mb-2'>User Dashboard Overview</h4>
                    <p className='text-gray-300'>
                      Learn about the dashboard features, how to navigate your tickets, transfer them, and monitor your event activities.
                    </p>
                  </div>
                </div>
              </div>

         
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>2. Purchasing and Managing Tickets</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>How to Purchase Tickets</h4>
                    <p className='text-gray-300'>
                      Detailed guide on browsing events, selecting tickets, and completing your purchase.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Managing Your Tickets</h4>
                    <p className='text-gray-300'>
                      Instructions on how to view, transfer, or sell your tickets through our platform.
                    </p>
                  </div>
                </div>
              </div>

          
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>3. Transferring and Reselling Tickets</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Ticket Transfer Process</h4>
                    <p className='text-gray-300'>
                      Learn how to securely transfer your tickets to another user.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Reselling Tickets</h4>
                    <p className='text-gray-300'>
                      Guidelines on how to list your tickets for resale, including setting prices and managing offers.
                    </p>
                  </div>
                </div>
              </div>

         
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>4. Attending Events</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Event Entry Guidelines</h4>
                    <p className='text-gray-300'>
                      Important information on how to access the event, including ticket verification and entry procedures.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>What to Expect at the Event</h4>
                    <p className='text-gray-300'>
                      Tips on event etiquette, safety protocols, and how to make the most of your experience.
                    </p>
                  </div>
                </div>
              </div>

         
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>5. Organizer and Promoter Support</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Organizer Dashboard</h4>
                    <p className='text-gray-300'>Learn how to create, manage, and monitor events, set up ticket tiers, and track real-time sales analytics.</p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Event Analytics & Reports</h4>
                    <p className='text-gray-300'>Access and interpret sales data, attendee demographics, and performance KPIs.</p>
                  </div>
                </div>
              </div>

          
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>6. Troubleshooting and Technical Support</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Common Issues & Solutions</h4>
                    <ul className='list-disc list-inside text-gray-300 ml-4'>
                      <li>Problems with login or registration</li>
                      <li>Payment or checkout errors</li>
                      <li>Ticket transfer issues</li>
                      <li>QR code problems</li>
                    </ul>
                  </div>
                </div>
              </div>

             
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>7. Security, Privacy, and Compliance</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Your Data & GDPR</h4>
                    <p className='text-gray-300'>Understanding how we protect your personal information and comply with EU GDPR regulations.</p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Security Measures</h4>
                    <p className='text-gray-300'>Learn about our blockchain-based security and fraud prevention systems.</p>
                  </div>
                </div>
              </div>

              
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>8. Policies and Legal Resources</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Terms & Conditions</h4>
                    <p className='text-gray-300'>Detailed explanation of your rights and obligations as a Futura Tickets user.</p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Refund & Cancellation Policy</h4>
                    <p className='text-gray-300'>Information about refunds, cancellations, and rescheduled events.</p>
                  </div>
                </div>
              </div>

              
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>9. Feedback & Continuous Improvement</h3>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Give Us Your Feedback</h4>
                    <p className='text-gray-300'>Share your experience and suggestions to help us improve our service.</p>
                  </div>
                  <div>
                    <h4 className='font-bold text-white mb-2'>Community Updates</h4>
                    <p className='text-gray-300'>Stay informed about new features, improvements, and special offers.</p>
                  </div>
                </div>
              </div>

              
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-xl font-bold mb-4 text-futura-teal'>10. Need More Help?</h3>
                <p className='text-gray-300 mb-4'>
                  If you can't find the answer you're looking for, our support team is here to help:
                </p>
                <ul className='list-none space-y-2 text-gray-300'>
                  <li>Email: support@futuratickets.com</li>
                  <li>Phone: +34 659 631 270</li>
                  <li>Live Chat: Available 09:00–18:00 (CET) Monday to Friday</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}