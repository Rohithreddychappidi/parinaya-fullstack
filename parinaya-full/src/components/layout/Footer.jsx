import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../ui/BrandIcons';
import { useConfig } from '../../hooks/useConfig';
import { getCategories } from '../../services/api';
import logo from '../../assets/logo.png';

export default function Footer() {
  const { config } = useConfig();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const siteName    = config.site_name    || 'Sri Sri Parinaya';
  const logoText    = config.logo_text    || 'Parinaya';
  const phone       = config.phone        || '7075703309';
  const phoneDisp   = config.phone_display || '+91 70757 03309';
  const email       = config.email        || 'parinayatanjorepaintings@gmail.com';
  const address     = config.address      || 'Hafeezpet, Miyapur, Hyderabad, Telangana';
  const fbUrl       = config.facebook_url;
  const igUrl       = config.instagram_url;

  // Parse hours from config keys
  const hours = [
    config.hours_weekday,
    config.hours_saturday,
    config.hours_sunday,
  ].filter(Boolean).map(h => {
    const [day, time] = h.split('|');
    return { day: day?.trim(), time: time?.trim() };
  });

  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt={logoText} className="h-14 w-auto" />
              <span className="font-display text-2xl">{logoText}</span>
            </div>
            <p className="text-sm text-paper/70 leading-relaxed">
              Handcrafted Tanjore paintings, brass idols and traditional
              decor — made by skilled artisans in the heritage style of South India.
            </p>
            <div className="flex gap-4 mt-5">
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook" className="text-paper/70 hover:text-gold transition-colors">
                  <FacebookIcon size={18} />
                </a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram" className="text-paper/70 hover:text-gold transition-colors">
                  <InstagramIcon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-gold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/collections/${cat.slug}`}
                    className="text-sm text-paper/70 hover:text-paper transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/pages/contact" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-gold mb-4">Business Hours</h4>
            <ul className="space-y-2.5">
              {hours.length > 0 ? hours.map((h, i) => (
                <li key={i} className="text-sm text-paper/70">
                  <span className="text-paper">{h.day}</span><br />{h.time}
                </li>
              )) : (
                <li className="text-sm text-paper/70">Open daily, 10:00 AM – 9:00 PM</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-gold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-paper/70">
              <li className="flex gap-2.5">
                <Phone size={15} className="mt-0.5 flex-shrink-0 text-gold" />
                <a href={`tel:+91${phone}`} className="hover:text-paper transition-colors">{phoneDisp}</a>
              </li>
              <li className="flex gap-2.5">
                <Mail size={15} className="mt-0.5 flex-shrink-0 text-gold" />
                <a href={`mailto:${email}`} className="hover:text-paper transition-colors break-all">{email}</a>
              </li>
              <li className="flex gap-2.5">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-gold" />
                <a
                  href="https://share.google/K1nj5Bls2RUBCMdQ3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-paper/15 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-paper/50">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-xs text-paper/50">Handmade in India by skilled artisans</p>
        </div>
      </div>
    </footer>
  );
}