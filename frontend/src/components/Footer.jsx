import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Send, Twitter, Youtube } from "lucide-react";
import { madalLogo } from "../lib/apiClient";

const storyLinks = [
  ["Trending Stories", "/Books?sort=trending"],
  ["Recently Updated", "/Books?sort=recently-updated"],
  ["Madal Originals", "/Books?sort=featured"],
  ["Popular This Week", "/Books?sort=weekly"],
  ["New Stories", "/Books?sort=new"],
];

const genreLinks = [
  ["Romance", "/Books?category=romance"],
  ["Drama", "/Books?category=drama"],
  ["Mystery", "/Books?category=mystery"],
  ["Poetry", "/Books?category=poetry"],
  ["Islamic", "/Books?category=islamic"],
];

const readerLinks = [
  ["Library", "/library"],
  ["Bookmarks", "/library/bookmarks"],
  ["Reading History", "/library/history"],
  ["Reading Lists", "/library/lists"],
  ["Browse Stories", "/Books"],
];

const communityLinks = [
  ["About Madal", "/About"],
  ["Contact", "/Contact"],
  ["Start Writing", "/create"],
  ["Writer Dashboard", "/writer-dashboard"],
  ["Profile", "/profile"],
];

const socials = [
  ["Instagram", Instagram],
  ["TikTok", Send],
  ["Facebook", Facebook],
  ["YouTube", Youtube],
  ["Community", MessageCircle],
  ["X", Twitter],
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-950">
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-black">Join Madal on socials</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Follow Somali stories, new chapters, writer updates, and reader conversations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socials.map((social) => {
              const label = social[0];
              const SocialIcon = social[1];
              return (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-gray-900 ring-1 ring-gray-200 transition hover:bg-orange-50 hover:text-orange-700 hover:ring-orange-200"
              >
                <SocialIcon size={20} />
              </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-orange-600 px-4 py-14 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2 className="text-3xl font-black">Write your own Somali story</h2>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-orange-50">
            Your next chapter could be the one readers remember. Start publishing on Madal today.
          </p>
          <Link to="/create" className="mt-6 rounded-lg bg-white px-5 py-3 text-sm font-black text-orange-700 hover:bg-orange-50">
            Start Writing
          </Link>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-gray-50 px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Madal Stories" links={storyLinks} />
          <FooterColumn title="Genres" links={genreLinks} />
          <FooterColumn title="For Readers" links={readerLinks} />
          <FooterColumn title="Community" links={communityLinks} />
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link to="/Home" className="inline-flex items-center gap-3">
              <img src={madalLogo} alt="Madal" className="h-12 w-12 rounded-lg object-cover" />
              <span className="text-2xl font-black">Madal</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-gray-600">
              Madal is a home for Somali stories, readers, and writers. Discover chapters, follow authors, and find the story that stays with you.
            </p>
          </div>

          <FooterColumn title="Madal" links={[["Home", "/Home"], ["Stories", "/Books"], ["Library", "/library"], ["About", "/About"]]} />
          <FooterColumn title="Writers" links={[["Create Story", "/create"], ["Dashboard", "/writer-dashboard"], ["My Profile", "/profile"], ["Settings", "/settings"]]} />
          <FooterColumn title="Support" links={[["Contact", "/Contact"], ["Terms", "/terms"], ["Privacy", "/privacy"], ["Help", "/help"]]} />
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-gray-200 pt-5 text-xs font-semibold text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Madal. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-orange-700">Terms</Link>
            <Link to="/privacy" className="hover:text-orange-700">Privacy Policy</Link>
            <Link to="/Contact" className="hover:text-orange-700">Contact</Link>
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-950">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map(([label, to]) => (
          <li key={`${title}-${label}`}>
            <Link to={to} className="text-sm font-semibold text-gray-600 hover:text-orange-700">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
