import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="font-body text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-14 text-center text-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Shipping Policy</h1>
        <p className="font-body text-white/60 text-sm">Last updated: January 1, 2025</p>
      </div>
      <div className="container-luxe max-w-4xl py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-luxe p-8 md:p-12">

          {/* Shipping Options Table */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm font-body border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  {['Shipping Method', 'Delivery Time', 'Cost', 'Available Locations'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Standard Delivery', '3-7 Business Days', 'FREE on orders over $50', 'USA Nationwide'],
                  ['Express Delivery', '1-2 Business Days', '$19.99 flat', 'Major US Cities'],
                  ['Same Day Delivery', 'Same Day (order by 12 PM)', '$24.99 flat', 'Select Metro Areas'],
                ].map(([method, time, cost, loc], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-semibold text-primary">{method}</td>
                    <td className="px-4 py-3 text-gray-600">{time}</td>
                    <td className="px-4 py-3 text-secondary font-semibold">{cost}</td>
                    <td className="px-4 py-3 text-gray-600">{loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Section title="1. Processing Time">
            <p>All orders are processed within <strong className="text-primary">1-2 business days</strong> (Monday-Friday, excluding public holidays). Orders placed on weekends or holidays will be processed the next business day.</p>
            <p>You will receive an order confirmation email immediately after placing your order, and a shipping confirmation email with tracking information once your order has been dispatched.</p>
          </Section>

          <Section title="2. Free Shipping">
            <p>We offer <strong className="text-primary">FREE Standard Delivery</strong> on all orders above $50. The free shipping threshold is calculated after applying any coupons or discounts.</p>
            <p>For orders below $50, a flat shipping fee of <strong className="text-primary">$9.99</strong> applies.</p>
          </Section>

          <Section title="3. Delivery Areas">
            <p>We currently deliver to all 50 states across the United States. Delivery timelines may vary by location:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-primary">Same-Day Metro Areas (NYC, LA, Chicago):</strong> 1-3 business days</li>
              <li><strong className="text-primary">Major Cities (Chittagong, Sylhet, Rajshahi):</strong> 2-4 business days</li>
              <li><strong className="text-primary">Other Districts:</strong> 3-7 business days</li>
              <li><strong className="text-primary">Remote Areas:</strong> 5-10 business days</li>
            </ul>
          </Section>

          <Section title="4. Order Tracking">
            <p>Once your order is shipped, you will receive:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>An SMS with your tracking number</li>
              <li>An email with a tracking link</li>
              <li>Updates in your account under "My Orders"</li>
            </ul>
            <p>You can track your order at any time through our website or by contacting our support team.</p>
          </Section>

          <Section title="5. Failed Delivery Attempts">
            <p>If you are unavailable during delivery, our courier will attempt delivery up to 3 times. After 3 failed attempts, the order will be returned to our warehouse and you will be contacted to reschedule.</p>
            <p>Please ensure your contact number and delivery address are correct at the time of ordering.</p>
          </Section>

          <Section title="6. Damaged in Transit">
            <p>If your order arrives damaged, please:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Take photos/video of the damaged package before opening</li>
              <li>Document the damage to the item</li>
              <li>Contact us within 48 hours via Live Chat or email</li>
              <li>We will arrange a replacement or refund promptly</li>
            </ol>
          </Section>

          <Section title="7. International Shipping">
            <p>We currently ship within the United States only. We are actively working on expanding international shipping. Please subscribe to our newsletter for updates.</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;