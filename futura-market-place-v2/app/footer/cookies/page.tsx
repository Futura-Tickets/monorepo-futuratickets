'use client';

import { Header } from '@/components/header';

export default function CookiesPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-lg p-6'>
            <h1 className='text-5xl font-bold text-center mb-4'>Cookie Policy</h1>
            
            
            
            <p className='text-center mb-8'><strong>Last updated: 28/05/2025</strong></p>

            <p className='mb-12'>This Cookie Policy explains how Futura Tickets S.L. ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website, use our app, or interact with our services. It describes what these technologies are, why we use them, and your rights to control our use of them.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>1. What are cookies?</h3>
            <p className='mb-8'>Cookies are small text files that are placed on your device (computer, smartphone, tablet) by websites you visit. They are widely used to make websites work, improve your experience, and provide information to site owners.</p>
            <p className='mb-8'>Similar technologies, such as pixels, tags, local storage, and scripts, may also be used and are covered by this policy.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>2. Why do we use cookies?</h3>
            <p className='mb-4'>Futura Tickets uses cookies and related technologies to:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Enable essential website functions and security</li>
              <li>Remember your preferences and language</li>
              <li>Facilitate login and account management</li>
              <li>Analyze site traffic, usage patterns, and performance</li>
              <li>Personalize your experience and content</li>
              <li>Enable social media sharing and marketing features</li>
              <li>Improve our products and services</li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>3. Types of cookies we use</h3>
            <ul className='list-disc pl-6 mb-8 space-y-4'>
              <li>
                <strong>Strictly Necessary Cookies:</strong>
                <p className='mt-2'>These cookies are essential for you to browse our website, log in, and use secure areas. Without them, some services may not function.</p>
              </li>
              <li>
                <strong>Performance & Analytics Cookies:</strong>
                <p className='mt-2'>These cookies help us understand how visitors interact with our site (e.g., Google Analytics). They provide statistical information so we can improve usability and content.</p>
              </li>
              <li>
                <strong>Functionality Cookies:</strong>
                <p className='mt-2'>These cookies remember your choices (such as language or region) and enhance your experience.</p>
              </li>
              <li>
                <strong>Advertising & Targeting Cookies:</strong>
                <p className='mt-2'>These cookies may be set by us or third parties to deliver relevant ads or measure campaign effectiveness. They may track your browsing activity across websites.</p>
              </li>
            </ul>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>4. Third-party cookies</h3>
            <p className='mb-4'>We may allow selected partners to place cookies on your device when you visit our site, for example:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Analytics providers (Google Analytics, etc.)</li>
              <li>Social media platforms (Facebook, Twitter, LinkedIn)</li>
              <li>Payment providers and security services</li>
            </ul>
            <p className='mb-8'>These third parties may use cookies in accordance with their own privacy policies. We do not control third-party cookies and encourage you to review their policies.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>5. Cookie management and preferences</h3>
            <p className='mb-4'>Upon your first visit to Futura Tickets, you will see a cookie banner or pop-up requesting your consent to use non-essential cookies. You can:</p>
            <ul className='list-disc pl-6 mb-8 space-y-2'>
              <li>Accept all cookies</li>
              <li>Reject all non-essential cookies</li>
              <li>Customize your cookie preferences at any time through our [Cookie Settings] panel</li>
            </ul>
            <p className='mb-8'>You can also manage cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that disabling cookies may affect the website's functionality and your user experience.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>6. How long are cookies stored?</h3>
            <p className='mb-4'>Some cookies are "session cookies," which are deleted when you close your browser. Others are "persistent cookies," which remain on your device until they expire or are deleted.</p>
            <p className='mb-8'>Details on the retention period for each cookie type can be found in our [Cookie Settings].</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>7. Updates to this Cookie Policy</h3>
            <p className='mb-8'>We may update this policy from time to time. Any significant changes will be communicated on our website or via email. Please review this policy periodically to stay informed.</p>

            <div className='border-b border-white/10 mb-8' />

            <h3 className='text-2xl font-bold mb-4'>8. Contact Us</h3>
            <p className='mb-4'>If you have any questions about our use of cookies or this policy, please contact:</p>
            <p className='mb-8'>
              <strong>privacy@futuratickets.com</strong><br /><br />
              Futura Tickets S.L., Madrid, Spain
            </p>

            <div className='border-b border-white/10 mb-8' />

            <p className='text-center mt-12 font-bold'>By continuing to use our site, you consent to the use of cookies as described above (subject to your preferences).</p>
          </div>
        </div>
      </div>
    </div>
  );
}