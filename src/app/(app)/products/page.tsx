'use client';

import React, { useState } from 'react';
import { mockProducts, mockOrders, ProductItem } from '@/lib/mock/dashboardData';
import {
  ShoppingBag,
  Package,
  Sparkles,
  Bell,
  Star,
  CheckCircle2,
  Truck,
  X,
  ExternalLink,
} from 'lucide-react';

export default function ProductsOrdersPage() {
  const [tab, setTab] = useState<'shop' | 'orders'>('shop');
  const [shopFilter, setShopFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [selectedUpcoming, setSelectedUpcoming] = useState<ProductItem | null>(null);
  const [optinSuccess, setOptinSuccess] = useState(false);

  const filteredProducts = mockProducts.filter(p => {
    if (shopFilter === 'live') return !p.isUpcoming;
    if (shopFilter === 'upcoming') return p.isUpcoming;
    return true;
  });

  const handleNotifyMe = (product: ProductItem) => {
    setSelectedUpcoming(product);
    setOptinSuccess(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            FLUETAS STORE & ORDERS
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Superfruit-infused functional formulas for cellular recovery, gut vitality, and athletic output.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F2F4EE] p-1 rounded-xl border border-[rgba(18,22,15,0.10)] self-start sm:self-auto">
          <button
            onClick={() => setTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'shop'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#586151] hover:text-[#12160F]'
            }`}
          >
            <ShoppingBag size={14} />
            Shop Formulas
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'orders'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#586151] hover:text-[#12160F]'
            }`}
          >
            <Package size={14} />
            My Orders ({mockOrders.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: SHOP ─────────────────────────────────────────────────── */}
      {tab === 'shop' && (
        <div className="flex flex-col gap-4">
          {/* Filter Sub-row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#F2F4EE] p-1 rounded-xl border border-[rgba(18,22,15,0.10)]">
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'live', label: 'In Stock & Available' },
                { id: 'upcoming', label: 'Upcoming Pre-Launch' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setShopFilter(f.id as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    shopFilter === f.id
                      ? 'bg-white text-[#12160F] font-bold shadow-sm'
                      : 'text-[#586151] hover:text-[#12160F]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#586151]">
              Showing {filteredProducts.length} Formulations
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const isUpcoming = product.isUpcoming;

              return (
                <div
                  key={product.id}
                  className={`fluetas-card p-5 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                    isUpcoming
                      ? 'border-[#2E6DA4]/30 bg-[#F4F8FC]'
                      : 'hover:shadow-md hover:border-[#2E7D32]/40'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{product.emoji}</span>
                        <div>
                          <h3
                            className="font-['Outfit'] font-black text-lg m-0"
                            style={{ color: product.color || '#2E7D32' }}
                          >
                            {product.name}
                          </h3>
                          {product.rating && (
                            <span className="flex items-center gap-1 text-[0.68rem] text-[#D97706] font-bold">
                              <Star size={11} fill="#D97706" /> {product.rating} (500+ Reviews)
                            </span>
                          )}
                        </div>
                      </div>

                      {isUpcoming ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/30">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                          In Stock
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-xs text-[#12160F] m-0 mb-1 leading-snug">
                      {product.tagline}
                    </p>
                    <p className="text-xs text-[#586151] m-0 leading-relaxed">
                      {product.subtext}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#12160F]">
                      {product.price}
                    </span>

                    {isUpcoming ? (
                      <button
                        onClick={() => handleNotifyMe(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#2E6DA4]/10 hover:bg-[#2E6DA4]/20 text-[#2E6DA4] border border-[#2E6DA4]/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Bell size={12} />
                        Notify Me
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Added ${product.name} to cart!`)}
                        className="btn-primary py-1.5 px-4 text-xs font-bold cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MY ORDERS ────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="flex flex-col gap-4">
          {mockOrders.map(order => (
            <div
              key={order.id}
              className="fluetas-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(18,22,15,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                      Order #{order.id}
                    </h3>
                    <p className="text-xs text-[#586151] m-0 mt-0.5">
                      Placed on {order.date} · Tracking: {order.trackingId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                    {order.status}
                  </span>
                  <span className="font-['Outfit'] text-sm font-bold text-[#12160F]">
                    {order.total}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#F2F4EE] p-3 rounded-xl border border-[rgba(18,22,15,0.06)]">
                    <span className="font-medium text-[#12160F]">
                      {item.name} <span className="text-[#586151]">× {item.qty}</span>
                    </span>
                    <strong className="text-[#12160F]">{item.price}</strong>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#586151] pt-1">
                <span>Delivered to registered home address on {order.deliveryDate}</span>
                <button
                  onClick={() => alert(`Tracking info for ${order.trackingId}`)}
                  className="text-[#2E7D32] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View Invoice & Tracking <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Waitlist Modal */}
      {selectedUpcoming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[rgba(18,22,15,0.12)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setSelectedUpcoming(null)}
              className="absolute top-4 right-4 text-[#586151] hover:text-[#12160F]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedUpcoming.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-[#12160F] m-0 font-['Outfit']">
                  {selectedUpcoming.name}
                </h3>
                <p className="text-xs text-[#586151] m-0">{selectedUpcoming.tagline}</p>
              </div>
            </div>

            <p className="text-xs text-[#12160F] leading-relaxed mb-4 bg-[#F2F4EE] p-3 rounded-lg border border-[rgba(18,22,15,0.08)]">
              {selectedUpcoming.subtext}
            </p>

            {optinSuccess ? (
              <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl p-3.5 flex items-center gap-2.5 text-[#2E7D32] text-xs font-semibold">
                <CheckCircle2 size={18} />
                <span>You&apos;re on the VIP waitlist for {selectedUpcoming.name}!</span>
              </div>
            ) : (
              <button
                onClick={() => setOptinSuccess(true)}
                className="btn-primary w-full py-2.5 justify-center font-bold text-xs"
              >
                Join VIP Early Batch Waitlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
