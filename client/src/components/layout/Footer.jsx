import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaPinterestP } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubLoading(true);
      const { data } = await api.post('/newsletter/subscribe', { email: email.trim() });
      if (data.success) {
        toast.success(data.message);
        setEmail('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to subscribe');
    } finally {
      setSubLoading(false);
    }
  };

  const year = new Date().getFullYear();

  const shopLinks = [
    { name: 'New Arrivals', path: '/shop?sort=newest' },
    { name: 'Best Sellers', path: '/shop?sort=popular' },
    { name: 'Women Fashion', path: '/shop?category=women-fashion' },
    { name: 'Bags', path: '/shop?category=bags' },
    { name: 'Shoes', path: '/shop?category=shoes' },
    { name: 'Sale', path: '/shop?sale=true' },
  ];

  const helpLinks = [
    { name: 'My Account', path: '/account' },
    { name: 'Track Order', path: '/account/orders' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Return Policy', path: '/return-policy' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms' },
  ];

  const socials = [
    { icon: FaFacebookF, href: '#' },
    { icon: FaInstagram, href: '#' },
    { icon: FaTwitter, href: '#' },
    { icon: FaYoutube, href: '#' },
    { icon: FaPinterestP, href: '#' },
  ];

  return (
    <footer className="bg-primary text-white pb-mobile-nav">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-luxe py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
              Join the LUXE Club
            </h3>
            <p className="text-gray-400 text-sm font-body mb-6">
              Subscribe for exclusive offers, early access & style tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                           placeholder-gray-400 text-sm font-body focus:outline-none focus:border-secondary
                           focus:ring-1 focus:ring-secondary/30"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="btn-secondary py-3 px-6 rounded-lg text-sm whitespace-nowrap disabled:opacity-50"
              >
                {subLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-luxe py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/">
              <h2 className="font-heading text-2xl font-bold text-white mb-1">
                LUXE <span className="text-secondary">FASHION</span>
              </h2>
            </Link>
            <p className="text-xs text-secondary font-body tracking-widest uppercase mb-4">Elegance Redefined</p>
            <p className="text-gray-400 text-sm font-body leading-relaxed mb-6">
              Premium women's fashion destination. Curated clothing, handcrafted bags, and designer shoes.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                   className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center
                              hover:bg-secondary hover:border-secondary transition-all duration-300">
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.name}>
                  <Link to={l.path} className="text-gray-400 text-sm font-body hover:text-secondary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2.5">
              {helpLinks.map((l) => (
                <li key={l.name}>
                  <Link to={l.path} className="text-gray-400 text-sm font-body hover:text-secondary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.name}>
                  <Link to={l.path} className="text-gray-400 text-sm font-body hover:text-secondary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <a href="tel:+8801234567890" className="flex items-center gap-2 text-gray-400 text-sm hover:text-secondary transition-colors">
                <HiOutlinePhone className="w-4 h-4 text-secondary" /> +1 (800) 555-0199
              </a>
              <a href="mailto:support@luxefashion.com" className="flex items-center gap-2 text-gray-400 text-sm hover:text-secondary transition-colors">
                <HiOutlineMail className="w-4 h-4 text-secondary" /> support@luxefashion.com
              </a>
              <p className="flex items-start gap-2 text-gray-400 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" /> New York, NY 10001, USA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-luxe py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs font-body">
            © {year} LUXE FASHION. All rights reserved.
          </p>
          <div className="flex items-center gap-3 opacity-60">
            {['visa', 'mastercard', 'amex'].map((c) => (
              <div key={c} className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                <span className="text-[8px] uppercase font-bold text-white/60">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;