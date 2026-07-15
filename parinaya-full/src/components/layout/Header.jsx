import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, Search } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { getCategories, buildWhatsAppLink } from '../../services/api';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/logo.png';

export default function Header() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [categories, setCategories]     = useState([]);
  const [waHref, setWaHref]             = useState('https://wa.me/917075703309');
  const [canScrollL, setCanScrollL]     = useState(false);
  const [canScrollR, setCanScrollR]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const navRef        = useRef(null);
  const scrollInterval= useRef(null);
  const dropdownTimer = useRef(null);
  const searchRef     = useRef(null);
  const { config }    = useConfig();
  const { cartCount } = useCart();
  const navigate      = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    buildWhatsAppLink().then(setWaHref).catch(() => {});
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

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

  const startScroll = useCallback((dir) => {
    clearInterval(scrollInterval.current);
    scrollInterval.current = setInterval(() => {
      if (navRef.current) { navRef.current.scrollLeft += dir * 6; updateScrollState(); }
    }, 16);
  }, [updateScrollState]);

  const stopScroll = useCallback(() => clearInterval(scrollInterval.current), []);

  const handleNavMouseMove = useCallback((e) => {
    const el = navRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const edgeZone = 60;
    const xL = e.clientX - rect.left;
    const xR = rect.right - e.clientX;
    clearInterval(scrollInterval.current);
    if (xR < edgeZone && canScrollR) {
      scrollInterval.current = setInterval(() => { el.scrollLeft += 5; updateScrollState(); }, 16);
    } else if (xL < edgeZone && canScrollL) {
      scrollInterval.current = setInterval(() => { el.scrollLeft -= 5; updateScrollState(); }, 16);
    }
  }, [canScrollL, canScrollR, updateScrollState]);

  const handleCatEnter = (id) => { clearTimeout(dropdownTimer.current); setOpenDropdown(id); };
  const handleCatLeave = () => { dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 150); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const logoText    = config.logo_text    || 'Parinaya';
  const logoSubtext = config.logo_subtext || 'TANJORE PAINTINGS';

  return (
    <header className="bg-paper sticky top-0 z-50 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 -ml-2 flex-shrink-0" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={logo} alt={logoText} className="h-12 sm:h-14 w-auto" />
            <span className="hidden sm:flex flex-col items-start">
              <span className="font-display text-2xl sm:text-3xl tracking-wide text-ink leading-none">{logoText}</span>
              <span className="text-[10px] tracking-widest2 uppercase text-gold-dark mt-1">{logoSubtext}</span>
            </span>
          </Link>

          {/* ── Search bar — fills the space between logo and icons ── */}
          <div className="flex-1 max-w-md hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center border border-ink bg-paper">
                <Search size={15} className="ml-3 text-ink/40 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search paintings, idols, gifts…"
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="px-3 py-2 text-ink/40 hover:text-ink transition-colors">
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 border border-line px-4 py-2 text-sm text-ink/40 hover:border-ink hover:text-ink/60 transition-colors bg-cream/50"
              >
                <Search size={14} />
                <span>Search paintings, idols, gifts…</span>
              </button>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile search icon */}
            <button
              className="sm:hidden p-2 hover:text-gold-dark transition-colors"
              onClick={() => navigate('/search')}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <Link to="/pages/contact" className="hidden lg:inline text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors">
              Contact
            </Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="p-2 hover:text-gold-dark transition-colors">
              <MessageCircle size={19} />
            </a>
            <Link to="/cart" aria-label="Enquiry cart" className="relative p-2 hover:text-gold-dark transition-colors">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-dark text-paper text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop category nav */}
        <div className="hidden lg:flex items-center border-t border-line h-12 relative">
          <button
            aria-label="Scroll left"
            onMouseEnter={() => startScroll(-1)} onMouseLeave={stopScroll}
            onClick={() => { navRef.current && (navRef.current.scrollLeft -= 120); updateScrollState(); }}
            className={`flex-shrink-0 h-full px-2 flex items-center text-ink/40 hover:text-gold-dark transition-all ${canScrollL ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronLeft size={16} />
          </button>

          <nav
            ref={navRef} onScroll={updateScrollState}
            onMouseMove={handleNavMouseMove} onMouseLeave={stopScroll}
            className="flex items-center gap-7 h-full flex-1 overflow-x-auto px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`nav::-webkit-scrollbar{display:none}`}</style>
            <Link to="/" className="flex-shrink-0 text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors">
              Home
            </Link>
            {categories.map((cat) => (
              <div key={cat.id} className="relative flex-shrink-0 h-full flex items-center"
                onMouseEnter={() => cat.subcategories?.length ? handleCatEnter(cat.id) : null}
                onMouseLeave={handleCatLeave}
              >
                <Link to={`/collections/${cat.slug}`}
                  className="flex items-center gap-1 text-xs tracking-widest2 uppercase text-ink hover:text-gold-dark transition-colors whitespace-nowrap">
                  {cat.name}
                  {cat.subcategories?.length > 0 && (
                    <ChevronDown size={11} className={`transition-transform ${openDropdown === cat.id ? 'rotate-180' : ''}`} />
                  )}
                </Link>
                {cat.subcategories?.length > 0 && openDropdown === cat.id && (
                  <div className="absolute top-full left-0 mt-0 bg-paper border border-line shadow-md min-w-[200px] z-50"
                    onMouseEnter={() => handleCatEnter(cat.id)} onMouseLeave={handleCatLeave}>
                    {cat.subcategories.map(sub => (
                      <Link key={sub.id} to={`/collections/${sub.slug}`}
                        className="block px-4 py-2.5 text-xs tracking-wide uppercase text-ink hover:bg-cream hover:text-gold-dark transition-colors border-b border-line last:border-0">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            aria-label="Scroll right"
            onMouseEnter={() => startScroll(1)} onMouseLeave={stopScroll}
            onClick={() => { navRef.current && (navRef.current.scrollLeft += 120); updateScrollState(); }}
            className={`flex-shrink-0 h-full px-2 flex items-center text-ink/40 hover:text-gold-dark transition-all ${canScrollR ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronRight size={16} />
          </button>

          {canScrollL && <div className="pointer-events-none absolute left-7 top-0 bottom-0 w-8 bg-gradient-to-r from-paper to-transparent z-10" />}
          {canScrollR && <div className="pointer-events-none absolute right-7 top-0 bottom-0 w-8 bg-gradient-to-l from-paper to-transparent z-10" />}
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
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            {/* Mobile search */}
            <div className="p-4 border-b border-line">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileOpen(false); setSearchQuery(''); } }}
                className="flex items-center border border-line">
                <Search size={14} className="ml-3 text-ink/40" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none" />
              </form>
            </div>
            <nav className="flex flex-col">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide">Home</Link>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center border-b border-line">
                    <Link to={`/collections/${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="flex-1 px-5 py-4 text-sm uppercase tracking-wide">{cat.name}</Link>
                    {cat.subcategories?.length > 0 && (
                      <button className="px-4 py-4 text-ink/40"
                        onClick={() => setMobileExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))}>
                        <ChevronDown size={16} className={`transition-transform ${mobileExpanded[cat.id] ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {cat.subcategories?.length > 0 && mobileExpanded[cat.id] && (
                    <div className="bg-cream">
                      {cat.subcategories.map(sub => (
                        <Link key={sub.id} to={`/collections/${sub.slug}`} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-8 py-3 border-b border-line text-sm text-ink/70 uppercase tracking-wide">
                          <span className="text-ink/30">└</span>{sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/pages/contact" onClick={() => setMobileOpen(false)} className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide">Contact</Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="px-5 py-4 border-b border-line text-sm uppercase tracking-wide flex items-center gap-2">
                <ShoppingBag size={16} /> Enquiry Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="px-5 py-4 text-sm uppercase tracking-wide flex items-center gap-2 text-gold-dark">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
