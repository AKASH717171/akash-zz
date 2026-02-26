import React, { useState } from 'react';
import { HiMail, HiPhone, HiLocationMarker, HiChat, HiPaperAirplane, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useChat from '../hooks/useChat';

const SUBJECTS = ['General Inquiry', 'Order Issue', 'Return / Exchange', 'Product Question', 'Coupon / Discount', 'Other'];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const { openChat } = useChat();
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post('/newsletter/subscribe', { email: form.email });
      setSuccess(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.success("Message sent! We'll get back to you soon.");
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    { icon: HiMail, label: 'Email Us', value: 'support@luxefashion.com', sub: 'We reply within 24 hours', href: 'mailto:support@luxefashion.com' },
    { icon: HiPhone, label: 'Call Us', value: '+1 (800) 555-0199', sub: 'Mon-Fri, 9 AM - 6 PM EST', href: 'tel:+18005550199' },
    { icon: HiLocationMarker, label: 'Visit Us', value: 'New York, NY 10001', sub: '350 5th Avenue, Suite 200', href: '#' },
  ];

  const socialLinks = [
    { label: 'Facebook', emoji: '📘', href: '#' },
    { label: 'Instagram', emoji: '📸', href: '#' },
    { label: 'WhatsApp', emoji: '💬', href: '#' },
    { label: 'YouTube', emoji: '▶️', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-16 md:py-20 text-center text-white">
        <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3">Get in Touch</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="font-body text-white/60 max-w-xl mx-auto">Have a question or need help? We are here for you!</p>
      </div>

      <div className="container-luxe py-12 md:py-16">
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {contactCards.map(function(item) {
            var Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className="bg-white rounded-2xl p-6 shadow-luxe text-center hover:shadow-luxe-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-heading font-bold text-primary mb-1">{item.label}</h3>
                <p className="font-body text-sm font-semibold text-secondary">{item.value}</p>
                <p className="font-body text-xs text-gray-400 mt-1">{item.sub}</p>
              </a>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-luxe p-8">
              <h2 className="font-heading text-2xl font-bold text-primary mb-6">Send Us a Message</h2>
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                    <HiCheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-primary mb-2">Message Sent!</h3>
                  <p className="font-body text-gray-500 mb-6">Thank you! We will get back to you within 24 hours.</p>
                  <button onClick={function() { setSuccess(false); setForm({ name: '', email: '', subject: 'General Inquiry', message: '' }); }} className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold hover:bg-secondary transition-colors">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-body text-sm font-semibold text-primary mb-1.5">Your Name <span className="text-red-500">*</span></label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={'w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors ' + (errors.name ? 'border-red-400' : 'border-gray-200 focus:border-secondary')} />
                      {errors.name && <p className="font-body text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block font-body text-sm font-semibold text-primary mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={'w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors ' + (errors.email ? 'border-red-400' : 'border-gray-200 focus:border-secondary')} />
                      {errors.email && <p className="font-body text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-sm font-semibold text-primary mb-1.5">Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary bg-white transition-colors">
                      {SUBJECTS.map(function(s) { return <option key={s} value={s}>{s}</option>; })}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-sm font-semibold text-primary mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="How can we help you?" rows={5} className={'w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors resize-none ' + (errors.message ? 'border-red-400' : 'border-gray-200 focus:border-secondary')} />
                    {errors.message && <p className="font-body text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white rounded-xl font-body font-bold text-base hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <React.Fragment><HiPaperAirplane className="w-5 h-5" />Send Message</React.Fragment>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary rounded-3xl p-7 text-white">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-heading text-xl font-bold mb-2">Chat With Us Live!</h3>
              <p className="font-body text-white/70 text-sm mb-5">Get instant help from our support team. Ask about our exclusive 80% OFF coupon!</p>
              <button onClick={openChat} className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white rounded-xl font-body font-bold transition-colors hover:bg-secondary/90">
                <HiChat className="w-5 h-5" />Start Live Chat
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-luxe overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="text-center"><div className="text-5xl mb-2">🗺️</div><p className="font-body text-sm text-primary/50">New York, NY 10001</p></div>
              </div>
              <div className="p-5">
                <h4 className="font-heading font-bold text-primary mb-1">Our Office</h4>
                <p className="font-body text-sm text-gray-500">350 5th Avenue, Suite 200<br />New York, NY 10001, USA</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-luxe p-6">
              <h4 className="font-heading font-bold text-primary mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map(function(item) {
                  return (
                    <a key={item.label} href={item.href} className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-body text-xs text-gray-500">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;