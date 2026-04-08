import React from "react";
import { Link } from "react-router-dom";
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import { GiSpoon } from "react-icons/gi";

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <GiSpoon className="text-gold text-2xl" />
              <div>
                <span className="font-display text-xl font-semibold text-cream">
                  Spice & Soul
                </span>
                <div className="text-gold text-[9px] tracking-[0.3em] uppercase font-body -mt-1">
                  Fine Indian Cuisine
                </div>
              </div>
            </div>
            <p className="text-cream/50 text-sm font-body leading-relaxed mb-6">
              Authentic flavours crafted with passion. Experience the warmth of
              Indian hospitality with every bite.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FiInstagram, href: "#" },
                { icon: FiFacebook, href: "#" },
                { icon: FiTwitter, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-9 h-9 border border-dark-border rounded-full flex items-center justify-center text-cream/50 hover:text-gold hover:border-gold transition-all duration-200"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-semibold text-cream mb-5 text-sm tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                ["Menu", "/menu"],
                ["Reservations", "/reserve"],
                ["Offers", "/offers"],
                ["Gallery", "/gallery"],
                ["About Us", "/about"],
                ["Contact", "/contact"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-cream/50 hover:text-gold text-sm font-body transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-body font-semibold text-cream mb-5 text-sm tracking-wide">
              Opening Hours
            </h4>
            <div className="space-y-2 text-sm font-body">
              {[
                ["Mon – Thu", "12:00 – 23:00"],
                ["Fri – Sat", "12:00 – 23:30"],
                ["Sunday", "11:00 – 23:00"],
              ].map(([day, time]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-cream/50">{day}</span>
                  <span className="text-gold font-medium">{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-semibold text-cream mb-5 text-sm tracking-wide">
              Contact Us
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: FiMapPin,
                  text: "12, Sakchi Main Road,\nJamshedpur, JH 831001",
                },
                { icon: FiPhone, text: "+91 98765 43210" },
                { icon: FiMail, text: "hello@spiceandsoul.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex gap-3 text-sm font-body">
                  <Icon className="text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-cream/50 whitespace-pre-line">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-dark-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/30 text-xs font-body">
            © 2024 Spice & Soul. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-cream/30 hover:text-gold text-xs font-body transition-colors"
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
