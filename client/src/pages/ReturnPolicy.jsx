import React from 'react';
import { Link } from 'react-router-dom';
import { HiChat } from 'react-icons/hi';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="font-body text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-14 text-center text-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Return & Refund Policy</h1>
        <p className="font-body text-white/60 text-sm">Last updated: January 1, 2025</p>
      </div>
      <div className="container-luxe max-w-4xl py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-luxe p-8 md:p-12">

          {/* Quick Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { emoji: '📅', title: '30-Day Returns', desc: 'Return within 30 days of delivery' },
              { emoji: '💰', title: 'Full Refund', desc: 'Get a complete refund on eligible items' },
              { emoji: '🚚', title: 'Free Return Pickup', desc: 'We\'ll arrange pickup at no cost' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="text-center bg-accent/20 rounded-2xl p-5">
                <div className="text-3xl mb-2">{emoji}</div>
                <h3 className="font-body font-bold text-primary text-sm mb-1">{title}</h3>
                <p className="font-body text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          <Section title="1. Return Eligibility">
            <p>We accept returns within <strong className="text-primary">7 days</strong> of delivery for items that meet the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Item is unused, unwashed, and in original condition</li>
              <li>All original tags are still attached</li>
              <li>Item is in original packaging</li>
              <li>You have the original receipt or order confirmation</li>
            </ul>
          </Section>

          <Section title="2. Non-Returnable Items">
            <p>The following items cannot be returned for hygiene and safety reasons:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Intimate wear and undergarments</li>
              <li>Swimwear</li>
              <li>Earrings and pierced jewelry</li>
              <li>Items marked as "Final Sale" or "Non-Returnable"</li>
              <li>Items damaged due to customer misuse</li>
              <li>Items returned after 30 days</li>
            </ul>
          </Section>

          <Section title="3. How to Initiate a Return">
            <p>To start a return:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to your account and go to "My Orders"</li>
              <li>Find the order and click "Request Return"</li>
              <li>Select the item(s) and reason for return</li>
              <li>Our team will contact you within 24 hours to arrange pickup</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Hand it to our delivery partner when they arrive</li>
            </ol>
          </Section>

          <Section title="4. Refund Process">
            <p>Once we receive and inspect your return (1-2 business days), we will process your refund:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-primary">bKash/Nagad:</strong> Refund within 2-3 business days</li>
              <li><strong className="text-primary">Bank Transfer:</strong> Refund within 5-7 business days</li>
              <li><strong className="text-primary">Store Credit:</strong> Applied immediately to your account</li>
            </ul>
            <p>For Cash on Delivery orders, refunds are processed via bKash, Nagad, or Rocket as preferred.</p>
          </Section>

          <Section title="5. Damaged or Wrong Items">
            <p>If you receive a damaged, defective, or incorrect item, please contact us within <strong className="text-primary">48 hours</strong> of delivery with photos of the issue. We will arrange an immediate replacement or full refund at no additional cost to you.</p>
          </Section>

          <Section title="6. Exchange Policy">
            <p>We currently do not offer direct exchanges. To exchange an item, please return the original item and place a new order for the desired item. This ensures you get your preferred product as quickly as possible.</p>
          </Section>

          {/* CTA */}
          <div className="bg-primary rounded-2xl p-6 text-center text-white mt-8">
            <h3 className="font-heading text-xl font-bold mb-2">Need Help With a Return?</h3>
            <p className="font-body text-white/70 text-sm mb-4">Our team is here to make the process as easy as possible.</p>
            <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl
                              font-body font-semibold hover:bg-secondary-600 transition-colors mx-auto shadow-gold">
              <HiChat className="w-4 h-4" />
              Chat With Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;