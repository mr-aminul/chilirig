"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SectionContainer } from "@/components/SectionContainer";
import {
  getBestSellers,
  getNewProducts,
  getBundles,
} from "@/data/products";

export function ProductGrid() {
  const [activeTab, setActiveTab] = useState("bestsellers");

  const bestSellers = getBestSellers();
  const newProducts = getNewProducts();
  const bundles = getBundles();

  const tabs = [
    { id: "bestsellers", label: "Best Sellers" },
    { id: "new", label: "New" },
    { id: "bundles", label: "Bundles" },
  ];

  return (
    <SectionContainer>
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          Our Products
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          Handcrafted with premium ingredients
        </p>
      </div>

      {/* Flat rounded solid togglers */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-white/80 border border-black/10 p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[hsl(var(--primary))] text-white shadow-md"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "bestsellers" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {activeTab === "new" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {activeTab === "bundles" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bundles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
