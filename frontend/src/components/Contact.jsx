import React, { useState } from "react";
import { BookOpen, Building2, Mail, MessageSquare, Send, ShieldQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const contactMethods = [
  {
    title: "Support",
    detail: "support@madal.so",
    text: "Questions about accounts, reading, publishing, or reports.",
    icon: Mail,
  },
  {
    title: "Writers",
    detail: "writers@madal.so",
    text: "Verification, originals, publishing help, and creator partnerships.",
    icon: BookOpen,
  },
  {
    title: "Moderation",
    detail: "safety@madal.so",
    text: "Report urgent safety, copyright, or community guideline issues.",
    icon: ShieldQuestion,
  },
  {
    title: "Partnerships",
    detail: "partners@madal.so",
    text: "Sponsorships, institutions, publishers, and cultural projects.",
    icon: Building2,
  },
];

const faqs = [
  {
    question: "Can I publish Somali stories on Madal?",
    answer: "Yes. Create an account as a writer, open Write, and publish your story with a first chapter.",
  },
  {
    question: "Does Madal support audio chapters?",
    answer: "Yes. The platform already supports audio URLs per chapter, with file upload planned for production.",
  },
  {
    question: "How do verified writers work?",
    answer: "Writers can request verification. Admins review quality, consistency, and moderation history before approval.",
  },
  {
    question: "How do I report content?",
    answer: "The backend includes report and moderation tools. Dedicated frontend report buttons can be added to story and comment views next.",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1800&q=80"
          alt="Newspaper and notebook on a desk"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-4 pb-14 pt-20">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">Contact Madal</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
            Let us help your story find its place.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-100">
            Reach out for support, writer help, moderation questions, or partnerships around Somali storytelling.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          {contactMethods.map((method) => (
            <div key={method.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <method.icon size={20} />
                </span>
                <div>
                  <h2 className="font-black text-gray-950">{method.title}</h2>
                  <p className="mt-1 font-bold text-orange-700">{method.detail}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{method.text}</p>
                </div>
              </div>
            </div>
          ))}
        </aside>

        <div className="space-y-8">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <MessageSquare size={22} />
              </span>
              <div>
                <h2 className="text-2xl font-black text-gray-950">Send a Message</h2>
                <p className="text-gray-600">This form is ready for a future backend contact endpoint.</p>
              </div>
            </div>

            {isSubmitted && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
                Message received locally. Contact API can be connected next.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" name="name" value={formData.name} onChange={handleChange} />
                <Field label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <Field label="Subject" name="subject" value={formData.subject} onChange={handleChange} />
              <label className="block text-sm font-bold text-gray-700">
                Message
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={7}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Tell us how we can help..."
                />
              </label>
              <button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-950">Common Questions</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg bg-gray-50 p-4">
                  <h3 className="font-black text-gray-950">{faq.question}</h3>
                  <p className="mt-2 leading-7 text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-100 pt-5">
              <Link to="/Books" className="font-black text-orange-700 hover:text-orange-800">
                Explore stories while we respond
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

export default Contact;
