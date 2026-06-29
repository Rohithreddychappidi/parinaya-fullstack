import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function Contact() {
  const { config } = useConfig();

  const phone     = config.phone        || '7075703309';
  const phoneDisp = config.phone_display || '+91 70757 03309';
  const email     = config.email        || 'parinayatanjorepaintings@gmail.com';
  const address   = config.address      || 'Hafeezpet, Miyapur, Hyderabad, Telangana 500049';

  const hours = [
    config.hours_weekday,
    config.hours_saturday,
    config.hours_sunday,
  ].filter(Boolean).map(h => {
    const [day, time] = h.split('|');
    return { day: day?.trim(), time: time?.trim() };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="mt-6 mb-12">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-3">Contact Us</h1>
        <p className="text-ink/60 max-w-xl">
          For custom orders, pricing or any questions, reach out to us directly — we're happy to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-7">
          <div className="flex gap-4 items-start">
            <Phone size={20} className="text-gold-dark mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-sm uppercase tracking-wide text-ink mb-1">Phone</h3>
              <a href={`tel:+91${phone}`} className="text-ink/70 hover:text-gold-dark transition-colors">
                {phoneDisp}
              </a>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Mail size={20} className="text-gold-dark mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-sm uppercase tracking-wide text-ink mb-1">Email</h3>
              <a href={`mailto:${email}`} className="text-ink/70 hover:text-gold-dark transition-colors break-all">
                {email}
              </a>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <MapPin size={20} className="text-gold-dark mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-sm uppercase tracking-wide text-ink mb-1">Address</h3>
              <a
                href="https://share.google/K1nj5Bls2RUBCMdQ3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/70 leading-relaxed hover:text-gold-dark transition-colors"
              >
                {address}
              </a>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Clock size={20} className="text-gold-dark mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-sm uppercase tracking-wide text-ink mb-1">Business Hours</h3>
              {hours.length > 0 ? hours.map((h, i) => (
                <p key={i} className="text-ink/70">{h.day}: {h.time}</p>
              )) : (
                <p className="text-ink/70">Open daily, 10:00 AM – 9:00 PM</p>
              )}
            </div>
          </div>

          <WhatsAppButton label="Chat with Us on WhatsApp" />
        </div>

        <div className="aspect-[4/3] bg-cream border border-line flex items-center justify-center">
          <p className="text-ink/40 text-sm">Map placeholder</p>
        </div>
      </div>
    </div>
  );
}