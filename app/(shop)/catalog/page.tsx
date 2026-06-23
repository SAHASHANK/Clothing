'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid, ListFilter, ArrowUpDown, Heart, Eye, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// Database mock entries
const catalogData = [
  {
    id: 'nebula-S-black',
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE',
    slug: 'nebula-heavy-hoodie',
    category: 'HOODIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 3 }
    ],
    color: 'Midnight Black',
    popularity: 98,
    createdAt: new Date('2026-05-10')
  },
  {
    id: 'nebula-S-white',
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE - CREAM',
    slug: 'nebula-heavy-hoodie-cream',
    category: 'HOODIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ],
    color: 'Off-White',
    popularity: 90,
    createdAt: new Date('2026-05-12')
  },
  {
    id: 'tee-M-grey',
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY MESH TEE',
    slug: 'anti-gravity-mesh-tee',
    category: 'TEES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 0 } // Out of Stock size trigger
    ],
    color: 'Brutalist Grey',
    popularity: 88,
    createdAt: new Date('2026-05-14')
  },
  {
    id: 'tee-S-acid',
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY TEE - ACID GREEN',
    slug: 'anti-gravity-tee-acid-green',
    category: 'TEES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 2 }
    ],
    color: 'Acid Green',
    popularity: 94,
    createdAt: new Date('2026-05-15')
  },
  {
    id: 'beanie-OS-acid',
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE',
    slug: 'warp-dust-beanie',
    category: 'ACCESSORIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'O/S', stock: 45 }
    ],
    color: 'Acid Green',
    popularity: 76,
    createdAt: new Date('2026-05-01')
  },
  {
    id: 'beanie-OS-black',
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE - BLACK',
    slug: 'warp-dust-beanie-black',
    category: 'ACCESSORIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'O/S', stock: 50 }
    ],
    color: 'Core Black',
    popularity: 82,
    createdAt: new Date('2026-05-02')
  }
];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [allProducts, setAllProducts] = useState<any[]>(catalogData);
  const [products, setProducts] = useState<any[]>(catalogData);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<typeof catalogData>([]);
  const [limit, setLimit] = useState(4); // For Infinite Scroll load more simulation
  
  // URL queries
  const activeCategory = searchParams.get('category') || 'ALL';
  const activeDrop = searchParams.get('drop') || 'ALL';
  const activeSort = searchParams.get('sort') || 'POPULAR';
  const searchQuery = searchParams.get('q') || '';

  // Load products dynamically from database via API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data);
          setProducts(data);
        }
      } catch (err) {
        console.warn('API fetch for products failed, utilizing static catalog data fallback');
      }
    };
    fetchProducts();
  }, []);

  // Load wishlist & recently viewed from localStorage
  useEffect(() => {
    const savedWish = localStorage.getItem('unhrd-wishlist');
    if (savedWish) setWishlist(JSON.parse(savedWish));

    const savedRecent = localStorage.getItem('unhrd-recently-viewed');
    if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
  }, []);

  // Filtering & Sorting Process
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter search queries
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter categories
    if (activeCategory !== 'ALL') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Filter drops
    if (activeDrop !== 'ALL') {
      filtered = filtered.filter((p) => p.drop === activeDrop);
    }

    // Sort
    if (activeSort === 'PRICE_LOW_HIGH') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'PRICE_HIGH_LOW') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'NEWEST') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      // POPULAR
      filtered.sort((a, b) => b.popularity - a.popularity);
    }

    setProducts(filtered);
  }, [allProducts, activeCategory, activeDrop, activeSort, searchQuery]);


  // Update query params
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const toggleWishlist = (id: string) => {
    let updated = [];
    if (wishlist.includes(id)) {
      updated = wishlist.filter((item) => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem('unhrd-wishlist', JSON.stringify(updated));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 font-mono text-[#F0EDE6]">
      
      {/* Search status header */}
      {searchQuery && (
        <div className="mb-8 p-4 bg-[#111] border border-[rgba(240,237,230,0.08)]">
          <p className="text-xs uppercase">
            Search Projections for query: <span className="text-[#C8FF00] font-bold">"{searchQuery}"</span>
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 1. STICKY SIDEBAR FILTER */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 lg:sticky lg:top-24 h-fit bg-[#111111]/40 border border-[rgba(240,237,230,0.08)] p-6">
          <div className="flex items-center gap-2 border-b border-[rgba(240,237,230,0.08)] pb-3">
            <ListFilter className="h-4 w-4 text-[#C8FF00]" />
            <h3 className="text-xs tracking-widest font-extrabold uppercase text-white">System Filters</h3>
          </div>

          {/* Drops */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] tracking-widest uppercase text-[#888880] font-bold">System Drops</h4>
            <div className="flex flex-col gap-1.5 text-[10px] uppercase">
              <button
                onClick={() => updateQuery('drop', 'ALL')}
                className={`text-left hover:text-[#C8FF00] transition-colors ${activeDrop === 'ALL' ? 'text-[#C8FF00] font-bold' : ''}`}
              >
                [ ] ALL DROPS
              </button>
              <button
                onClick={() => updateQuery('drop', 'DROP_001_GRAVITY_ZERO')}
                className={`text-left hover:text-[#C8FF00] transition-colors ${activeDrop === 'DROP_001_GRAVITY_ZERO' ? 'text-[#C8FF00] font-bold' : ''}`}
              >
                [x] DROP 001 GRAVITY
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] tracking-widest uppercase text-[#888880] font-bold">Category Layers</h4>
            <div className="flex flex-col gap-1.5 text-[10px] uppercase">
              {['ALL', 'HOODIES', 'TEES', 'ACCESSORIES'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateQuery('category', cat)}
                  className={`text-left hover:text-[#C8FF00] transition-colors ${activeCategory === cat ? 'text-[#C8FF00] font-bold' : ''}`}
                >
                  {activeCategory === cat ? '■' : '□'} {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 2. MAIN CATALOG TERMINAL */}
        <div className="flex-grow space-y-8">
          
          {/* Sorting panel */}
          <div className="flex justify-between items-center border border-[rgba(240,237,230,0.08)] bg-[#111] px-4 py-3">
            <span className="text-[10px] uppercase tracking-widest text-[#888880]">
              Showing {Math.min(products.length, limit)} of {products.length} Items
            </span>
            
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#C8FF00]" />
              <select
                value={activeSort}
                onChange={(e) => updateQuery('sort', e.target.value)}
                className="bg-transparent text-[10px] text-white uppercase outline-none cursor-pointer tracking-wider font-bold"
              >
                <option value="POPULAR" className="bg-[#0a0a0a]">Popularity Index</option>
                <option value="PRICE_LOW_HIGH" className="bg-[#0a0a0a]">Price: Low to High</option>
                <option value="PRICE_HIGH_LOW" className="bg-[#0a0a0a]">Price: High to Low</option>
                <option value="NEWEST" className="bg-[#0a0a0a]">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {products.slice(0, limit).map((p) => (
              <div
                key={p.id}
                className="group border border-[rgba(240,237,230,0.08)] bg-[#111111] p-4 flex flex-col justify-between hover:border-[#C8FF00] transition-colors duration-300"
              >
                
                {/* Image panel */}
                <div className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden border border-[rgba(240,237,230,0.04)] mb-4">
                  <Link href={`/product/${p.slug}`}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <img
                      src={p.hoverImage}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </Link>

                  {/* Actions overlay */}
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 bg-black/80 hover:text-red-500 p-2 border border-[rgba(240,237,230,0.08)] transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${wishlist.includes(p.id) ? 'fill-red-500 text-red-500' : 'text-[#888880]'}`} />
                  </button>

                  <span className="absolute bottom-3 left-3 bg-[#0a0a0a] text-[#888880] text-[8px] font-mono px-2 py-0.5 border border-[rgba(240,237,230,0.08)] uppercase">
                    {p.drop}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors">
                      <Link href={`/product/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <span className="font-mono text-xs text-[#C8FF00] font-bold">{formatINR(p.price)}</span>
                  </div>

                  {/* Size chips */}
                  <div className="flex gap-1.5 flex-wrap pt-1.5 border-t border-[rgba(240,237,230,0.04)]">
                    {p.sizes.map((s: { size: string; stock: number }) => (
                      <span
                        key={s.size}
                        className={`text-[8px] px-2 py-0.5 border ${
                          s.stock > 0
                            ? 'border-[rgba(240,237,230,0.18)] text-[#F0EDE6]'
                            : 'border-[rgba(240,237,230,0.04)] text-[#444440] line-through'
                        }`}
                      >
                        {s.size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Add */}
                <button
                  onClick={() => {
                    addItem({
                      id: p.id,
                      productId: p.productId,
                      name: p.name,
                      slug: p.slug,
                      size: p.sizes[0]?.size || 'O/S',
                      color: p.color,
                      price: p.price,
                      stock: p.sizes[0]?.stock || 20,
                      image: p.image,
                    });
                  }}
                  className="w-full bg-[#1a1a1a] hover:bg-[#C8FF00] text-[#F0EDE6] hover:text-black font-extrabold text-[10px] py-2.5 mt-4 tracking-widest uppercase transition-all duration-300 border border-[rgba(240,237,230,0.08)] hover:border-[#C8FF00]"
                >
                  QUICK ADD
                </button>

              </div>
            ))}
          </div>

          {/* Infinite Scroll Load More trigger */}
          {limit < products.length && (
            <div className="text-center pt-8 border-t border-[rgba(240,237,230,0.08)]">
              <button
                onClick={() => setLimit((l) => l + 4)}
                className="brutalist-button text-xs py-3 px-8"
              >
                LOAD MORE ITEMS
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Recently Viewed Panel */}
      {recentlyViewed.length > 0 && (
        <section className="mt-24 border-t border-[rgba(240,237,230,0.08)] pt-16">
          <h3 className="text-xs uppercase tracking-widest text-[#888880] mb-6 flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#C8FF00]" /> RECENTLY INSPECTED GEAR
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <div key={p.id} className="border border-[rgba(240,237,230,0.04)] bg-[#111]/30 p-3">
                <Link href={`/product/${p.slug}`} className="block aspect-[3/4] overflow-hidden bg-[#1a1a1a] mb-2">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <p className="text-[9px] font-bold uppercase truncate text-white">{p.name}</p>
                <p className="text-[9px] text-[#C8FF00] font-bold mt-0.5">{formatINR(p.price)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-[#0a0a0a] min-h-[50vh] font-mono text-xs text-[#C8FF00] tracking-widest uppercase">
        Establishing secure pipeline...
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
