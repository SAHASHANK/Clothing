'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Users, MessageSquare, Tag, AlertTriangle, Play,
  Download, Plus, RefreshCw, Check, X, ShieldCheck, Mail, MessageCircle, GitBranch
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

// Static seed data for admin operations
const initialOrders = [
  { id: 'UNHRD-782451', user: 'Rohan Sharma', total: 4999, status: 'PENDING', date: 'MAY 30, 2026', phone: '+91 9876543210' },
  { id: 'UNHRD-542109', user: 'Shivam K.', total: 10997, status: 'PAID', date: 'MAY 29, 2026', phone: '+91 8765432109' },
  { id: 'UNHRD-910432', user: 'Priya M.', total: 2999, status: 'SHIPPED', date: 'MAY 28, 2026', phone: '+91 7654321098' },
  { id: 'UNHRD-110293', user: 'Anirudh G.', total: 7898, status: 'DELIVERED', date: 'MAY 25, 2026', phone: '+91 6543210987' }
];

const initialProducts = [
  { id: 'prod-1', name: 'NEBULA HEAVY HOODIE', category: 'HOODIES', price: 4999, stock: 63, drop: 'DROP_001_GRAVITY_ZERO' },
  { id: 'prod-2', name: 'ANTI-GRAVITY MESH TEE', category: 'TEES', price: 2999, stock: 70, drop: 'DROP_001_GRAVITY_ZERO' },
  { id: 'prod-3', name: 'WARP DUST BEANIE', category: 'ACCESSORIES', price: 1899, stock: 95, drop: 'DROP_001_GRAVITY_ZERO' }
];

const initialDiscounts = [
  { id: 'disc-1', code: 'LAUNCH20', type: 'PERCENT', value: 20, active: true, minCart: 0 },
  { id: 'disc-2', code: 'UNHRD1000', type: 'FLAT', value: 1000, active: true, minCart: 4000 }
];

const initialReviews = [
  { id: 'rev-1', product: 'NEBULA HEAVY HOODIE', user: 'Rohan Sharma', rating: 5, body: 'Hands down the heaviest hoodie I own. Quality is insane.', sentiment: 'POSITIVE', approved: true },
  { id: 'rev-2', product: 'ANTI-GRAVITY MESH TEE', user: 'Priya M.', rating: 4, body: 'Amazing fit, mesh is premium. Slight oversized fitting.', sentiment: 'POSITIVE', approved: true }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'fulfillment' | 'reviews' | 'discounts' | 'crm' | 'abtests'>('analytics');
  
  // Dynamic list states
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [discounts, setDiscounts] = useState<any[]>(initialDiscounts);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  
  // Form variables
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [newValue, setNewValue] = useState(0);
  const [newMin, setNewMin] = useState(0);

  // A/B test toggles
  const [abTests, setAbTests] = useState([
    { id: 'ab-1', name: 'Hero Segment Visual variant', target: 'Hero Canvas vs fallback video', winner: 'Hero Canvas (12.4% CV)', active: true }
  ]);

  // Load dynamic data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const orderRes = await fetch('/api/orders');
        if (orderRes.ok) setOrders(await orderRes.json());
      } catch (e) { console.warn('Failed to fetch orders'); }

      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const rawProds = await prodRes.json();
          setProducts(rawProds.map((p: any) => ({
            id: p.productId || p.id,
            name: p.name,
            category: p.category,
            price: p.price || p.basePrice,
            stock: p.sizes ? p.sizes.reduce((sum: number, s: any) => sum + s.stock, 0) : p.stock,
            drop: p.drop
          })));
        }
      } catch (e) { console.warn('Failed to fetch products'); }

      try {
        const discRes = await fetch('/api/discounts');
        if (discRes.ok) setDiscounts(await discRes.json());
      } catch (e) { console.warn('Failed to fetch discounts'); }

      try {
        const revRes = await fetch('/api/reviews');
        if (revRes.ok) setReviews(await revRes.json());
      } catch (e) { console.warn('Failed to fetch reviews'); }
    };
    loadData();
  }, []);

  // Actions
  const handleFulfillmentMove = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const handleReviewApproval = async (reviewId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved })
      });
      if (res.ok) {
        if (approved) {
          setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r));
        } else {
          setReviews(reviews.filter(r => r.id !== reviewId));
        }
      }
    } catch (err) {
      console.error('Failed to process review approval');
    }
  };

  const triggerMSG91Alert = (phone: string, orderId: string, status: string) => {
    alert(`⚡ [MSG91 WA PUSH] NOTIFIED CLIENT AT ${phone} THAT ORDER ${orderId} WAS UPDATED TO ${status}.`);
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode, type: newType, value: newValue, minCart: newMin })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDiscounts([...discounts, data.discount]);
          setNewCode('');
          setNewValue(0);
          setNewMin(0);
        }
      }
    } catch (err) {
      console.error('Failed to create discount');
    }
  };


  const exportCSV = (dataName: string) => {
    alert(`📥 exporting dataset: [unhrd_${dataName}_raw.csv] downloaded.`);
  };

  return (
    <div className="flex-grow flex bg-[#0a0a0a] text-[#F0EDE6] font-mono min-h-[calc(100vh-4rem)] select-none">
      
      {/* 1. Operations Left Sidebar */}
      <aside className="w-64 border-r border-[rgba(240,237,230,0.08)] bg-[#111] p-6 hidden md:block space-y-8">
        <div>
          <span className="text-[9px] tracking-[0.4em] text-[#C8FF00] uppercase font-bold">OPERATOR OPERATIONS</span>
          <h2 className="text-white font-display font-black text-xl mt-1.5 tracking-wider">UNHRD.LAB</h2>
        </div>

        <nav className="flex flex-col gap-2.5 text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'analytics' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Analytics Desk
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'products' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Products matrix
          </button>
          <button
            onClick={() => setActiveTab('fulfillment')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'fulfillment' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Fulfillment Board
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'reviews' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Reviews CRM
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'discounts' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <Tag className="h-4 w-4" /> Coupons Engine
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'crm' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" /> Customer CRM
          </button>
          <button
            onClick={() => setActiveTab('abtests')}
            className={`flex items-center gap-3 py-2 px-3 border transition-colors text-left uppercase ${
              activeTab === 'abtests' ? 'border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/5' : 'border-transparent text-[#888880] hover:text-white'
            }`}
          >
            <GitBranch className="h-4 w-4" /> A/B Split Desk
          </button>
        </nav>

        {/* Low-stock Warnings Widget */}
        <div className="border border-yellow-500/20 bg-yellow-950/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-yellow-500 font-bold text-[10px] uppercase">
            <AlertTriangle className="h-4 w-4" /> stock Alert
          </div>
          <p className="text-[9px] text-[#888880] uppercase">Nebula Heavy Hoodie XL is down to 3 items!</p>
        </div>
      </aside>

      {/* 2. Operations Main Panel View */}
      <main className="flex-grow p-8 sm:p-10 space-y-8 overflow-y-auto">
        
        {/* A. Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">Sales Analytics & Metrics</h3>
              <button
                onClick={() => exportCSV('sales_stats')}
                className="bg-[#111] hover:bg-[#C8FF00] hover:text-black border border-[rgba(240,237,230,0.18)] text-[9px] font-bold uppercase tracking-widest px-3 py-2 flex items-center gap-2 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> CSV BI Export
              </button>
            </div>

            {/* Top Cards metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-1">
                <span className="text-[9px] text-[#888880] uppercase">GROSS REVENUE</span>
                <p className="text-2xl font-bold text-white">{formatINR(245899)}</p>
                <span className="text-[8px] text-[#C8FF00] font-bold uppercase">⚡ +12% INCREASE FROM PREVIOUS DROP</span>
              </div>
              <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-1">
                <span className="text-[9px] text-[#888880] uppercase">CONVERSION RATE</span>
                <p className="text-2xl font-bold text-white">4.12%</p>
                <span className="text-[8px] text-[#C8FF00] font-bold uppercase">⚡ HIGHEST ON WIREFRAME HERO OPTION</span>
              </div>
              <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-1">
                <span className="text-[9px] text-[#888880] uppercase">CUSTOMER LTV INDEX</span>
                <p className="text-2xl font-bold text-white">{formatINR(7450)}</p>
                <span className="text-[8px] text-[#888880] uppercase">STREETWEAR LOYALTY RATE</span>
              </div>
            </div>

            {/* Funnel mapping */}
            <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-4">
              <h4 className="text-[10px] text-white uppercase tracking-widest font-bold">Conversion Pipeline Funnel</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[9px] uppercase text-[#888880] mb-1">
                    <span>1. Catalog Visits</span>
                    <span>12,450 Operators</span>
                  </div>
                  <div className="h-2 w-full bg-[#1a1a1a]">
                    <div className="h-full bg-white w-[100%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] uppercase text-[#888880] mb-1">
                    <span>2. Product Zoom Inspections</span>
                    <span>4,120 Operators (33% conversion)</span>
                  </div>
                  <div className="h-2 w-full bg-[#1a1a1a]">
                    <div className="h-full bg-[#888880] w-[33%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] uppercase text-[#888880] mb-1">
                    <span>3. Checkout Pipelines</span>
                    <span>980 Operators (7.8% conversion)</span>
                  </div>
                  <div className="h-2 w-full bg-[#1a1a1a]">
                    <div className="h-full bg-[#C8FF00] w-[7.8%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* LTV Cohort Retention Matrix */}
            <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-4">
              <h4 className="text-[10px] text-white uppercase tracking-widest font-bold">Cohort Retention Index (%)</h4>
              <table className="w-full text-left border-collapse border border-[rgba(240,237,230,0.08)] text-[9px] uppercase">
                <thead>
                  <tr className="bg-[#0a0a0a] text-[#888880]">
                    <th className="p-3 border border-[rgba(240,237,230,0.08)]">COHORT MONTH</th>
                    <th className="p-3 border border-[rgba(240,237,230,0.08)]">SIZE</th>
                    <th className="p-3 border border-[rgba(240,237,230,0.08)]">M1</th>
                    <th className="p-3 border border-[rgba(240,237,230,0.08)]">M2</th>
                    <th className="p-3 border border-[rgba(240,237,230,0.08)]">M3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)] text-white font-bold">MARCH Drop</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">240</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)] bg-[#C8FF00]/10 text-[#C8FF00]">100%</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">22%</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">15%</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)] text-white font-bold">APRIL Drop</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">310</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)] bg-[#C8FF00]/10 text-[#C8FF00]">100%</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">28%</td>
                    <td className="p-3 border border-[rgba(240,237,230,0.08)]">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* B. Product Matrix */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">System Catalog Catalog Matrix</h3>
              <button className="bg-[#C8FF00] text-black font-extrabold text-[10px] px-4 py-2 hover:bg-[#9abf00] flex items-center gap-1.5 uppercase transition-colors">
                <Plus className="h-4 w-4" /> Add Product Specifications
              </button>
            </div>

            <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[rgba(240,237,230,0.08)] text-[9px] uppercase">
                <thead>
                  <tr className="bg-[#0a0a0a] text-[#888880]">
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">ID</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">NAME</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">CATEGORY</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">PRICE</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">STOCK COUNT</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">SYSTEM Drop</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                      <td className="p-4 border border-[rgba(240,237,230,0.08)] text-white font-bold">{p.id}</td>
                      <td className="p-4 border border-[rgba(240,237,230,0.08)] text-white">{p.name}</td>
                      <td className="p-4 border border-[rgba(240,237,230,0.08)]">{p.category}</td>
                      <td className="p-4 border border-[rgba(240,237,230,0.08)] text-[#C8FF00] font-bold">{formatINR(p.price)}</td>
                      <td className="p-4 border border-[rgba(240,237,230,0.08)]">{p.stock}</td>
                      <td className="p-4 border border-[rgba(240,237,230,0.08)] text-[#888880]">{p.drop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* C. Fulfillment Board */}
        {activeTab === 'fulfillment' && (
          <div className="space-y-8">
            <div className="border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">Fulfillment Kanban Pipeline</h3>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((col) => {
                const colOrders = orders.filter(o => o.status === col);
                return (
                  <div key={col} className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-white border-b border-[rgba(240,237,230,0.08)] pb-2 flex justify-between uppercase">
                      <span>{col}</span>
                      <span className="text-[#C8FF00] bg-[#C8FF00]/10 px-2 border border-[#C8FF00]/20">{colOrders.length}</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {colOrders.length === 0 ? (
                        <p className="text-[8px] text-[#444440] uppercase py-8 text-center">Empty Stage</p>
                      ) : (
                        colOrders.map(o => {
                          const addressObj = (() => {
                            try {
                              return typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress;
                            } catch (e) {
                              return { name: o.user || 'Unknown', phone: o.phone || '' };
                            }
                          })();
                          const clientName = addressObj?.name || o.user || 'Unknown';
                          const clientPhone = addressObj?.phone || o.phone || '';

                          return (
                            <div key={o.id} className="bg-[#171717] border border-[rgba(240,237,230,0.18)] p-3 space-y-3 hover:border-[#C8FF00] transition-colors">
                              <div className="flex justify-between text-[9px] font-bold uppercase">
                                <span className="text-white">{o.id}</span>
                                <span className="text-[#C8FF00]">{formatINR(o.total)}</span>
                              </div>
                              <p className="text-[8px] text-[#888880] uppercase">Recipient: {clientName}</p>
                              
                              {/* Action Operations */}
                              <div className="flex gap-2 justify-between border-t border-[rgba(240,237,230,0.08)] pt-2.5">
                                {col === 'PENDING' && (
                                  <button
                                    onClick={() => handleFulfillmentMove(o.id, 'PAID')}
                                    className="text-[8px] bg-white text-black font-extrabold py-1 px-2 uppercase hover:bg-[#C8FF00] transition-colors"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                {col === 'PAID' && (
                                  <button
                                    onClick={() => {
                                      handleFulfillmentMove(o.id, 'SHIPPED');
                                      triggerMSG91Alert(clientPhone, o.id, 'SHIPPED');
                                    }}
                                    className="text-[8px] bg-white text-black font-extrabold py-1 px-2 uppercase hover:bg-[#C8FF00] transition-colors"
                                  >
                                    Mark Shipped
                                  </button>
                                )}
                                {col === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleFulfillmentMove(o.id, 'DELIVERED')}
                                    className="text-[8px] bg-[#C8FF00] text-black font-extrabold py-1 px-2 uppercase transition-colors"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => triggerMSG91Alert(clientPhone, o.id, o.status)}
                                  className="text-[#888880] hover:text-[#C8FF00] transition-colors"
                                  title="Send WhatsApp Update via MSG91"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* D. Reviews Management */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">Sentiment & Review Approvals</h3>
            </div>

            <div className="space-y-4 max-w-4xl">
              {reviews.map(r => (
                <div key={r.id} className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase">{r.product}</h4>
                      <p className="text-[8px] text-[#888880] uppercase mt-0.5">Author: {r.user} | rating: {r.rating}/5</p>
                    </div>
                    <span className="text-[8px] bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-2 py-0.5 font-bold uppercase">
                      Sentiment: {r.sentiment}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed uppercase text-[#888880]">{r.body}</p>
                  
                  <div className="flex gap-4 border-t border-[rgba(240,237,230,0.08)] pt-4">
                    {!r.approved ? (
                      <button
                        onClick={() => handleReviewApproval(r.id, true)}
                        className="text-[8px] bg-white text-black px-3 py-1 font-bold uppercase flex items-center gap-1 hover:bg-[#C8FF00] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve review
                      </button>
                    ) : (
                      <span className="text-[8px] text-[#C8FF00] font-bold uppercase py-1 px-3 border border-[#C8FF00]/20 bg-[#C8FF00]/10">APPROVED</span>
                    )}
                    <button
                      onClick={() => handleReviewApproval(r.id, false)}
                      className="text-[8px] border border-red-500/30 text-red-400 px-3 py-1 font-bold uppercase flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E. Discounts Engine */}
        {activeTab === 'discounts' && (
          <div className="space-y-8">
            <div className="border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">Discount Coupons Engine</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Creator Form */}
              <form onSubmit={handleCreateDiscount} className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-4 h-fit">
                <h4 className="text-[10px] text-white font-bold uppercase tracking-widest border-b border-[rgba(240,237,230,0.08)] pb-2">
                  Create coupon
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-[#888880] uppercase">COUPON CODE</label>
                    <input
                      type="text"
                      required
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="UNHRD50"
                      className="w-full brutalist-input text-xs uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-[#888880] uppercase">Type</label>
                      <select
                        value={newType}
                        onChange={(e: any) => setNewType(e.target.value)}
                        className="w-full brutalist-input text-xs bg-[#171717] outline-none border border-[rgba(240,237,230,0.18)]"
                      >
                        <option value="PERCENT">% Off</option>
                        <option value="FLAT">Flat ₹ Off</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-[#888880] uppercase">Value</label>
                      <input
                        type="number"
                        required
                        value={newValue}
                        onChange={(e) => setNewValue(Number(e.target.value))}
                        className="w-full brutalist-input text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-[#888880] uppercase">Min Cart Subtotal</label>
                    <input
                      type="number"
                      value={newMin}
                      onChange={(e) => setNewMin(Number(e.target.value))}
                      className="w-full brutalist-input text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full brutalist-button text-xs py-2 mt-4"
                >
                  ACtivate Coupon
                </button>
              </form>

              {/* Active Coupons list */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-[10px] text-white font-bold uppercase tracking-widest">Active System Coupons</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discounts.map(d => (
                    <div key={d.id} className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-4 flex justify-between items-center">
                      <div>
                        <span className="text-white text-xs font-bold">{d.code}</span>
                        <p className="text-[8px] text-[#888880] uppercase mt-0.5">
                          {d.type === 'PERCENT' ? `${d.value}% discount` : `₹${d.value} flat discount`}
                        </p>
                        <p className="text-[8px] text-[#888880] uppercase">Min order: {formatINR(d.minCart)}</p>
                      </div>
                      <span className="text-[8px] bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-2 py-0.5 font-bold uppercase">
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* F. CRM View */}
        {activeTab === 'crm' && (
          <div className="space-y-8">
            <div className="border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">Customer Relations (CRM)</h3>
            </div>

            <div className="bg-[#111] border border-[rgba(240,237,230,0.08)] overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[rgba(240,237,230,0.08)] text-[9px] uppercase">
                <thead>
                  <tr className="bg-[#0a0a0a] text-[#888880]">
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">NAME</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">EMAIL</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">ORDERS FILED</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">LTV METRIC</th>
                    <th className="p-4 border border-[rgba(240,237,230,0.08)]">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-[#1a1a1a]/40 transition-colors">
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-white font-bold">Rohan Sharma</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)]">customer@gmail.com</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)]">1 Order</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-[#C8FF00] font-bold">{formatINR(4999)}</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-yellow-500 font-bold">2FA DISABLED</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40 transition-colors">
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-white font-bold">Shivam K.</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)]">shivam@unhrd.lab</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)]">1 Order</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-[#C8FF00] font-bold">{formatINR(10997)}</td>
                    <td className="p-4 border border-[rgba(240,237,230,0.08)] text-[#C8FF00] font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> 2FA ENFORCED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* G. A/B Tests */}
        {activeTab === 'abtests' && (
          <div className="space-y-8">
            <div className="border-b border-[rgba(240,237,230,0.08)] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C8FF00]">A/B Test Optimization Hub</h3>
            </div>

            <div className="space-y-4 max-w-4xl">
              {abTests.map(test => (
                <div key={test.id} className="bg-[#111] border border-[rgba(240,237,230,0.08)] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase">{test.name}</h4>
                      <p className="text-[8px] text-[#888880] uppercase mt-0.5">Specifications: {test.target}</p>
                    </div>
                    <span className="text-[8px] bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-2 py-0.5 font-bold uppercase">
                      ACTIVE RUN
                    </span>
                  </div>
                  
                  <div className="p-4 bg-[#0a0a0a] border border-[rgba(240,237,230,0.08)] text-[9px] space-y-1">
                    <span className="text-[#888880] uppercase">CURRENT TRAFFIC winner:</span>
                    <p className="text-[#C8FF00] font-extrabold uppercase">{test.winner}</p>
                  </div>
                  
                  <div className="flex gap-4 border-t border-[rgba(240,237,230,0.08)] pt-4">
                    <button className="text-[8px] bg-white text-black px-3 py-1 font-bold uppercase flex items-center gap-1 hover:bg-[#C8FF00] transition-colors">
                      <Play className="h-3.5 w-3.5" /> Toggle visual variant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      
    </div>
  );
}
