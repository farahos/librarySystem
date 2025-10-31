// src/components/Contact.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      details: "support@booksystem.com",
      description: "Send us an email anytime"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon to Fri, 9am to 6pm"
    },
    {
      icon: "💬",
      title: "Live Chat",
      details: "Start Chat",
      description: "Instant support 24/7"
    },
    {
      icon: "📍",
      title: "Visit Us",
      details: "123 Book Street, Library City",
      description: "Feel free to visit our office"
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password from the login page by clicking 'Forgot Password'."
    },
    {
      question: "Can I download books for offline reading?",
      answer: "Yes, most books are available for download. Look for the download icon on the book page."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Our mobile app is available on both iOS and Android platforms."
    },
    {
      question: "How can I become an author on your platform?",
      answer: "Visit our 'Become an Author' page to submit your work for review."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-gray-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
              
              <div className="space-y-6 mb-8">
                {contactMethods.map((method, index) => (
                  <div 
                    key={method.title}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-300 to-gray-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{method.title}</h3>
                      <p className="text-indigo-600 font-medium">{method.details}</p>
                      <p className="text-gray-500 text-sm">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {["📘", "🐦", "📷", "💼"].map((icon, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-indigo-100 hover:scale-110 transition-all duration-300"
                    >
                      <span className="text-lg">{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & FAQ */}
          <div className="lg:col-span-2">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you soon.</p>

              {isSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-pulse">
                  <div className="flex items-center space-x-2 text-green-700">
                    <span className="text-lg">✅</span>
                    <span className="font-semibold">Message sent successfully! We'll get back to you soon.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-indigo-500 to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600 mb-8">Quick answers to common questions</p>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">Still have questions?</p>
                <Link
                  to="/help"
                  className="inline-flex items-center space-x-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-300"
                >
                  <span>Visit Help Center</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;