import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[rgba(240,237,230,0.08)] text-xs font-mono text-[#888880] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Stack Info */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-3">
            <div className="bg-[#F0EDE6] text-[#0a0a0a] px-2 py-1 flex flex-col items-center justify-center font-bold tracking-tighter leading-none border border-[#F0EDE6] select-none">
              <span className="text-[10px] tracking-[0.2em] font-extrabold -mb-0.5">N</span>
              <span className="text-[12px] tracking-[0.1em] font-black -my-0.5">HR</span>
              <span className="text-[10px] tracking-[0.15em] font-extrabold -mt-0.5">D.</span>
            </div>
            <span className="font-extrabold tracking-widest text-[#F0EDE6] text-sm">UNHRD.LAB</span>
          </div>
          <p className="text-[10px] leading-relaxed max-w-xs uppercase">
            PREMIUM LIMITED-DROP STREETWEAR ENGINEERED IN INDIA. NO COPIES. NO OVERPRODUCTION.
          </p>
        </div>

        {/* Drops and Alerts */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white tracking-widest uppercase font-bold text-[10px]">DROP ALERTS</h4>
          <p className="text-[10px] uppercase">Subscribe to be notified 15 minutes before the next release drop.</p>
          <div className="flex max-w-xs">
            <input
              type="email"
              placeholder="ENTER EMAIL"
              className="bg-[#111111] border border-[rgba(240,237,230,0.18)] focus:border-[#C8FF00] outline-none text-[#F0EDE6] text-[10px] px-3 py-2 flex-grow uppercase"
            />
            <button className="bg-[#C8FF00] hover:bg-[#9abf00] text-black font-extrabold px-4 text-[10px] tracking-wider transition-colors duration-200">
              JOIN
            </button>
          </div>
        </div>

        {/* System Pages */}
        <div className="flex flex-col gap-2">
          <h4 className="text-white tracking-widest uppercase font-bold text-[10px]">SYSTEM NAVIGATION</h4>
          <Link href="/catalog" className="hover:text-white transition-colors uppercase">Catalog / Drop 001</Link>
          <Link href="/login" className="hover:text-white transition-colors uppercase">Account Access</Link>
          <Link href="/admin" className="hover:text-white transition-colors uppercase">System Operations</Link>
        </div>

        {/* Support info */}
        <div className="flex flex-col gap-2">
          <h4 className="text-white tracking-widest uppercase font-bold text-[10px]">CUSTOMER INTERFACES</h4>
          <a href="#" className="hover:text-white transition-colors uppercase">Shipping & Return RMAs</a>
          <a href="#" className="hover:text-white transition-colors uppercase">GST Invoice Verification</a>
          <a href="#" className="hover:text-white transition-colors uppercase">Technical Support</a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-[rgba(240,237,230,0.04)] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[10px] uppercase">
          &copy; {new Date().getFullYear()} UNHRD.LAB. ALL RIGHTS RESERVED.
        </span>
        <span className="text-[10px] text-white tracking-widest font-extrabold uppercase animate-pulse">
          NO RESTOCKS. NO REGRETS.
        </span>
      </div>
    </footer>
  );
}
