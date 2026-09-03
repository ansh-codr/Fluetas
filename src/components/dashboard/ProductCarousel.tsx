'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Bell, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { mockProducts, ProductItem } from '@/lib/mock/dashboardData';

export default function ProductCarousel() {
  const [filter, setFilter] = useState<'all' | 'upcoming'>('all');
  const [selectedUpcomingProduct, setSelectedUpcomingProduct] = useState<ProductItem | null>(null);
  const [optinSuccess, setOptinSuccess] = useState(false);
  const [optinEmail, setOptinEmail] = useState('yogesh@example.com');

  const filteredProducts = filter === 'all'
    ? mockProducts
    : mockProducts.filter(p => p.isUpcoming);

  const handleNotifyMe = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUpcomingProduct(product);
    setOptinSuccess(false);
  };

  const submitOptin = (e: React.FormEvent) => {
    e.preventDefault();
    setOptinSuccess(true);
    setTimeout(() => {
      setSelectedUpcomingProduct(null);
      setOptinSuccess(false);
    }, 2000);
  };

  return (
    <section className="w-full">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-3">
          <span className="section-title">EXPLORE FLUETAS</span>

          {/* Sub-row / Filter tabs */}
          <div className="flex items-center bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] rounded-lg p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[0.68rem] font-semibold rounded-md transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#12160F] font-bold shadow-sm'
                  : 'text-[#586151] hover:text-[#12160F]'
              }`}
            >
              All Formulations
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-2.5 py-1 text-[0.68rem] font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-[#2E6DA4] text-white shadow-sm'
                  : 'text-[#586151] hover:text-[#12160F]'
              }`}
            >
              <Sparkles size={11} />
              Upcoming (2)
            </button>
          </div>
        </div>

        <Link
          href="/products"
          className="text-[#2E7D32] text-xs font-semibold no-underline flex items-center gap-1 hover:underline self-end sm:self-auto"
        >
          View Full Store <ChevronRight size={14} />
        </Link>
      </div>

      {/* Horizontally Scrollable Product Row */}
      <div
        id="product-carousel"
        className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar"
      >
        {filteredProducts.map((product) => {
          const isUpcoming = product.isUpcoming;

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              onClick={(e) => {
                if (isUpcoming) handleNotifyMe(e, product);
              }}
              className={`
                relative rounded-2xl p-4 shrink-0 snap-center transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between
                w-[78vw] sm:w-[220px] lg:w-[230px] min-h-[190px] bg-white border border-[rgba(18,22,15,0.10)]
                ${isUpcoming
                  ? 'bg-[#F4F8FC] border-[#2E6DA4]/30'
                  : 'hover:-translate-y-1 hover:shadow-md hover:border-[#2E7D32]/40'
                }
              `}
            >
              {/* Card Header with Upcoming Pill Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{product.emoji}</span>
                    <span
                      className="font-['Outfit'] font-black text-base tracking-tight"
                      style={{ color: product.color || '#2E7D32' }}
                    >
                      {product.name}
                    </span>
                  </div>

                  {/* Upcoming Badge */}
                  {isUpcoming && (
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/30">
                      Upcoming
                    </span>
                  )}
                </div>

                <p className="text-[#12160F] text-xs font-semibold m-0 mb-1 leading-snug">
                  {product.tagline}
                </p>
                <p className="text-[#586151] text-[0.68rem] m-0 leading-relaxed line-clamp-2">
                  {product.subtext}
                </p>
              </div>

              {/* Card Footer / CTA */}
              <div className="mt-3 pt-2.5 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between">
                {isUpcoming ? (
                  <button
                    onClick={(e) => handleNotifyMe(e, product)}
                    className="flex items-center gap-1.5 text-[0.72rem] font-bold text-[#2E6DA4] hover:bg-[#2E6DA4]/15 bg-[#2E6DA4]/10 px-2.5 py-1 rounded-md border border-[#2E6DA4]/20 transition-all cursor-pointer"
                  >
                    <Bell size={12} />
                    Notify Me
                  </button>
                ) : (
                  <Link
                    href={`/products?product=${product.id}`}
                    className="text-xs font-bold no-underline flex items-center gap-1 hover:underline text-[#2E7D32]"
                  >
                    Explore Formula →
                  </Link>
                )}

                {product.price && (
                  <span className="text-[0.72rem] font-bold text-[#12160F]">
                    {product.price}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Product Intent Modal */}
      {selectedUpcomingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[rgba(18,22,15,0.12)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => setSelectedUpcomingProduct(null)}
              className="absolute top-4 right-4 text-[#586151] hover:text-[#12160F] p-1 rounded-lg hover:bg-[#F2F4EE] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#2E6DA4]/10 border border-[#2E6DA4]/20 flex items-center justify-center text-2xl">
                {selectedUpcomingProduct.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#12160F] m-0 font-['Outfit']">
                    {selectedUpcomingProduct.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20">
                    Pre-Launch
                  </span>
                </div>
                <p className="text-[#586151] text-xs m-0">
                  {selectedUpcomingProduct.tagline}
                </p>
              </div>
            </div>

            <p className="text-[#12160F] text-xs leading-relaxed mb-4 bg-[#F2F4EE] p-3 rounded-lg border border-[rgba(18,22,15,0.08)]">
              {selectedUpcomingProduct.subtext}
            </p>

            <div className="mb-4 text-xs text-[#2E6DA4] font-medium flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{selectedUpcomingProduct.launchDate ?? 'Coming in late 2026'}</span>
            </div>

            {optinSuccess ? (
              <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl p-3.5 flex items-center gap-2.5 text-[#2E7D32] text-xs font-semibold animate-fade-in">
                <CheckCircle2 size={18} />
                <span>You&apos;re on the VIP waitlist! We&apos;ll notify you on release.</span>
              </div>
            ) : (
              <form onSubmit={submitOptin} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[0.72rem] font-semibold text-[#586151] mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    required
                    value={optinEmail}
                    onChange={e => setOptinEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[rgba(18,22,15,0.15)] text-[#12160F] text-xs outline-none focus:border-[#2E6DA4]"
                    placeholder="Enter email to get early batch access..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell size={14} />
                  Notify Me When Available
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
