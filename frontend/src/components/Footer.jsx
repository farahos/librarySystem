// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useState } from "react";

const Footer = () => {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { to: "/Home", label: "Home" },
      { to: "/Books", label: "Books" },
      { to: "/Booked", label: "My Books" },
    ],
    support: [
      { to: "/help", label: "Help Center" },
      { to: "/contact", label: "Contact Us" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
    social: [
      { name: "Facebook", icon: "📘", url: "#" },
      { name: "Twitter", icon: "🐦", url: "#" },
      { name: "Instagram", icon: "📷", url: "#" },
      { name: "LinkedIn", icon: "💼", url: "#" },
    ],
  };

  const linkBaseClasses = "relative group transition-all duration-300 hover:text-yellow-300";
  const underlineClasses = "absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full";

  return (
    <footer className="bg-gradient-to-r from-indigo-300 to-gray-700 text-white shadow-2xl mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">📚</span>
              <h3 className="text-2xl font-extrabold tracking-wider">Book System</h3>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Discover your next favorite book in our extensive collection. 
              Read, explore, and embark on literary adventures with us.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-yellow-300 hover:scale-110 hover:shadow-lg transform hover:-translate-y-1"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6 pb-2 border-b-2 border-yellow-300 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`${linkBaseClasses} flex items-center space-x-2 py-1`}
                  >
                    <span className="text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300">▶</span>
                    <span>{link.label}</span>
                    <span className={underlineClasses}></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6 pb-2 border-b-2 border-yellow-300 inline-block">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`${linkBaseClasses} flex items-center space-x-2 py-1`}
                  >
                    <span className="text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300">▶</span>
                    <span>{link.label}</span>
                    <span className={underlineClasses}></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6 pb-2 border-b-2 border-yellow-300 inline-block">
              Stay Updated
            </h4>
            <p className="text-white/80 mb-4">
              Subscribe to our newsletter for the latest books and updates.
            </p>
            
            {isSubscribed ? (
              <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 text-center animate-pulse">
                <p className="text-green-300 font-semibold">🎉 Thank you for subscribing!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-300 placeholder-white/60"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-white/60">✉️</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-yellow-300 active:scale-95 active:bg-yellow-500 shadow-lg hover:shadow-yellow-400/25"
                >
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/70 text-sm">
              © {currentYear} Book System. All rights reserved.
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link
                to="/sitemap"
                className="text-white/70 hover:text-yellow-300 transition-colors duration-300"
              >
                Sitemap
              </Link>
              <Link
                to="/accessibility"
                className="text-white/70 hover:text-yellow-300 transition-colors duration-300"
              >
                Accessibility
              </Link>
              <Link
                to="/cookies"
                className="text-white/70 hover:text-yellow-300 transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>

            {/* User Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                user ? "bg-green-400" : "bg-yellow-400"
              }`}></div>
              <span className="text-white/70">
                {user ? `Welcome, ${user.name || 'User'}!` : "Not logged in"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-yellow-400 text-gray-900 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:bg-yellow-300 active:scale-95 z-40"
        aria-label="Back to top"
      >
        <span className="text-lg font-bold">↑</span>
      </button>
    </footer>
  );
};

export default Footer;