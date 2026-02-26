import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="font-body text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-14 text-center text-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="font-body text-white/60 text-sm">Last updated: January 1, 2025</p>
      </div>
      <div className="container-luxe max-w-4xl py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-luxe p-8 md:p-12">
          <p className="font-body text-gray-600 text-sm leading-relaxed mb-8">
            Please read these Terms and Conditions carefully before using the LUXE FASHION website.
            By accessing or using our service, you agree to be bound by these terms.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>By accessing and using LUXE FASHION's website and services, you accept and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
          </Section>

          <Section title="2. Account Registration">
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </Section>

          <Section title="3. Products and Pricing">
            <p>We reserve the right to modify product descriptions, prices, and availability at any time without notice. All prices are in US Dollars (USD) and include applicable taxes unless otherwise stated.</p>
            <p>We make every effort to display product colors accurately, but actual colors may vary due to monitor settings. We do not guarantee that product descriptions are error-free.</p>
          </Section>

          <Section title="4. Order Processing">
            <p>Placing an order does not constitute a binding contract until we accept it. We reserve the right to refuse or cancel any order for reasons including product unavailability, pricing errors, or suspected fraud.</p>
            <p>You will receive an email confirmation once your order is accepted and again when it is shipped.</p>
          </Section>

          <Section title="5. Payment Terms">
            <p>Currently, we accept Cash on Delivery (COD) payments. Payment is due upon delivery of your order. Failed payment attempts may result in order cancellation. We are not responsible for any bank charges or currency conversion fees.</p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of LUXE FASHION and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </Section>

          <Section title="7. Prohibited Activities">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Transmit harmful, offensive, or disruptive content</li>
              <li>Use automated tools to scrape or collect data</li>
              <li>Impersonate LUXE FASHION or its employees</li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>LUXE FASHION shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid for the specific order in question.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of New York, United States.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions regarding these Terms, contact us at legal@luxefashion.com or through our Live Chat support.</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;