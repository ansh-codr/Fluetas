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
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            FLUETAS STORE & ORDERS
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Superfruit-infused functional formulas for cellular recovery, gut vitality, and athletic output.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#13161F] p-1 rounded-xl border border-[#1E2133] self-start sm:self-auto">
          <button
            onClick={() => setTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'shop'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-[#8B91B0] hover:text-white'
            }`}
          >
            <ShoppingBag size={14} />
            Shop Formulas
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'orders'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-[#8B91B0] hover:text-white'
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
            <div className="flex items-center gap-1.5 bg-[#13161F] p-1 rounded-xl border border-[#1E2133]">
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
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'text-[#8B91B0] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#8B91B0]">
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
                      ? 'border-[#38BDF8]/30 bg-[#111420]/90'
                      : 'hover:border-[#2A3050]'
                  }`}
                  style={{
                    backgroundColor: product.bgColor,
                  }}
                >
                  {/* Card Glow */}
                  <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none blur-2xl opacity-30"
                    style={{ background: product.color }}
                  />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{product.emoji}</span>
                        <div>
                          <h3
                            className="font-['Outfit'] font-black text-lg m-0"
                            style={{ color: product.accentColor }}
                          >
                            {product.name}
                          </h3>
                          {product.rating && (
                            <span className="flex items-center gap-1 text-[0.68rem] text-[#FBBF24] font-bold">
                              <Star size={11} fill="#FBBF24" /> {product.rating} (500+ Reviews)
                            </span>
                          )}
                        </div>
                      </div>

                      {isUpcoming ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                          In Stock
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-xs text-[#E8EAF6] m-0 mb-1 leading-snug">
                      {product.tagline}
                    </p>
                    <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
                      {product.subtext}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#E8EAF6]">
                      {product.price}
                    </span>

                    {isUpcoming ? (
                      <button
                        onClick={() => handleNotifyMe(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
              className="fluetas-card p-5 flex flex-col gap-4 hover:border-[#2A3050] transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2133]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0">
                      Order #{order.id}
                    </h3>
                    <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                      Placed on {order.date} · Tracking: {order.trackingId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    {order.status}
                  </span>
                  <span className="font-['Outfit'] text-sm font-bold text-[#E8EAF6]">
                    {order.total}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0B0D14] p-3 rounded-xl border border-[#1E2133]">
                    <span className="font-medium text-[#E8EAF6]">
                      {item.name} <span className="text-[#8B91B0]">× {item.qty}</span>
                    </span>
                    <strong className="text-[#E8EAF6]">{item.price}</strong>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#8B91B0] pt-1">
                <span>Delivered to registered home address on {order.deliveryDate}</span>
                <button
                  onClick={() => alert(`Tracking info for ${order.trackingId}`)}
                  className="text-[#10B981] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setSelectedUpcoming(null)}
              className="absolute top-4 right-4 text-[#8B91B0] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedUpcoming.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-[#E8EAF6] m-0 font-['Outfit']">
                  {selectedUpcoming.name}
                </h3>
                <p className="text-xs text-[#8B91B0] m-0">{selectedUpcoming.tagline}</p>
              </div>
            </div>

            <p className="text-xs text-[#E8EAF6] leading-relaxed mb-4 bg-[#0B0D14] p-3 rounded-lg border border-[#1E2133]">
              {selectedUpcoming.subtext}
            </p>

            {optinSuccess ? (
              <div className="bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl p-3.5 flex items-center gap-2.5 text-[#10B981] text-xs font-semibold">
                <CheckCircle2 size={18} />
                <span>You&apos;re on the VIP waitlist for {selectedUpcoming.name}!</span>
              </div>
            ) : (
              <button
                onClick={() => setOptinSuccess(true)}
                className="btn-primary w-full py-2.5 justify-center font-bold text-xs bg-gradient-to-r from-[#38BDF8] to-[#0284C7]"
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
