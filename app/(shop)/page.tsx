'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Star, Info } from 'lucide-react';
import HeroCanvas from '@/components/three/HeroCanvas';
import { getCountdownTime, formatINR } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// Mock list of shop products in case database is empty or fetching
const homeProducts = [
  {
    id: 'nebula-S-black',
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE',
    slug: 'nebula-heavy-hoodie',
    category: 'HOODIES',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Midnight Black',
    stock: 20
  },
  {
    id: 'tee-M-grey',
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY MESH TEE',
    slug: 'anti-gravity-mesh-tee',
    category: 'TEES',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L'],
    color: 'Brutalist Grey',
    stock: 15
  },
  {
    id: 'beanie-OS-acid',
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE',
    slug: 'warp-dust-beanie',
    category: 'ACCESSORIES',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80',
    sizes: ['O/S'],
    color: 'Acid Green',
    stock: 40
  }
];

export default function HomePage() {
  const addItem = useCartStore((state) => state.addItem);
  
  // Set target drop date 5 days in the future for countdown
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d;
  });

  const [countdown, setCountdown] = useState({
    days: '00', hours: '00', minutes: '00', seconds: '00', hasEnded: false
  });

  // Animated counters
  const [metrics, setMetrics] = useState({ orders: 0, ecoRate: 0 });

  // Update Countdown Live
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownTime(targetDate));
    }, 1000);

    // Animate Metrics count-up simulation
    const metricsTimer = setTimeout(() => {
      setMetrics({ orders: 1845, ecoRate: 98 });
    }, 400);

    return () => {
      clearInterval(timer);
      clearTimeout(metricsTimer);
    };
  }, [targetDate]);

  return (
    <div className="flex-grow bg-[#0a0a0a] select-none text-[#F0EDE6] overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[calc(100vh-4rem)] flex items-center border-b border-[rgba(240,237,230,0.08)]">
        {/* Left Editorial Grid */}
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 pointer-events-none z-10">
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
            <div className="space-y-4">
              <span className="font-mono text-[10px] tracking-[0.4em] text-[#C8FF00] uppercase block">
                SYSTEM DROP 001 // GRAVITY ZERO
              </span>
              <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-none uppercase text-white">
                GRAVITY<br />DOESN'T<br />APPLY HERE.
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-[#888880] leading-relaxed max-w-sm pt-4">
                Premium heavyweight streetwear drops engineered for zero drag, structured drapes, and brutalist lines. Made in India.
              </p>
            </div>

            <div className="pointer-events-auto pt-8">
              <Link
                href="/catalog"
                className="brutalist-button inline-flex items-center gap-3 text-xs tracking-widest"
              >
                ACQUIRE DROP GEAR <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-between p-16 items-end text-right">
            <div className="bg-[#111111] border border-[rgba(240,237,230,0.08)] p-6 space-y-2 max-w-xs text-left">
              <Info className="h-4 w-4 text-[#C8FF00]" />
              <p className="text-[10px] uppercase font-bold text-white">ZERO RESTOCKS SYSTEM</p>
              <p className="text-[9px] text-[#888880] leading-relaxed">
                ONCE A Drop STOCK IS DEPLETED, IT IS ARCHIVED FOREVER. NO REPRODUCTION REQUESTS WILL BE ACCEPTED.
              </p>
            </div>
            <div className="font-mono text-[9px] text-[#444440] uppercase tracking-widest leading-loose">
              LATITUDE: 19.0760° N<br />LONGITUDE: 72.8777° E<br />ALTITUDE: 0M GRAVITY
            </div>
          </div>
        </div>

        {/* 3D Floating Mesh Canvas Container */}
        <div className="absolute inset-0 z-0">
          <HeroCanvas />
        </div>
      </section>

      {/* 2. DROP COUNTDOWN TIMER BAR (Pinned / Sticky Anchor look) */}
      <section id="countdown" className="bg-[#C8FF00] text-black py-4 font-mono font-bold tracking-widest text-xs flex flex-col sm:flex-row justify-center items-center gap-4 px-6 select-none border-y border-[#C8FF00]">
        <span className="uppercase text-center sm:text-left tracking-[0.2em]">NEXT Drop RELEASE LIVE COUNTDOWN:</span>
        <div className="flex gap-4 text-sm font-black">
          <div className="flex flex-col items-center">
            <span>{countdown.days}d</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{countdown.hours}h</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{countdown.minutes}m</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{countdown.seconds}s</span>
          </div>
        </div>
      </section>

      {/* 3. TRUST METRICS BAR */}
      <section className="bg-[#111111] border-b border-[rgba(240,237,230,0.08)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 border border-[rgba(240,237,230,0.04)]">
            <Truck className="h-8 w-8 text-[#C8FF00]" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Express Delivery</h4>
              <p className="text-[10px] text-[#888880] uppercase mt-0.5">Free shipping in India on orders &gt; ₹4000</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border border-[rgba(240,237,230,0.04)]">
            <ShieldCheck className="h-8 w-8 text-[#C8FF00]" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Genuine & Certified</h4>
              <p className="text-[10px] text-[#888880] uppercase mt-0.5">Original drop tags + GST compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border border-[rgba(240,237,230,0.04)]">
            <RefreshCw className="h-8 w-8 text-[#C8FF00]" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">RMA Returns Policy</h4>
              <p className="text-[10px] text-[#888880] uppercase mt-0.5">Easy returns and refunds pipeline</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID (DROP CATALOG REVEAL) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end border-b border-[rgba(240,237,230,0.08)] pb-6 mb-12">
          <div>
            <span className="font-mono text-[9px] tracking-[0.3em] text-[#888880] uppercase block mb-1">
              CURRENT DISPATCHED DROP
            </span>
            <h2 className="font-display font-black text-4xl tracking-tight text-white uppercase">
              ACQUISITIONS TERMINAL
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-mono tracking-widest text-[#C8FF00] hover:underline flex items-center gap-1.5 uppercase font-bold"
          >
            VIEW ENTIRE CATALOG <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {homeProducts.map((p) => (
            <div key={p.id} className="group border border-[rgba(240,237,230,0.08)] bg-[#111111] p-4 flex flex-col justify-between hover:border-[#C8FF00] transition-colors duration-300">
              
              {/* Image box */}
              <Link href={`/product/${p.slug}`} className="block relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden mb-4 border border-[rgba(240,237,230,0.04)]">
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
                <span className="absolute top-3 left-3 bg-[#0a0a0a] text-[#888880] text-[8px] font-mono px-2 py-0.5 border border-[rgba(240,237,230,0.08)]">
                  {p.category}
                </span>
              </Link>

              {/* Info Details */}
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors">
                    <Link href={`/product/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <span className="font-mono text-xs text-[#C8FF00] font-bold">{formatINR(p.price)}</span>
                </div>
                <p className="text-[9px] text-[#888880] uppercase">{p.color}</p>
              </div>

              {/* Add to Cart Drawer quick triggers */}
              <button
                onClick={() => {
                  addItem({
                    id: p.id,
                    productId: p.productId,
                    name: p.name,
                    slug: p.slug,
                    size: p.sizes[0] || 'O/S',
                    color: p.color,
                    price: p.price,
                    stock: p.stock,
                    image: p.image,
                  });
                }}
                className="w-full bg-[#1a1a1a] group-hover:bg-[#C8FF00] text-[#F0EDE6] group-hover:text-black font-extrabold text-[10px] py-2.5 mt-4 tracking-widest uppercase transition-all duration-300 border border-[rgba(240,237,230,0.08)] group-hover:border-[#C8FF00]"
              >
                QUICK ACQUIRE
              </button>

            </div>
          ))}
        </div>
      </section>

      {/* 5. EDITORIAL MASONRY LOOKBOOK WITH INTERACTIVE HOTSPOT */}
      <section id="lookbook" className="py-24 border-t border-[rgba(240,237,230,0.08)] bg-[#111111]/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="font-mono text-[9px] tracking-[0.3em] text-[#C8FF00] uppercase block">
              EDITORIAL PROJECTIONS
            </span>
            <h2 className="font-display font-black text-4xl tracking-tight text-white uppercase mt-1">
              SYSTEM LOOKBOOK
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Look 1 */}
            <div className="relative aspect-[4/5] bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"
                alt="Streetwear Look 1"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Interactive glowing hotspot */}
              <div className="absolute top-[40%] left-[55%] z-20 group">
                <button className="h-6 w-6 rounded-full bg-[#C8FF00] animate-ping absolute opacity-75" />
                <button className="h-6 w-6 rounded-full bg-[#C8FF00] text-black font-black text-[9px] flex items-center justify-center relative cursor-pointer">
                  +
                </button>
                {/* Hotspot details overlay */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 bg-[#0a0a0a] border border-[#C8FF00] p-3 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300">
                  <p className="text-[9px] font-bold text-white uppercase">NEBULA HEAVY HOODIE</p>
                  <p className="text-[9px] text-[#C8FF00] font-bold mt-1">{formatINR(4999)}</p>
                  <button
                    onClick={() => {
                      addItem({
                        id: 'nebula-S-black',
                        productId: 'nebula-prod-id',
                        name: 'NEBULA HEAVY HOODIE',
                        slug: 'nebula-heavy-hoodie',
                        size: 'S',
                        color: 'Midnight Black',
                        price: 4999,
                        stock: 20,
                        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
                      });
                    }}
                    className="mt-2 text-[8px] bg-[#C8FF00] text-black px-2 py-1 font-extrabold uppercase w-full tracking-wider block text-center"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>

            {/* Look 2 */}
            <div className="relative aspect-[4/5] bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                alt="Streetwear Look 2"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Interactive glowing hotspot */}
              <div className="absolute top-[60%] left-[30%] z-20 group">
                <button className="h-6 w-6 rounded-full bg-[#C8FF00] animate-ping absolute opacity-75" />
                <button className="h-6 w-6 rounded-full bg-[#C8FF00] text-black font-black text-[9px] flex items-center justify-center relative cursor-pointer">
                  +
                </button>
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 bg-[#0a0a0a] border border-[#C8FF00] p-3 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300">
                  <p className="text-[9px] font-bold text-white uppercase">ANTI-GRAVITY MESH TEE</p>
                  <p className="text-[9px] text-[#C8FF00] font-bold mt-1">{formatINR(2999)}</p>
                  <button
                    onClick={() => {
                      addItem({
                        id: 'tee-M-grey',
                        productId: 'tee-prod-id',
                        name: 'ANTI-GRAVITY MESH TEE',
                        slug: 'anti-gravity-mesh-tee',
                        size: 'M',
                        color: 'Brutalist Grey',
                        price: 2999,
                        stock: 15,
                        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
                      });
                    }}
                    className="mt-2 text-[8px] bg-[#C8FF00] text-black px-2 py-1 font-extrabold uppercase w-full tracking-wider block text-center"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>

            {/* Look 3 */}
            <div className="relative aspect-[4/5] bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] group overflow-hidden md:col-span-2 lg:col-span-1">
              <img
                src="https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80"
                alt="Streetwear Look 3"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF MARQUEE TICKER */}
      <section className="bg-[#0a0a0a] border-y border-[rgba(240,237,230,0.08)] py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-xs font-mono uppercase font-bold tracking-widest text-[#888880]">
          <span className="flex items-center gap-2 text-white">
            <Star className="h-3.5 w-3.5 text-[#C8FF00] fill-[#C8FF00]" /> "HEAVIEST HOODIE I OWN. QUALITY IS INSANE" - SHIVAM K.
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-[#C8FF00] fill-[#C8FF00]" /> "ACID GREEN MESH LOOKS INCREDIBLE IN HAND" - PRIYA M.
          </span>
          <span className="flex items-center gap-2 text-white">
            <Star className="h-3.5 w-3.5 text-[#C8FF00] fill-[#C8FF00]" /> "ZERO RESTOCK PROMISE DELIVERED. EXCLUSIVE GEAR" - ABHISHEK R.
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-[#C8FF00] fill-[#C8FF00]" /> "FAST SHIPPING TO BANGALORE. REAL 450 GSM WEIGHT" - ANIRUDH G.
          </span>
        </div>
      </section>
      
    </div>
  );
}
