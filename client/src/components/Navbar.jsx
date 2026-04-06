import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiUser, FiHeart, FiLogOut } from 'react-icons/fi';
import { GiSpoon } from 'react-icons/gi';
import { useStore } from '../store/useStore';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reserve', label: 'Reserve' },
  { to: '/offers', label: 'Offers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { getCartCount, setCartOpen, user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-gold/10 py-3' : 'py-5 bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <GiSpoon className="text-gold text-2xl group-hover:rotate-12 transition-transform duration-300" />
          <div>
            <span className="font-display text-xl font-semibold text-cream tracking-wide">Spice & Soul</span>
            <div className="text-gold text-[9px] tracking-[0.3em] uppercase font-body -mt-1">Fine Indian Cuisine</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`font-body text-sm tracking-wide transition-colors duration-200 hover:text-gold ${location.pathname === link.to ? 'text-gold' : 'text-cream/70'}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button onClick={() => setCartOpen(true)} className="relative p-2 text-cream/70 hover:text-gold transition-colors">
            <FiShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gold text-dark text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-cream/70 hover:text-gold transition-colors">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  : <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs font-bold">{user.name?.[0]}</div>}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-2 shadow-xl border border-gold/10">
                    <p className="px-3 py-2 text-xs text-cream/50 border-b border-dark-border mb-1">{user.name}</p>
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-cream/70 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors"><FiUser /> My Account</Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/5 transition-colors"><FiLogOut /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex btn-outline text-sm py-2 px-4">Sign In</Link>
          )}

          {/* Order Now CTA */}
          <Link to="/menu" className="hidden md:flex btn-gold text-sm py-2.5 px-5">Order Now</Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-cream/70 hover:text-gold transition-colors">
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-gold/10 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-3 rounded-xl font-body text-sm transition-colors ${location.pathname === link.to ? 'text-gold bg-gold/5' : 'text-cream/70 hover:text-gold hover:bg-gold/5'}`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-dark-border mt-2 flex gap-3">
                <Link to="/login" className="flex-1 btn-outline text-sm py-2.5 justify-center">Sign In</Link>
                <Link to="/menu" className="flex-1 btn-gold text-sm py-2.5 justify-center">Order Now</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
