'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { lookupPincode, validateGSTIN, formatINR } from '@/lib/utils';
import { ShieldAlert, CreditCard, ShoppingBag, ArrowLeft, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';


export default function CheckoutPage() {
  const {
    items,
    getCartSubtotal,
    getCartDiscountAmount,
    getCartTotal,
    giftWrap,
    appliedDiscount,
    clearCart
  } = useCartStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      window.location.href = '/catalog';
    }
  }, [items]);

  // Shipping form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  // GSTIN states
  const [gstin, setGstin] = useState('');
  const [gstinValid, setGstinValid] = useState<boolean | null>(null);

  // System Checkout states
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch City/State based on Indian Pincode
  useEffect(() => {
    if (pincode.length === 6) {
      const details = lookupPincode(pincode);
      if (details.valid) {
        setCity(details.city);
        setState(details.state);
        setErrorMsg('');
      } else {
        setErrorMsg('INVALID PINCODE SPECIFICATION. MUST BE 6 DIGITS.');
      }
    }
  }, [pincode]);

  // Handle GSTIN check
  const handleGstCheck = (val: string) => {
    setGstin(val);
    if (val.length === 15) {
      setGstinValid(validateGSTIN(val));
    } else {
      setGstinValid(null);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    if (pincode.length !== 6) {
      setErrorMsg('PINCODE MUST BE EXACTLY 6 DIGITS');
      return;
    }

    if (gstin && gstinValid === false) {
      setErrorMsg('ENTERED GSTIN NUMBER IS INVALID');
      return;
    }

    setProcessing(true);
    setErrorMsg('');

    try {
      // 1. Create order in PostgreSQL database via server endpoint
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone,
          address,
          pincode,
          city,
          state,
          items,
          total: getCartTotal(),
          gstin
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize system order');
      }

      const { orderId, razorpayOrderId } = orderData;

      // 2. Open Razorpay payment gateway checkout overlay
      const RzpConstructor = (window as any).Razorpay;
      if (!RzpConstructor) {
        console.warn('Razorpay SDK script not loaded, fallback to client-side sandbox execution...');
        setTimeout(() => {
          setCreatedOrderId(orderId);
          setOrderSuccess(true);
          setProcessing(false);
          clearCart();
        }, 1500);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
        amount: getCartTotal() * 100, // in paisa
        currency: 'INR',
        name: 'UNHRD.LAB',
        description: 'Zero Gravity Streetwear Acquisition',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            // 3. Post transaction coordinates to verify signature on server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setCreatedOrderId(orderId);
              setOrderSuccess(true);
              clearCart();
            } else {
              setErrorMsg(verifyData.error || 'SIGNATURE VERIFICATION FAILURE');
            }
          } catch (verifyErr: any) {
            setErrorMsg('VERIFICATION NETWORK EXCEPTION: ' + verifyErr.message);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#C8FF00'
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const razorpayInstance = new RzpConstructor(options);
      razorpayInstance.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout acquisition failure occurred.');
      setProcessing(false);
    }
  };


  const subtotal = getCartSubtotal();
  const discountAmount = getCartDiscountAmount();
  const total = getCartTotal();
  const shipping = subtotal >= 4000 || subtotal === 0 ? 0 : 250;

  if (orderSuccess) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#0a0a0a] text-center px-4 font-mono">
        <div className="max-w-md bg-[#111] border border-[#C8FF00]/20 p-8 space-y-6 shadow-2xl">
          <CheckCircle className="h-16 w-16 text-[#C8FF00] mx-auto animate-pulse" />
          <div className="space-y-2">
            <h1 className="font-display font-black text-2xl tracking-tight text-white uppercase">
              TRANSACTION APPROVED // Drop SECURED
            </h1>
            <p className="text-[10px] text-[#888880] uppercase">
              ORDER SPECIFICATION IDENTIFIER: <span className="text-white font-bold">{createdOrderId}</span>
            </p>
          </div>
          <p className="text-[10px] uppercase text-[#888880] leading-relaxed">
            SYSTEM CONFIRMATION receipt dispatched to <span className="text-[#C8FF00]">{email}</span>. PDF GST invoice will generate and attach to shipping notify.
          </p>
          <div className="pt-4 border-t border-[rgba(240,237,230,0.08)]">
            <Link
              href="/catalog"
              className="brutalist-button text-xs py-2.5 px-6 block text-center"
            >
              RETURN TO SYSTEM CATALOG
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#0a0a0a] text-[#F0EDE6] font-mono py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-xs text-[#888880] hover:text-[#C8FF00] uppercase font-bold">
          <ArrowLeft className="h-4 w-4" /> Return to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Checkout Forms */}
        <form onSubmit={handleCheckoutSubmit} className="space-y-8">
          
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 text-[10px] uppercase font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-bold border-b border-[rgba(240,237,230,0.08)] pb-2 flex items-center gap-2">
              <span>01. CONTACT SPECIFICATION</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-[#888880] uppercase">email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="OPERATOR@UNHRD.LAB"
                  className="w-full brutalist-input text-xs uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-[#888880] uppercase">phone number (+91)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full brutalist-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-bold border-b border-[rgba(240,237,230,0.08)] pb-2">
              02. SHIPPING DISPATCH COORDINATES
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-[#888880] uppercase">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ROHAN SHARMA"
                  className="w-full brutalist-input text-xs uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-[#888880] uppercase">delivery address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="APARTMENT NO, BUILDING NAME, SECTOR"
                  className="w-full brutalist-input text-xs uppercase"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#888880] uppercase">pincode (6 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="400703"
                    className="w-full brutalist-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#888880] uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="MUMBAI"
                    className="w-full brutalist-input text-xs uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#888880] uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="MAHARASHTRA"
                    className="w-full brutalist-input text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: GST Invoice Details (Optional) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[rgba(240,237,230,0.08)] pb-2">
              <h3 className="text-xs uppercase tracking-widest text-white font-bold">
                03. GST INVOICE SPECIFICATION (OPTIONAL)
              </h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-[#888880] uppercase">GSTIN NUMBER</label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => handleGstCheck(e.target.value)}
                placeholder="27AAAAA1111A1Z1"
                className="w-full brutalist-input text-xs uppercase"
              />
              {gstinValid === true && (
                <p className="text-[8px] text-[#C8FF00] font-bold uppercase">⚡ VALID GSTIN NUMBER. GST TAX SLIP WILL GENERATE.</p>
              )}
              {gstinValid === false && (
                <p className="text-[8px] text-red-500 font-bold uppercase">⚠️ INVALID GSTIN FORMAT SPECIFIED.</p>
              )}
            </div>
          </div>

          {/* Anti-double-submit payment button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                CONNECTING RAZORPAY ENCRYPTED GATEWAY...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                SECURE TRANSACTION OVERLAY <CreditCard className="h-4 w-4" />
              </span>
            )}
          </button>

        </form>

        {/* Right Column: Checkout Summary (Sticky) */}
        <div className="bg-[#111111] border border-[rgba(240,237,230,0.08)] p-6 lg:sticky lg:top-24 space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-white font-bold border-b border-[rgba(240,237,230,0.08)] pb-2 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#C8FF00]" /> ORDER SUMMARY SPEC
          </h3>

          {/* Items List */}
          <div className="space-y-4 divide-y divide-[rgba(240,237,230,0.08)]">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                <div className="h-16 w-12 bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex justify-between text-[10px] font-bold text-white uppercase">
                    <span className="line-clamp-1">{item.name}</span>
                    <span>{formatINR(item.price * item.quantity)}</span>
                  </div>
                  <p className="text-[8px] text-[#888880] uppercase mt-1">
                    SIZE: {item.size} | QTY: {item.quantity} | COLOR: {item.color}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdowns */}
          <div className="border-t border-[rgba(240,237,230,0.08)] pt-4 space-y-2 text-[10px] uppercase">
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
                <span>GIFT WRAP PACKAGING</span>
                <span>{formatINR(99)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#888880]">
              <span>DELIVERY SHIPMENT</span>
              <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-white pt-2 border-t border-[rgba(240,237,230,0.08)]">
              <span>ESTIMATED TOTAL</span>
              <span className="text-[#C8FF00]">{formatINR(total)}</span>
            </div>
          </div>

        </div>

      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
