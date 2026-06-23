'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, ShieldCheck, RefreshCw, AlertTriangle, Sparkles, MessageSquare, Star } from 'lucide-react';
import ProductViewer from '@/components/three/ProductViewer';
import { formatINR } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// Database fallback entries
const productsDatabase: Record<string, any> = {
  'nebula-heavy-hoodie': {
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE',
    slug: 'nebula-heavy-hoodie',
    description: '450 GSM ultra-heavy organic French terry cotton. Drop-shoulder boxy fit. Double-layered hood without drawstrings. Stacked brutalist rectangle emblem embroidered on chest. Anti-gravity dye technique.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'HOODIES',
    basePrice: 4999,
    modelUrl: '/models/hoodie.glb',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'nebula-S-black', size: 'S', color: 'Midnight Black', stock: 15 },
      { id: 'nebula-M-black', size: 'M', color: 'Midnight Black', stock: 25 },
      { id: 'nebula-L-black', size: 'L', color: 'Midnight Black', stock: 20 },
      { id: 'nebula-XL-black', size: 'XL', color: 'Midnight Black', stock: 3 }, // low stock indicator trigger
      { id: 'nebula-S-white', size: 'S', color: 'Off-White', stock: 10 },
      { id: 'nebula-M-white', size: 'M', color: 'Off-White', stock: 15 },
      { id: 'nebula-L-white', size: 'L', color: 'Off-White', stock: 12 },
      { id: 'nebula-XL-white', size: 'XL', color: 'Off-White', stock: 8 }
    ],
    reviews: [
      {
        id: 'rev-1',
        user: 'Rohan Sharma',
        rating: 5,
        title: 'INSANE QUALITY',
        body: 'Hands down the heaviest hoodie I own. The brutalist patch is subtle and clean. Fabric feels indestructible.',
        verified: true,
        createdAt: 'MAY 30, 2026'
      }
    ]
  },
  'nebula-heavy-hoodie-cream': {
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE - CREAM',
    slug: 'nebula-heavy-hoodie-cream',
    description: '450 GSM ultra-heavy organic French terry cotton. Drop-shoulder boxy fit. Double-layered hood without drawstrings. Stacked brutalist rectangle emblem embroidered on chest. Anti-gravity dye technique.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'HOODIES',
    basePrice: 4999,
    modelUrl: '/models/hoodie.glb',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'nebula-S-white', size: 'S', color: 'Off-White', stock: 10 },
      { id: 'nebula-M-white', size: 'M', color: 'Off-White', stock: 15 },
      { id: 'nebula-L-white', size: 'L', color: 'Off-White', stock: 12 },
      { id: 'nebula-XL-white', size: 'XL', color: 'Off-White', stock: 8 }
    ],
    reviews: []
  },
  'anti-gravity-mesh-tee': {
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY MESH TEE',
    slug: 'anti-gravity-mesh-tee',
    description: '280 GSM oversized fit heavy mesh streetwear tee. Features mock-neck collar and screen-printed raw branding details. Breathable tech knit.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'TEES',
    basePrice: 2999,
    modelUrl: '/models/tee.glb',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'tee-S-grey', size: 'S', color: 'Brutalist Grey', stock: 20 },
      { id: 'tee-M-grey', size: 'M', color: 'Brutalist Grey', stock: 30 },
      { id: 'tee-L-grey', size: 'L', color: 'Brutalist Grey', stock: 25 },
      { id: 'tee-XL-grey', size: 'XL', color: 'Brutalist Grey', stock: 0 }, // OOS variant
      { id: 'tee-S-acid', size: 'S', color: 'Acid Green', stock: 8 },
      { id: 'tee-M-acid', size: 'M', color: 'Acid Green', stock: 15 },
      { id: 'tee-L-acid', size: 'L', color: 'Acid Green', stock: 10 },
      { id: 'tee-XL-acid', size: 'XL', color: 'Acid Green', stock: 2 } // low stock variant
    ],
    reviews: [
      {
        id: 'rev-2',
        user: 'Priya M.',
        rating: 4,
        title: 'Amazing fit, mesh is premium',
        body: 'Slightly more oversized than expected but looks sick. Acid green is extremely bright.',
        verified: true,
        createdAt: 'MAY 28, 2026'
      }
    ]
  },
  'anti-gravity-tee-acid-green': {
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY TEE - ACID GREEN',
    slug: 'anti-gravity-tee-acid-green',
    description: '280 GSM oversized fit heavy mesh streetwear tee. Features mock-neck collar and screen-printed raw branding details. Breathable tech knit.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'TEES',
    basePrice: 2999,
    modelUrl: '/models/tee.glb',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'tee-S-acid', size: 'S', color: 'Acid Green', stock: 8 },
      { id: 'tee-M-acid', size: 'M', color: 'Acid Green', stock: 15 },
      { id: 'tee-L-acid', size: 'L', color: 'Acid Green', stock: 10 },
      { id: 'tee-XL-acid', size: 'XL', color: 'Acid Green', stock: 2 }
    ],
    reviews: []
  },
  'warp-dust-beanie': {
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE',
    slug: 'warp-dust-beanie',
    description: 'Ribbed knit watch cap beanie in premium merino wool blend. Brutalist rectangular brand tag stitched on front cuff.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'ACCESSORIES',
    basePrice: 1899,
    modelUrl: '/models/beanie.glb',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'beanie-OS-acid', size: 'O/S', color: 'Acid Green', stock: 45 },
      { id: 'beanie-OS-black', size: 'O/S', color: 'Core Black', stock: 50 }
    ],
    reviews: []
  },
  'warp-dust-beanie-black': {
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE - BLACK',
    slug: 'warp-dust-beanie-black',
    description: 'Ribbed knit watch cap beanie in premium merino wool blend. Brutalist rectangular brand tag stitched on front cuff.',
    drop: 'DROP_001_GRAVITY_ZERO',
    category: 'ACCESSORIES',
    basePrice: 1899,
    modelUrl: '/models/beanie.glb',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'beanie-OS-black', size: 'O/S', color: 'Core Black', stock: 50 }
    ],
    reviews: []
  }
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Find product in database or fallback
  const [p, setP] = useState<any>(() => productsDatabase[slug as string] || productsDatabase['nebula-heavy-hoodie']);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Fetch dynamic details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setP(data);
        }
      } catch (err) {
        console.warn('API fetch for single product details failed, fallback active');
      }
    };
    fetchProduct();
  }, [slug]);

  // Adjust defaults when product load is complete
  useEffect(() => {
    if (p && p.variants && p.variants.length > 0) {
      const colors = Array.from(new Set(p.variants.map((v: any) => v.color))) as string[];
      setSelectedColor(colors[0] || '');
    }
  }, [p]);

  useEffect(() => {
    if (p && p.variants && selectedColor) {
      const sizes = p.variants.filter((v: any) => v.color === selectedColor);
      setSelectedSize(sizes[0]?.size || '');
    }
  }, [p, selectedColor]);

  // Selection configurations
  const availableColors = p && p.variants ? Array.from(new Set(p.variants.map((v: any) => v.color))) : [];
  const availableSizes = p && p.variants ? p.variants.filter((v: any) => v.color === selectedColor) : [];
  
  // Find the exact matching variant
  const activeVariant = p && p.variants ? p.variants.find(
    (v: any) => v.color === selectedColor && v.size === selectedSize
  ) || availableSizes[0] : null;


  const [oosEmail, setOosEmail] = useState('');
  const [oosSubscribed, setOosSubscribed] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Add recently viewed item to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('unhrd-recently-viewed');
    let items = saved ? JSON.parse(saved) : [];
    items = items.filter((item: any) => item.slug !== p.slug);
    items.unshift(p);
    localStorage.setItem('unhrd-recently-viewed', JSON.stringify(items.slice(0, 4)));
  }, [p]);

  const handleAddToCart = () => {
    if (!activeVariant || activeVariant.stock <= 0) return;
    addItem({
      id: activeVariant.id,
      productId: p.productId,
      name: p.name,
      slug: p.slug,
      size: activeVariant.size,
      color: activeVariant.color,
      price: p.basePrice,
      stock: activeVariant.stock,
      image: p.images[0],
    });
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oosEmail) return;
    setOosSubscribed(true);
  };

  return (
    <div className="bg-[#0a0a0a] text-[#F0EDE6] font-mono min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: 3D Canvas / Image fallback */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <ProductViewer modelUrl={p.modelUrl} colorName={selectedColor} />
          
          {/* Micro Image list */}
          <div className="grid grid-cols-2 gap-4">
            {p.images.map((img: string, idx: number) => (
              <div key={idx} className="aspect-[4/5] bg-[#111] border border-[rgba(240,237,230,0.08)] overflow-hidden">
                <img src={img} alt={`Render ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Buy Box */}
        <div className="space-y-8">
          <div>
            <span className="text-[9px] tracking-[0.3em] text-[#C8FF00] font-bold uppercase block">
              {p.drop} // {p.category}
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white mt-1.5 leading-none">
              {p.name}
            </h1>
            <p className="text-[#C8FF00] font-bold text-xl mt-3">{formatINR(p.basePrice)}</p>
          </div>

          <p className="text-xs uppercase text-[#888880] leading-relaxed border-t border-[rgba(240,237,230,0.08)] pt-6">
            {p.description}
          </p>

          {/* Color Selection Swatches */}
          <div className="space-y-3">
            <span className="text-[10px] tracking-widest text-[#888880] uppercase block">Colors: {selectedColor}</span>
            <div className="flex gap-3">
              {availableColors.map((colorName: any) => (
                <button
                  key={colorName}
                  onClick={() => {
                    setSelectedColor(colorName);
                    // Select first available size in this color
                    const colorVariants = p.variants.filter((v: any) => v.color === colorName);
                    setSelectedSize(colorVariants[0]?.size || 'S');
                  }}
                  className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-widest transition-colors ${
                    selectedColor === colorName
                      ? 'border-[#C8FF00] text-[#C8FF00]'
                      : 'border-[rgba(240,237,230,0.18)] text-[#F0EDE6] hover:border-[#C8FF00]'
                  }`}
                >
                  {colorName}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] tracking-widest text-[#888880] uppercase">Selected Size: {selectedSize}</span>
              <button
                onClick={() => setShowSizeModal(true)}
                className="text-[9px] text-[#C8FF00] hover:underline uppercase font-bold"
              >
                Size Guide Recommender
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {availableSizes.map((v: any) => {
                const isSelected = selectedSize === v.size;
                const isOOS = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    disabled={isOOS}
                    onClick={() => setSelectedSize(v.size)}
                    className={`py-3 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center border ${
                      isOOS
                        ? 'border-[rgba(240,237,230,0.04)] text-[#444440] cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5'
                        : 'border-[rgba(240,237,230,0.18)] text-[#F0EDE6] hover:border-[#C8FF00]'
                    }`}
                  >
                    <span>{v.size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicators for stock urgency / OOS alerts */}
          <div className="border-y border-[rgba(240,237,230,0.08)] py-4">
            {activeVariant && activeVariant.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8FF00]"></span>
                </span>
                <span className="text-[10px] text-[#C8FF00] font-bold uppercase tracking-wider">
                  SYSTEM READY: DISPATCH AVAILABLE // IN STOCK
                </span>
                {activeVariant.stock <= 5 && (
                  <span className="text-[10px] text-yellow-500 font-extrabold uppercase ml-auto animate-pulse flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> ONLY {activeVariant.stock} LEFT
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  ⚠️ ARCHIVE ERROR: CURRENT SPECIFICATION IS TEMPORARILY DEPLETED
                </p>
                {oosSubscribed ? (
                  <p className="text-[9px] text-[#C8FF00] uppercase font-bold">
                    ⚡ NOTIFICATION PROTOCOL ENROLLED. WE WILL INBOX YOU ON RE-RELEASE.
                  </p>
                ) : (
                  <form onSubmit={handleNotifyMe} className="flex gap-2 max-w-sm">
                    <input
                      type="email"
                      required
                      value={oosEmail}
                      onChange={(e) => setOosEmail(e.target.value)}
                      placeholder="ENTER EMAIL FOR DROPS"
                      className="bg-[#111111] border border-[rgba(240,237,230,0.18)] text-[10px] px-3 py-2 flex-grow uppercase text-[#F0EDE6] outline-none focus:border-[#C8FF00]"
                    />
                    <button className="bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold px-4 text-[10px] uppercase transition-colors">
                      NOTIFY ME
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          {activeVariant && activeVariant.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold py-4 text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2"
            >
              ACQUIRE GEAR <ShoppingBag className="h-4 w-4" />
            </button>
          )}

          {/* Trust assurances block */}
          <div className="grid grid-cols-2 gap-4 border-b border-[rgba(240,237,230,0.08)] pb-8 text-[9px] uppercase tracking-wider text-[#888880]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C8FF00]" /> GST-COMPLIANT SYSTEM
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[#C8FF00]" /> 7-DAY RETURN POLICY
            </div>
          </div>

        </div>

      </div>

      {/* Below the Fold: Complete the Look */}
      <section className="mt-24 border-t border-[rgba(240,237,230,0.08)] pt-16">
        <h3 className="text-xs uppercase tracking-widest text-white mb-8 flex items-center gap-2 font-bold">
          <Sparkles className="h-4 w-4 text-[#C8FF00]" /> SYSTEM SUGGESTION: COMPLETE THE LOOK
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#111111] border border-[rgba(240,237,230,0.08)] p-4 flex gap-4 items-center">
            <img
              src="https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=100&q=80"
              alt="Upsell gear"
              className="h-16 w-12 object-cover"
            />
            <div>
              <p className="text-[10px] font-bold text-white uppercase">WARP DUST BEANIE</p>
              <p className="text-[10px] text-[#C8FF00] font-bold mt-1">{formatINR(1899)}</p>
              <button
                onClick={() => {
                  addItem({
                    id: 'beanie-OS-acid',
                    productId: 'beanie-prod-id',
                    name: 'WARP DUST BEANIE',
                    slug: 'warp-dust-beanie',
                    size: 'O/S',
                    color: 'Acid Green',
                    price: 1899,
                    stock: 45,
                    image: 'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=100&q=80',
                  });
                }}
                className="mt-2 text-[8px] border border-[#C8FF00] hover:bg-[#C8FF00] hover:text-black text-[#C8FF00] px-2 py-1 font-bold uppercase transition-colors"
              >
                QUICK ACQUIRE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-24 border-t border-[rgba(240,237,230,0.08)] pt-16">
        <h3 className="text-xs uppercase tracking-widest text-white mb-8 flex items-center gap-2 font-bold">
          <MessageSquare className="h-4 w-4 text-[#C8FF00]" /> OPERATOR REVIEWS & CORRESPONDENCE
        </h3>
        
        {p.reviews.length === 0 ? (
          <p className="text-[10px] text-[#888880] uppercase tracking-widest">
            NO CORRESPONDENCE FILED YET FOR THIS SPECIFICATION.
          </p>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {p.reviews.map((r: any) => (
              <div key={r.id} className="bg-[#111]/40 border border-[rgba(240,237,230,0.08)] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white uppercase">{r.user}</span>
                    {r.verified && (
                      <span className="text-[8px] bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-2 py-0.5 font-bold uppercase">
                        VERIFIED INSPECTION
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#888880]">{r.createdAt}</span>
                </div>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-[#444440]'
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white uppercase">{r.title}</p>
                  <p className="text-[10px] text-[#888880] leading-relaxed uppercase">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Size Guide Recommender Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[rgba(240,237,230,0.18)] p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C8FF00]">SIZE GUIDE RECOMENDER</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-[#888880] hover:text-white uppercase font-bold text-[10px]"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4 text-[10px] uppercase leading-relaxed text-[#888880]">
              <p className="text-white font-bold">UNHRD sizing fits slightly oversized (Brutalist boxy drape).</p>
              
              <table className="w-full border-collapse border border-[rgba(240,237,230,0.08)]">
                <thead>
                  <tr className="bg-[#0a0a0a] text-white">
                    <th className="border border-[rgba(240,237,230,0.08)] p-2">SIZE</th>
                    <th className="border border-[rgba(240,237,230,0.08)] p-2">CHEST (INCHES)</th>
                    <th className="border border-[rgba(240,237,230,0.08)] p-2">LENGTH (INCHES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center text-white font-bold">S</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">44</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">26.5</td>
                  </tr>
                  <tr>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center text-white font-bold">M</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">46</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">27.5</td>
                  </tr>
                  <tr>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center text-white font-bold">L</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">48</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">28.5</td>
                  </tr>
                  <tr>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center text-white font-bold">XL</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">50</td>
                    <td className="border border-[rgba(240,237,230,0.08)] p-2 text-center">29.5</td>
                  </tr>
                </tbody>
              </table>

              <p className="border-t border-[rgba(240,237,230,0.08)] pt-4 text-[9px] text-[#444440]">
                RECOMMENDATION: CHOOSE YOUR USUAL SIZE FOR OVERSIZED SILHOUETTE. SIZE DOWN FOR REGULAR DRAUGHT.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
