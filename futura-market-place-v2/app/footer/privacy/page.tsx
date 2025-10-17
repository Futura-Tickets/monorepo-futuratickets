'use client';

import { Header } from '@/components/header';

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>Privacy Policy</h1>
            
            
            
            <p className='text-center mb-8'><strong>Last updated: 28/05/2025</strong></p>

            <p className='mb-12'>At Futura Tickets, we are fully committed to protecting your privacy and personal data. We comply with the General Data Protection Regulation (EU Regulation 2016/679, "GDPR") and Spanish data protection law. This Privacy Policy explains what data we collect, why, how we use it, your rights, and how you can exercise them.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>1. Data Controller</h3>
            <p className='mb-8'>
              Futura Tickets S.L.<br />
              CIF: B56827157<br />
              Madrid, Spain<br />
              Email: privacy@futuratickets.com
            </p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>2. What Data Do We Collect?</h3>
            <p className='mb-4'>Depending on your interaction with Futura Tickets, we may collect:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Identification Data:</strong> Name, surname, email, phone number, date of birth, country.</li>
              <li><strong>Account Data:</strong> Username, password (encrypted), preferences, and settings.</li>
              <li><strong>Payment Information:</strong> Credit/debit card details (processed by secure payment providers), billing address, transaction history.</li>
              <li><strong>Event Data:</strong> Tickets purchased, attended, transferred, resold; event preferences and history.</li>
              <li><strong>Technical Data:</strong> IP address, device and browser information, cookies, log data, usage analytics.</li>
              <li><strong>Communications:</strong> Emails, chat logs, customer service interactions, feedback, survey responses.</li>
            </ul>
            <p className='mb-8'>We do not intentionally collect data from persons under 16 years of age. If we become aware of such collection, we will delete the data promptly.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>3. How Do We Use Your Data?</h3>
            <p className='mb-4'>We process your personal data for the following purposes:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>To provide our services:</strong> Ticket purchase, transfer, resale, event entry, user account management.</li>
              <li><strong>To process payments:</strong> Managing orders and refunds through secure payment gateways.</li>
              <li><strong>To ensure platform security:</strong> Fraud prevention, anti-counterfeiting, user verification, and blockchain-based ticket validation.</li>
              <li><strong>To communicate with you:</strong> Service updates, event notifications, support messages, marketing (only if you have consented).</li>
              <li><strong>To improve our services:</strong> Usage analytics, surveys, feedback to enhance user experience and develop new features.</li>
              <li><strong>To comply with legal obligations:</strong> Record-keeping, accounting, responding to regulatory authorities, and enforcing our terms.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>4. Legal Basis for Processing</h3>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Performance of contract:</strong> When you register, buy, transfer, or resell tickets.</li>
              <li><strong>Legal obligation:</strong> To comply with Spanish and EU law, tax regulations, anti-fraud, and consumer rights.</li>
              <li><strong>Legitimate interest:</strong> Platform security, service improvement, and analytics (provided it does not override your rights).</li>
              <li><strong>Consent:</strong> For marketing communications or optional features. You can withdraw consent at any time.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>5. Who Has Access to Your Data?</h3>
            <p className='mb-4'>Your personal data is processed only by authorized personnel at Futura Tickets.</p>
            <p className='mb-4'>We may share your data with:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Payment service providers</strong> (for processing transactions, with strong security).</li>
              <li><strong>Event organizers or promoters</strong> (when necessary for ticketing and event entry, subject to their own privacy policies).</li>
              <li><strong>IT and cloud service providers</strong> (for hosting and technical maintenance, under strict confidentiality agreements).</li>
              <li><strong>Legal or regulatory authorities</strong> (when required by law or for defense of rights).</li>
            </ul>
            <p className='mb-8'>We never sell your data to third parties. Data is processed mainly within the European Economic Area (EEA). If transferred outside the EEA, we ensure adequate protection and compliance.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>6. Data Retention</h3>
            <p className='mb-4'>We keep your data only as long as necessary for the purposes stated, legal obligations, or until you delete your account (unless otherwise required by law).</p>
            <p className='mb-4'>For example:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Account and transaction data:</strong> Retained as long as your account is active, plus the legal period for tax/accounting.</li>
              <li><strong>Support communications:</strong> Up to 5 years for service quality and legal defense.</li>
              <li><strong>Marketing consent:</strong> Until you withdraw your consent.</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>7. Your Rights</h3>
            <p className='mb-4'>Under the GDPR, you have the following rights:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li><strong>Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li><strong>Erasure ("Right to be Forgotten"):</strong> Request deletion of your data, except where we must keep it by law.</li>
              <li><strong>Restriction:</strong> Limit processing of your data in certain cases.</li>
              <li><strong>Portability:</strong> Receive your data in a commonly used, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests or direct marketing.</li>
              <li><strong>Withdraw consent:</strong> At any time, without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className='mb-8'>You can exercise your rights by emailing privacy@futuratickets.com.</p>
            <p className='mb-8'>You also have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD) or your local supervisory authority.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>8. Cookies and Tracking</h3>
            <p className='mb-8'>We use cookies and similar technologies to improve your experience, analyze site usage, and personalize content. See our [Cookie Policy] for full details and how to manage your preferences.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>9. Data Security</h3>
            <p className='mb-4'>We implement technical and organizational measures to protect your data against unauthorized access, loss, destruction, or alteration, including:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>SSL/TLS encryption</li>
              <li>Secure data centers and cloud providers</li>
              <li>Access controls and staff training</li>
              <li>Blockchain technology for ticket verification</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>10. Changes to this Policy</h3>
            <p className='mb-8'>We may update this Privacy Policy from time to time to reflect legal changes or service improvements. Significant changes will be communicated to you via email or platform notice. The latest version will always be available on our website.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>11. Contact Us</h3>
            <p className='mb-4'>If you have any questions or wish to exercise your data rights, please contact:</p>
            <p className='mb-8'>
              <strong>privacy@futuratickets.com</strong><br /><br />
              Futura Tickets S.L., Madrid, Spain
            </p>

            <div className='border-b border-white/10 mb-8' />

            <p className='text-center mt-12 font-bold'>Your privacy matters. Thank you for trusting Futura Tickets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}