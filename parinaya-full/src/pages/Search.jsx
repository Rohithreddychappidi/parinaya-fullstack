import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/ui/Breadcrumb';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.srisriparinaya.com';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setProducts([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    fetch(`${API_BASE}/api/products?limit=60`)
      .then(r => r.json())
      .then(all => {
        const q = query.toLowerCase();
        const filtered = all.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.dimensions?.toLowerCase().includes(q)
        );
        setProducts(filtered);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const clearSearch = () => {
    setInput('');
    setSearchParams({});
    setProducts([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Search' }]} />

      <div className="mt-6 mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-6">Search</h1>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search paintings, brass idols, gifts…"
              className="w-full pl-9 pr-9 py-3 border border-line text-sm focus:outline-none focus:border-ink bg-paper"
            />
            {input && (
              <button type="button" onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
                <X size={15} />
              </button>
            )}
          </div>
          <button type="submit"
            className="px-5 py-3 bg-ink text-paper text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors">
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-20 text-ink/50">Searching…</div>
      )}

      {!loading && searched && (
        <div className="mb-6">
          <p className="text-ink/60 text-sm">
            {products.length === 0
              ? `No results found for "${query}"`
              : `${products.length} result${products.length > 1 ? 's' : ''} for "${query}"`}
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!loading && searched && products.length === 0 && (
        <div className="py-16 text-center border border-dashed border-line">
          <p className="text-ink/50 mb-4">Try a different keyword like "Lakshmi", "brass", or "Ganesha"</p>
          <Link to="/" className="text-sm uppercase tracking-wide text-gold-dark underline">Browse All Products</Link>
        </div>
      )}
    </div>
  );
}
