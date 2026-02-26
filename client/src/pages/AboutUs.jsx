import React from 'react';
import { Link } from 'react-router-dom';
import { HiChat, HiHeart, HiShieldCheck, HiSparkles, HiTruck } from 'react-icons/hi';
import useChat from '../hooks/useChat';

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Premium Products' },
  { value: '3+', label: 'Years of Excellence' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const team = [
  { name: 'Sarah Mitchell', role: 'Founder & CEO', emoji: '👩‍💼' },
  { name: 'Emily Carter', role: 'Head of Design', emoji: '👩‍🎨' },
  { name: 'Jessica Williams', role: 'Customer Experience', emoji: '👩‍💻' },
  { name: 'Olivia Thompson', role: 'Marketing Director', emoji: '👩‍🚀' },
];

const values = [
  {
    icon: HiHeart,
    title: 'Made with Love',
    desc: 'Every piece is carefully selected with passion and dedication to bring you the best in women\'s fashion.',
  },
  {
    icon: HiShieldCheck,
    title: 'Quality Guaranteed',
    desc: 'We source only premium quality fabrics and materials, ensuring every product meets our high standards.',
  },
  {
    icon: HiSparkles,
    title: 'Timeless Elegance',
    desc: 'Our designs blend modern trends with classic sophistication for a look that never goes out of style.',
  },
  {
    icon: HiTruck,
    title: 'Reliable Delivery',
    desc: 'Fast, safe, and trackable deliveries right to your doorstep with our trusted logistics partners.',
  },
];

const AboutUs = () => {
  const { openChat } = useChat();
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative bg-primary overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="container-luxe relative text-center text-white">
          <p className="font-body text-secondary text-sm uppercase tracking-widest mb-4 animate-fade-in-down">
            Our Story
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Fashion That Tells
            <span className="block text-secondary">Your Story</span>
          </h1>
          <p className="font-body text-white/70 max-w-2xl mx-auto text-base md:text-lg leading-relaxed animate-fade-in-up">
            LUXE FASHION was born from a simple belief — every woman deserves to feel beautiful,
            confident, and empowered through the clothes she wears. Since our founding, we have
            been dedicated to bringing premium women's fashion to your doorstep.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container-luxe">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
                <div className="font-body text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-left">
              <p className="font-body text-secondary text-sm uppercase tracking-widest">Who We Are</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary leading-snug">
                More Than Just Fashion —<br />
                <span className="text-secondary">A Lifestyle Choice</span>
              </h2>
              <p className="font-body text-gray-600 leading-relaxed">
                Founded with a passion for style and a commitment to quality, LUXE FASHION has grown
                from a small boutique dream into a thriving online destination for women who appreciate
                elegance and sophistication.
              </p>
              <p className="font-body text-gray-600 leading-relaxed">
                We carefully curate every product in our collection, from chic everyday wear to
                statement pieces for special occasions. Our team travels the world to discover the
                latest trends and bring them to you at prices that don't compromise your budget.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white rounded-xl
                           font-body font-semibold hover:bg-secondary transition-colors duration-300 shadow-luxe"
              >
                Explore Our Collection
              </Link>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="aspect-[4/5] bg-gradient-to-br from-accent to-secondary/20 rounded-3xl overflow-hidden shadow-luxe-xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/60 space-y-3 p-8">
                    <div className="text-8xl">👗</div>
                    <p className="font-heading text-2xl font-bold text-primary/40">LUXE FASHION</p>
                    <p className="font-body text-sm text-primary/30">Premium Women's Collection</p>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-luxe-lg p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray-400">Premium Quality</p>
                    <p className="font-heading font-bold text-primary">Since 2021</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3">Our Purpose</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">Mission & Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-luxe border border-secondary/10">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-3xl mb-5">
                🎯
              </div>
              <h3 className="font-heading text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="font-body text-gray-600 leading-relaxed">
                To make premium fashion accessible to every woman, offering a curated selection of
                high-quality clothing and accessories that celebrate femininity, diversity, and
                individual expression. We believe fashion is a powerful form of self-expression,
                and we are here to help you tell your unique story.
              </p>
            </div>
            <div className="bg-primary rounded-3xl p-8 shadow-luxe-lg">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center text-3xl mb-5">
                🌟
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="font-body text-white/70 leading-relaxed">
                To become the most loved and trusted women's fashion destination in South Asia,
                known for our exceptional quality, outstanding customer service, and commitment
                to sustainable and ethical fashion practices. We envision a world where every
                woman can access the finest fashion without compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3">What Drives Us</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl bg-white shadow-luxe hover:shadow-luxe-lg
                           transition-all duration-300 hover:-translate-y-1 group border border-gray-100"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4
                               group-hover:bg-secondary/20 transition-colors">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-primary mb-2">{title}</h3>
                <p className="font-body text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-20 bg-accent/20">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3">The People Behind</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">Meet Our Team</h2>
            <p className="font-body text-gray-500 mt-3 max-w-xl mx-auto">
              Passionate individuals dedicated to bringing you the best fashion experience.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(({ name, role, emoji }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-6 text-center shadow-luxe hover:shadow-luxe-md
                           transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-accent rounded-full
                               flex items-center justify-center text-4xl mx-auto mb-4 shadow-gold">
                  {emoji}
                </div>
                <h3 className="font-heading font-bold text-primary text-base">{name}</h3>
                <p className="font-body text-secondary text-xs mt-1 font-medium">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-white text-center">
        <div className="container-luxe max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience LUXE?
          </h2>
          <p className="font-body text-white/70 mb-8 leading-relaxed">
            Join thousands of women who trust LUXE FASHION for their style needs.
            Chat with us and get an exclusive 80% OFF on your first order!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="px-8 py-4 bg-secondary text-white rounded-xl font-body font-bold
                         hover:bg-secondary-600 transition-colors shadow-gold"
            >
              Shop Now
            </Link>
            <button
              onClick={openChat}
              className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-body font-bold
                         hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <HiChat className="w-5 h-5" /> Chat With Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;