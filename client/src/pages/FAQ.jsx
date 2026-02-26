import React, { useState, useMemo } from 'react';
import { HiChevronDown, HiChevronUp, HiSearch, HiChat } from 'react-icons/hi';
import useChat from '../hooks/useChat';

const faqData = {
  Orders: [
    {
      q: 'How do I place an order?',
      a: 'Simply browse our collection, add items to your cart, and proceed to checkout. You\'ll need to create an account or log in to complete your purchase.',
    },
    {
      q: 'Can I modify or cancel my order after placing it?',
      a: 'You can modify or cancel your order within 2 hours of placing it. After that, the order goes into processing. Please contact our support team immediately via Live Chat.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order is shipped, you\'ll receive an SMS and email with your tracking number. You can also track your order from the "My Orders" section in your account.',
    },
    {
      q: 'What if I receive a wrong or damaged item?',
      a: 'We sincerely apologize for any inconvenience. Please contact us within 48 hours of delivery with photos of the issue, and we\'ll arrange a replacement or full refund immediately.',
    },
  ],
  Shipping: [
    {
      q: 'How long does delivery take?',
      a: 'Standard delivery takes 3-7 business days. Express delivery (1-2 days) is available in major cities. Delivery timelines may vary during peak seasons.',
    },
    {
      q: 'What are the shipping charges?',
      a: 'We offer FREE shipping on all orders above $50. For orders below $50, a flat shipping fee of $9.99 applies.',
    },
    {
      q: 'Do you ship outside Bangladesh?',
      a: 'Currently, we ship within Bangladesh only. We are working on expanding our delivery to India, Pakistan, and Nepal. Stay tuned!',
    },
    {
      q: 'What if my order is delayed?',
      a: 'Delays can occur due to weather or high demand. If your order is delayed beyond the estimated date, please contact us and we\'ll investigate immediately.',
    },
  ],
  Returns: [
    {
      q: 'What is your return policy?',
      a: 'We accept returns within 30 days of delivery. Items must be unused, unwashed, and in original packaging with all tags attached.',
    },
    {
      q: 'How do I initiate a return?',
      a: 'Go to "My Orders" in your account, find the relevant order, and click "Request Return." Our team will contact you within 24 hours to arrange pickup.',
    },
    {
      q: 'When will I receive my refund?',
      a: 'Once we receive and inspect the returned item, refunds are processed within 3-5 business days. For cash on delivery orders, refunds are made via bKash/Nagad.',
    },
    {
      q: 'Are there any items that cannot be returned?',
      a: 'For hygiene reasons, intimate wear, swimwear, and items marked as "Final Sale" cannot be returned or exchanged.',
    },
  ],
  Payment: [
    {
      q: 'What payment methods do you accept?',
      a: 'Currently we accept Cash on Delivery (COD). We are working on adding bKash, Nagad, Rocket, and card payment options very soon.',
    },
    {
      q: 'Is Cash on Delivery available everywhere?',
      a: 'Yes! Cash on Delivery is available across Bangladesh for all orders.',
    },
    {
      q: 'Is my payment information secure?',
      a: 'Absolutely. We use industry-standard SSL encryption for all transactions. Your payment information is never stored on our servers.',
    },
  ],
  Coupons: [
    {
      q: 'How do I get the 80% OFF coupon?',
      a: 'You can find active coupon codes on our website, social media pages, or by subscribing to our newsletter. Apply them at checkout to get discounts on your order!',
    },
    {
      q: 'How do I apply a coupon code?',
      a: 'Add items to your cart, go to the Cart page, and enter your coupon code in the "Coupon Code" field. Click "Apply" and the discount will be automatically calculated.',
    },
    {
      q: 'Can I use multiple coupons on one order?',
      a: 'Only one coupon can be applied per order. We recommend using the highest-value coupon available to you.',
    },
    {
      q: 'Why is my coupon not working?',
      a: 'Coupons may not work if they\'ve expired, have a minimum order requirement not met, or have already been used. Contact our Live Chat support for help.',
    },
  ],
};

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      open ? 'border-secondary/30 shadow-luxe' : 'border-gray-100 hover:border-gray-200'
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left bg-white"
      >
        <span className={`font-body font-semibold text-sm md:text-base transition-colors ${
          open ? 'text-secondary' : 'text-primary'
        }`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          open ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          {open
            ? <HiChevronUp className="w-4 h-4" />
            : <HiChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white animate-fade-in">
          <div className="border-t border-gray-100 pt-4">
            <p className="font-body text-gray-600 text-sm leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { openChat } = useChat();

  const categories = ['All', ...Object.keys(faqData)];

  const filtered = useMemo(() => {
    let result = activeCategory === 'All'
      ? Object.entries(faqData).flatMap(([cat, items]) => items.map(item => ({ ...item, cat })))
      : (faqData[activeCategory] || []).map(item => ({ ...item, cat: activeCategory }));

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary py-16 md:py-20 text-center text-white">
        <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3">Help Center</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="font-body text-white/60 max-w-xl mx-auto mb-8">
          Find answers to the most common questions about LUXE FASHION.
        </p>
        {/* Search */}
        <div className="max-w-md mx-auto px-4">
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your question..."
              className="w-full bg-white text-primary rounded-2xl pl-12 pr-4 py-4 font-body text-sm
                         focus:outline-none focus:ring-2 focus:ring-secondary shadow-luxe"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-luxe py-10 md:py-14">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-body font-semibold text-sm transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-luxe'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-secondary hover:text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {search && (
            <p className="font-body text-sm text-gray-500 mb-5 text-center">
              {filtered.length > 0
                ? `Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
                : `No results for "${search}"`}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-heading text-xl font-bold text-primary mb-2">No Results Found</h3>
              <p className="font-body text-gray-500 mb-6">
                Can't find what you're looking for? Chat with us directly!
              </p>
              <button onClick={openChat} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl
                                font-body font-semibold hover:bg-secondary transition-colors mx-auto">
                <HiChat className="w-4 h-4" />
                Start Live Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <div key={i}>
                  {activeCategory === 'All' && (i === 0 || filtered[i - 1].cat !== item.cat) && (
                    <h3 className="font-heading text-lg font-bold text-primary mt-8 mb-4 first:mt-0">
                      {item.cat}
                    </h3>
                  )}
                  <FAQItem question={item.q} answer={item.a} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-2xl mx-auto mt-16 bg-primary rounded-3xl p-8 text-center text-white">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-heading text-2xl font-bold mb-2">Still Have Questions?</h3>
          <p className="font-body text-white/70 mb-6 text-sm">
            Our friendly support team is available 7 days a week to help you with anything!
            Plus, ask about your exclusive <span className="text-secondary font-bold">80% OFF coupon!</span>
          </p>
          <button className="flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl
                            font-body font-bold hover:bg-secondary-600 transition-colors shadow-gold mx-auto">
            <HiChat className="w-5 h-5" />
            Chat With Us Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;