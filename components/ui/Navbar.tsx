'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const pathname = usePathname();
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Branding Block Emblem
  const BrandLogo = () => (
    <Link href="/" className="inline-flex items-center gap-3 group">
      <div className="bg-[#F0EDE6] text-[#0a0a0a] px-2 py-1 flex flex-col items-center justify-center font-bold tracking-tighter leading-none border border-[#F0EDE6] transition-all group-hover:bg-[#C8FF00] group-hover:border-[#C8FF00] duration-300 select-none">
        <span className="text-[10px] tracking-[0.2em] font-extrabold -mb-0.5">N</span>
        <span className="text-[12px] tracking-[0.1em] font-black -my-0.5">HR</span>
        <span className="text-[10px] tracking-[0.15em] font-extrabold -mt-0.5">D.</span>
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold tracking-widest text-sm text-[#F0EDE6] group-hover:text-[#C8FF00] transition-colors duration-300">UNHRD.LAB</span>
        <span className="text-[7.5px] font-mono tracking-[0.3em] text-[#888880] -mt-0.5 uppercase">Zero Gravity Drops</span>
      </div>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[rgba(240,237,230,0.08)] bg-[#0a0a0a]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex-1 lg:flex-none">
            <BrandLogo />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex md:space-x-8 font-mono text-xs tracking-widest uppercase">
            <Link
              href="/catalog"
              className={`transition-colors hover:text-[#C8FF00] ${
                pathname === '/catalog' ? 'text-[#C8FF00]' : 'text-[#888880]'
              }`}
            >
              Catalog
            </Link>
            <Link
              href="/#lookbook"
              className="text-[#888880] transition-colors hover:text-[#C8FF00]"
            >
              Lookbook
            </Link>
            <Link
              href="/#countdown"
              className="text-[#888880] transition-colors hover:text-[#C8FF00]"
            >
              Drops
            </Link>
            <Link
              href="/admin"
              className={`transition-colors hover:text-[#C8FF00] ${
                pathname.startsWith('/admin') ? 'text-[#C8FF00]' : 'text-[#888880]'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex flex-1 items-center justify-end space-x-6 md:flex-none">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-[#F0EDE6] hover:text-[#C8FF00] transition-colors"
              aria-label="Search items"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => toggleCart(true)}
              className="relative text-[#F0EDE6] hover:text-[#C8FF00] transition-colors flex items-center gap-1.5"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center bg-[#C8FF00] text-[9px] font-bold text-black font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg flex items-center justify-center p-4">
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-6 right-6 text-[#F0EDE6] hover:text-[#C8FF00]"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="w-full max-w-2xl text-center">
            <h3 className="font-mono text-xs tracking-widest text-[#888880] uppercase mb-4">
              Search the Lab Catalog
            </h3>
            <div className="relative border-b border-[#F0EDE6]/30 focus-within:border-[#C8FF00] transition-colors">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TYPE SWEATSHIRT, TEE OR ACCESSORY..."
                className="w-full bg-transparent py-4 text-2xl md:text-3xl text-center text-[#F0EDE6] focus:outline-none uppercase font-mono tracking-wider placeholder-[#444440]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchOpen(false);
                    window.location.href = `/catalog?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
            </div>
            <p className="mt-4 font-mono text-[10px] text-[#444440] uppercase">
              Press enter to search or Escape to exit
            </p>
          </div>
        </div>
      )}
    </>
  );
}
