import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { getCategories, buildWhatsAppLink } from '../../services/api';
import logo from '../../assets/logo.png';

export default function Header() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [categories, setCategories]   = useState([]);
  const [waHref, setWaHref]           = useState('https://wa.me/917075703309');
  const [canScrollL, setCanScrollL]   = useState(false);
  const [canScrollR, setCanScrollR]   = useState(false);
  const navRef = useRef(null);
  const scrollInterval = useRef(null);
  const { config } = useConfig();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    buildWhatsAppLink().then(setWaHref).catch(() => {});
  }, []);

  // Check scroll state whenever categories load or window resizes
  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 4);
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [categories, updateScrollState]);

  // Continuous scroll while arrow is held / hovered
  const startScroll = useCallback((dir) => {
    clearInterval(scrollInterval.current);
    scrollInterval.current = setInterval(() => {
      if (navRef.current) {
        navRef.current.scrollLeft += dir * 6;
        updateScrollState();
      }
    }, 16);
  }, [updateScrollState]);

  const stopScroll = useCallback(() => {
    clearInterval(scrollInterval.current);
  }, []);

  // Hover-to-scroll: when mouse is near the right/left edge of nav, scroll
  const handleNavMouseMove = useCallback((e) => {
    const el = navRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const edgeZone = 60; // px from edge that triggers auto-scroll
    const xFromLeft  = e.clientX - rect.left;
    const xFromRight = rect.right - e.clientX;
    clearInterval(scrollInterval.current);
    if (xFromRight < edgeZone && canScrollR) {
      scrollInterval.current = setInterval(() => {
        el.scrollLeft += 5;
        updateScrollState();
      }, 16);
    } else if (xFromLeft < edgeZone && canScrollL) {
      scrollInterval.current = setInterval(() => {
        el.scrollLeft -= 5;
        updateScrollState();
      }, 16);
    }
  }, [canScrollL, canScrollR, updateScrollState]);

  const logoText    = config.logo_text    || 'Parinaya';
  const logoSubtext = config.logo_subtext || 'TANJORE PAINTINGS';

  return (
    <header className="bg-paper sticky top-0 z-50 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt={logoText} className="h-12 sm:h-14 w-auto" />
            <span className="flex flex-col items-start">
              <span className="font-display text-2xl sm:text-3xl tracking-wide text-ink leading-none">
                {logoText}
              </span>
              <span className="text-[10px] tracking-widest2 uppercase text-gold-dark mt-1">
                {logoSubtext}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/pages/contact"
              className="hidden sm:inline text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors"
            >
              Contact
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="p-2 hover:text-gold-dark transition-colors"
            >
              <MessageCircle size={19} />
            </a>
          </div>
        </div>

        {/* Desktop nav with arrow scroll buttons */}
        <div className="hidden lg:flex items-center border-t border-line h-12 relative">
          {/* Left arrow */}
          <button
            aria-label="Scroll left"
            onMouseEnter={() => startScroll(-1)}
            onMouseLeave={stopScroll}
            onMouseDown={() => startScroll(-1)}
            onMouseUp={stopScroll}
            onClick={() => { navRef.current && (navRef.current.scrollLeft -= 120); updateScrollState(); }}
            className={`flex-shrink-0 h-full px-2 flex items-center text-ink/40 hover:text-gold-dark transition-all duration-200 ${
              canScrollL ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable nav */}
          <nav
            ref={navRef}
            onScroll={updateScrollState}
            onMouseMove={handleNavMouseMove}
            onMouseLeave={stopScroll}
            className="flex items-center gap-7 h-full flex-1 overflow-x-auto px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
            <Link
              to="/"
              className="flex-shrink-0 text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors"
            >
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/collections/${cat.slug}`}
                className="flex-shrink-0 text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right arrow */}
          <button
            aria-label="Scroll right"
            onMouseEnter={() => startScroll(1)}
            onMouseLeave={stopScroll}
            onMouseDown={() => startScroll(1)}
            onMouseUp={stopScroll}
            onClick={() => { navRef.current && (navRef.current.scrollLeft += 120); updateScrollState(); }}
            className={`flex-shrink-0 h-full px-2 flex items-center text-ink/40 hover:text-gold-dark transition-all duration-200 ${
              canScrollR ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight size={16} />
          </button>

          {/* Fade gradients to hint more content */}
          {canScrollL && (
            <div className="pointer-events-none absolute left-7 top-0 bottom-0 w-8 bg-gradient-to-r from-paper to-transparent z-10" />
          )}
          {canScrollR && (
            <div className="pointer-events-none absolute right-7 top-0 bottom-0 w-8 bg-gradient-to-l from-paper to-transparent z-10" />
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-paper overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <span className="flex items-center gap-2">
                <img src={logo} alt={logoText} className="h-8 w-auto" />
                <span className="font-display text-xl text-ink">{logoText}</span>
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button>
            </div>
            <nav className="flex flex-col">
              <Link to="/" onClick={() => setMobileOpen(false)}
                className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide">Home</Link>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/collections/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide flex items-center justify-between">
                  {cat.name}
                  <ChevronDown size={14} className="-rotate-90 text-line" />
                </Link>
              ))}
              <Link to="/pages/contact" onClick={() => setMobileOpen(false)}
                className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide">Contact Us</Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                className="px-5 py-4 text-sm uppercase tracking-wide flex items-center gap-2 text-gold-dark">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}