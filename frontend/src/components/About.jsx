// src/components/About.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
  const [activeTab, setActiveTab] = useState("mission");

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "👩‍💼",
      bio: "Passionate about making literature accessible to everyone."
    },
    {
      name: "Mike Chen",
      role: "Lead Developer",
      image: "👨‍💻",
      bio: "Loves building seamless reading experiences."
    },
    {
      name: "Emma Davis",
      role: "Content Curator",
      image: "👩‍🎨",
      bio: "Book enthusiast with a keen eye for great stories."
    },
    {
      name: "Alex Rodriguez",
      role: "Community Manager",
      image: "👨‍🤝‍👨",
      bio: "Connecting readers and building our book community."
    }
  ];

  const stats = [
    { number: "10K+", label: "Books Available" },
    { number: "50K+", label: "Happy Readers" },
    { number: "100+", label: "Authors" },
    { number: "24/7", label: "Support" }
  ];

  const tabs = [
    { id: "mission", label: "Our Mission" },
    { id: "vision", label: "Our Vision" },
    { id: "values", label: "Our Values" }
  ];

  const tabContent = {
    mission: {
      title: "Our Mission",
      content: "To democratize access to literature and create a vibrant community of readers and writers. We believe everyone deserves access to great books, regardless of their location or background.",
      features: ["Free access to thousands of books", "Community-driven recommendations", "Support for emerging authors"]
    },
    vision: {
      title: "Our Vision",
      content: "A world where reading is accessible to all, where stories connect people across cultures, and where every voice can find its audience.",
      features: ["Global literary community", "AI-powered personalized reading", "Multi-language support"]
    },
    values: {
      title: "Our Values",
      content: "We operate on principles of accessibility, quality, and community. Every decision we make is guided by our commitment to these core values.",
      features: ["Quality over quantity", "User-first approach", "Continuous innovation"]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-gray-600">Book System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing the way people discover, read, and share books. 
            Join our community of passionate readers and explore endless literary possibilities.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-gray-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-16">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-lg font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                      : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {tabContent[activeTab].title}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {tabContent[activeTab].content}
              </p>
              <ul className="space-y-4">
                {tabContent[activeTab].features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to creating the best reading experience for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.name}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                <div className="w-20 h-20 mx-auto mb-4 text-4xl bg-gradient-to-r from-indigo-300 to-gray-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-indigo-600 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-400 to-gray-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of readers discovering new stories every day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/Books"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Explore Books
            </Link>
            <Link
              to="/Register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;