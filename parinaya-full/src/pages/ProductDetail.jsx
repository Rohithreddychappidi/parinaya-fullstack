import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../services/api';
import { useConfig } from '../hooks/useConfig';
import { useCart } from '../context/CartContext';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/ui/Breadcrumb';
import { AccordionItem } from '../components/ui/Accordion';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import { Truck, ShieldCheck, ShoppingBag, Check } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { config } = useConfig();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setAdded(false);
    getProductById(id)
      .then((p) => {
        setProduct(p);
        return getRelatedProducts(id);
      })
      .then(setRelated)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-ink/50">
      Loading…
    </div>
  );

  if (notFound || !product) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
      <Link to="/" className="text-gold-dark underline">Return home</Link>
    </div>
  );

  // Normalise images: API returns [{ url, ... }], extract URL strings for the gallery
  const imageUrls = (product.images || []).map(img =>
    typeof img === 'string' ? img : img.url
  ).filter(Boolean);

  const price = product.price?.toLocaleString('en-IN');

  // Use per-product text if set, else fall back to site-wide defaults from config
  const shippingText     = product.shipping_info     || config.shipping_returns_default  || 'Orders once placed cannot be cancelled. Shipping is free across India, dispatched within 1–3 business days and delivered within 7 days of shipping.\n\nWe offer exchange or returns only on items that are damaged or defective, within 5 days of delivery.';
  const careText         = product.care_instructions || config.care_instructions_default || 'Clean only with a soft, dry cloth or soft brush. Avoid water, harsh chemicals or detergents to preserve the gold work and finish.';
  const noteText         = product.please_note       || config.please_note_default       || 'As all pieces are handmade, slight variation in detailing, dimensions and weight is normal and part of the craft.';
  const badge1           = product.trust_badge_1     || config.trust_badge_1_default     || 'Free shipping across India, dispatched in 1–3 business days';
  const badge2           = product.trust_badge_2     || config.trust_badge_2_default     || 'Handmade by skilled artisans — quality checked before dispatch';

  const inStock = product.in_stock ?? product.inStock ?? true;

  const handleAddToCart = () => {
    // Explicitly attach the first image URL so CartContext can store it
    const productWithImage = {
      ...product,
      images: imageUrls.length > 0 ? [{ url: imageUrls[0] }] : [],
    };
    addToCart(productWithImage);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumb
        items={[
          ...(product.category_name
            ? [{ label: product.category_name, to: `/collections/${product.category_slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-6">
        <ProductGallery images={imageUrls} productName={product.name} />

        <div>
          {product.category_name && (
            <p className="text-xs tracking-widest2 uppercase text-gold-dark mb-3">
              {product.category_name}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl text-ink mb-3 leading-tight">
            {product.name}
          </h1>
          <p className="text-2xl text-ink mb-1">₹{price}</p>
          <p className="text-xs text-ink/50 mb-6">Inclusive of all taxes</p>

          {!inStock && (
            <p className="text-sm text-ink/60 mb-4 uppercase tracking-wide">Currently Sold Out</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <WhatsAppButton
  productName={product.name}
  productImage={imageUrls[0]}
  productPrice={product.price}
  label="Enquire on WhatsApp"
  className="flex-1"
/>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-medium tracking-wide uppercase transition-colors
                ${added
                  ? 'bg-green-600 text-white'
                  : 'bg-ink text-paper hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-8 text-sm text-ink/70">
            <div className="flex gap-2.5 items-start">
              <Truck size={16} className="text-gold-dark mt-0.5 flex-shrink-0" />
              <span>{badge1}</span>
            </div>
            <div className="flex gap-2.5 items-start">
              <ShieldCheck size={16} className="text-gold-dark mt-0.5 flex-shrink-0" />
              <span>{badge2}</span>
            </div>
          </div>

          {product.description && (
            <p className="text-ink/75 leading-relaxed mb-6">{product.description}</p>
          )}

          {product.dimensions && (
            <p className="text-sm text-ink/60 mb-6">{product.dimensions}</p>
          )}

          <div className="border-t border-line mt-2">
            <AccordionItem title="Shipping & Returns" defaultOpen>
              {shippingText.split('\n\n').map((para, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
              ))}
            </AccordionItem>
            <AccordionItem title="Care Instructions">
              <p>{careText}</p>
            </AccordionItem>
            <AccordionItem title="Please Note">
              <p>{noteText}</p>
            </AccordionItem>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-line">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
