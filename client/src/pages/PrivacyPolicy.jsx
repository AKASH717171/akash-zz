import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="font-body text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-14 text-center text-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="font-body text-white/60 text-sm">Last updated: January 1, 2025</p>
      </div>
      <div className="container-luxe max-w-4xl py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-luxe p-8 md:p-12">
          <p className="font-body text-gray-600 text-sm leading-relaxed mb-8">
            LUXE FASHION ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website and make purchases.
          </p>

          <Section title="1. Information We Collect">
            <p><strong className="text-primary">Personal Information:</strong> When you create an account or place an order, we collect your name, email address, phone number, shipping address, and payment information.</p>
            <p><strong className="text-primary">Usage Data:</strong> We automatically collect information about how you interact with our website, including pages visited, time spent, and referring URLs.</p>
            <p><strong className="text-primary">Device Information:</strong> We collect device type, browser type, operating system, and IP address for security and analytics purposes.</p>
            <p><strong className="text-primary">Communications:</strong> When you contact us via live chat, email, or contact form, we collect the content of your communications.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send promotional emails (you can opt out at any time)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Information Sharing">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-primary">Delivery Partners:</strong> To fulfill your orders</li>
              <li><strong className="text-primary">Payment Processors:</strong> To process payments securely</li>
              <li><strong className="text-primary">Analytics Providers:</strong> To improve our services</li>
              <li><strong className="text-primary">Legal Authorities:</strong> When required by law</li>
            </ul>
          </Section>

          <Section title="4. Data Security">
            <p>We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser. Disabling cookies may affect some website functionality.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </Section>

          <Section title="7. Children's Privacy">
            <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </Section>

          <Section title="9. Contact Us">
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <div className="bg-accent/30 rounded-xl p-4 mt-2">
              <p><strong className="text-primary">Email:</strong> privacy@luxefashion.com</p>
              <p><strong className="text-primary">Address:</strong> 123 Fashion Avenue, Suite 100, New York, NY 10001, USA</p>
              <p><strong className="text-primary">Phone:</strong> +880 1700-000000</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;