'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatINR } from '@/lib/utils';
import { X, Plus, Minus, Trash2, Tag, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    giftWrap,
    setGiftWrap,
    appliedDiscount,
    applyDiscount,
    getCartSubtotal,
    getCartDiscountAmount,
    getCartTotal,
    getFreeShippingProgress,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = getCartSubtotal();
  const discountAmount = getCartDiscountAmount();
  const total = getCartTotal();
  const progress = getFreeShippingProgress();
  const shipping = subtotal >= 4000 || subtotal === 0 ? 0 : 250;

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    
    const code = promoInput.toUpperCase().trim();
    if (code === 'UNHRD1000') {
      if (subtotal < 4000) {
        setPromoError('MINIMUM ORDER VALUE FOR THIS COUPON IS ₹4,000');
        return;
      }
      applyDiscount({
        code: 'UNHRD1000',
        type: 'FLAT',
        value: 1000,
        minCart: 4000,
      });
      setPromoSuccess('₹1,000 FLAT DISCOUNT APPLIED');
    } else if (code === 'LAUNCH20') {
      applyDiscount({
        code: 'LAUNCH20',
        type: 'PERCENT',
        value: 20,
        minCart: 0,
      });
      setPromoSuccess('20% DISCOUNT APPLIED');
    } else {
      setPromoError('INVALID PROMO CODE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-mono">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => toggleCart(false)}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md border-l border-[rgba(240,237,230,0.18)] bg-[#0a0a0a] text-[#F0EDE6] flex flex-col h-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgba(240,237,230,0.08)] px-4 py-6 sm:px-6">
            <h2 className="text-sm tracking-widest uppercase font-bold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#C8FF00]" /> Cart OPERATIONS
            </h2>
            <button
              onClick={() => toggleCart(false)}
              className="text-[#888880] hover:text-[#C8FF00] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-4xl text-[#444440]">Ø</span>
                <p className="text-xs uppercase tracking-widest text-[#888880]">
                  CART IS EMPTY.<br />YOUR REGRETS START HERE.
                </p>
                <button
                  onClick={() => toggleCart(false)}
                  className="brutalist-button text-xs py-2 px-6"
                >
                  BROWSE DROP
                </button>
              </div>
            ) : (
              <>
                {/* Free Shipping Progress */}
                <div className="bg-[#111111] border border-[rgba(240,237,230,0.08)] p-4 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span>
                      {subtotal >= 4000
                        ? '⚡ FREE SHIPPING UNLOCKED'
                        : `ADD ${formatINR(4000 - subtotal)} MORE FOR FREE SHIPPING`}
                    </span>
                    <span className="font-bold text-[#C8FF00]">{progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-[#1a1a1a] overflow-hidden">
                    <div
                      className="h-full bg-[#C8FF00] transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4 divide-y divide-[rgba(240,237,230,0.08)]">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                      <div className="h-20 w-16 bg-[#111111] border border-[rgba(240,237,230,0.08)] overflow-hidden flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white">
                            <h3 className="line-clamp-1">{item.name}</h3>
                            <span>{formatINR(item.price * item.quantity)}</span>
                          </div>
                          <p className="text-[9px] text-[#888880] uppercase mt-1">
                            SIZE: {item.size} | COLOR: {item.color}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-[rgba(240,237,230,0.18)]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:text-[#C8FF00] transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-[10px] font-bold text-[#F0EDE6] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:text-[#C8FF00] transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#888880] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* In-Cart Upsell */}
                <div className="border-t border-[rgba(240,237,230,0.08)] pt-4">
                  <h4 className="text-[10px] uppercase text-[#888880] tracking-widest mb-3">
                    RECOMMENDED GEAR Add-ons
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    <div className="bg-[#111111] border border-[rgba(240,237,230,0.08)] p-2 flex gap-3 min-w-[260px] items-center">
                      <img
                        src="https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=100&q=80"
                        alt="Upsell Item"
                        className="h-10 w-8 object-cover"
                      />
                      <div className="flex-grow">
                        <p className="text-[9px] font-bold uppercase text-white leading-none">
                          WARP DUST BEANIE
                        </p>
                        <p className="text-[9px] text-[#C8FF00] mt-1">{formatINR(1899)}</p>
                      </div>
                      <button
                        onClick={() => {
                          useCartStore.getState().addItem({
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
                        className="text-[9px] bg-white text-black font-extrabold px-2 py-1 uppercase tracking-wider hover:bg-[#C8FF00] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Calculations */}
          {items.length > 0 && (
            <div className="border-t border-[rgba(240,237,230,0.18)] bg-[#111111] px-4 py-6 sm:px-6 space-y-4">
              {/* Promo code field */}
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#888880]" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ENTER COUPON (LAUNCH20, UNHRD1000)"
                    className="w-full bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] outline-none text-[#F0EDE6] text-[10px] pl-9 pr-3 py-2.5 uppercase focus:border-[#C8FF00]"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold px-4 text-[10px] uppercase transition-colors"
                >
                  APPLY
                </button>
              </div>

              {promoError && <p className="text-[9px] text-red-500 font-bold uppercase">{promoError}</p>}
              {promoSuccess && <p className="text-[9px] text-[#C8FF00] font-bold uppercase">{promoSuccess}</p>}

              {/* Gift wrap add-on */}
              <div className="flex items-center justify-between border-y border-[rgba(240,237,230,0.08)] py-3">
                <span className="text-[10px] uppercase tracking-wider flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[#C8FF00]" /> ADD BRUTALIST GIFT PACKAGING (+₹99)
                </span>
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="accent-[#C8FF00] h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Subtotal, Discount, Shipping, Total */}
              <div className="space-y-1.5 text-[10px] uppercase tracking-wider">
                <div className="flex justify-between text-[#888880]">
                  <span>SUBTOTAL</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-[#C8FF00]">
                    <span>DISCOUNT ({appliedDiscount.code})</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                {giftWrap && (
                  <div className="flex justify-between text-[#888880]">
                    <span>GIFT PACKAGING</span>
                    <span>{formatINR(99)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#888880]">
                  <span>SHIPPING</span>
                  <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white pt-2 border-t border-[rgba(240,237,230,0.08)]">
                  <span>TOTAL ESTIMATE</span>
                  <span className="text-[#C8FF00]">{formatINR(total)}</span>
                </div>
              </div>

              {/* Checkout Link */}
              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 group transition-all duration-300 border border-[#C8FF00]"
              >
                PROCEED TO CHECKOUT <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
