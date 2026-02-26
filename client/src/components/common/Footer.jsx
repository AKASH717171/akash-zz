import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaPinterestP } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-2">
              LUXE <span className="text-secondary">FASHION</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your premier destination for women's fashion. We curate the finest clothing, bags, and shoes to help you express your unique style.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: FaFacebookF, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaYoutube, href: '#' },
                { icon: FaPinterestP, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-300"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Shop All', path: '/shop' },
                { name: 'New Arrivals', path: '/shop?sort=newest' },
                { name: 'Best Sellers', path: '/shop?sort=popular' },
                { name: 'Sale', path: '/shop?sale=true' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-secondary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-5">Customer Service</h3>
            <ul className="space-y-3">
              {[
                { name: 'My Account', path: '/account' },
                { name: 'Track Order', path: '/account/orders' },
                { name: 'Shipping Policy', path: '/shipping-policy' },
                { name: 'Returns & Exchanges', path: '/returns' },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms & Conditions', path: '/terms' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-secondary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-5">Contact Us</h3>
            <div className="space-y-4">
              <a
                href="tel:+8801234567890"
                className="flex items-start gap-3 text-gray-400 text-sm hover:text-secondary transition-colors"
              >
                <HiOutlinePhone className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                <span>+880 1234-567890</span>
              </a>
              <a
                href="mailto:contact@luxefashion.com"
                className="flex items-start gap-3 text-gray-400 text-sm hover:text-secondary transition-colors"
              >
                <HiOutlineMail className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                <span>contact@luxefashion.com</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <HiOutlineLocationMarker className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                <span>123 Fashion Street, Gulshan,<br />Dhaka 1212, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs text-center md:text-left">
              © {currentYear} LUXE FASHION. All rights reserved. Designed with ♥
            </p>
            <div className="flex items-center gap-4">
              <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
              <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
              <img src="https://img.icons8.com/color/48/bkash.png" alt="bKash" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;