"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SectionContainer } from "@/components/SectionContainer";
import { Product } from "@/data/products";

const productGridClassName =
  "grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:gap-4 lg:gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))] [&>*]:min-h-0 [&>*]:h-full [&>*]:min-w-0";

interface ProductGridProps {
  products?: Product[];
}

export function ProductGrid({ products = [] }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState("bestsellers");

  const bestSellers = products.filter((p) => p.isBestSeller === true);
  const newProducts = products.filter((p) => p.isNew === true);
  const bundles = products.filter((p) => p.isBundle === true);

  const tabs = [
    { id: "bestsellers", label: "Best Sellers" },
    { id: "new", label: "New" },
    { id: "bundles", label: "Bundles" },
  ];

  return (
    <SectionContainer className="!py-10 md:!py-14 lg:!py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          Our Products
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          Handcrafted with premium ingredients
        </p>
      </div>

      {/* Flat rounded solid togglers */}
      <div className="mb-4 flex justify-center md:mb-5">
        <div className="inline-flex rounded-full border border-black/10 bg-white/80 p-0.5 shadow-sm sm:p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 sm:px-5 sm:py-2 sm:text-sm ${
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

      {activeTab === "bestsellers" && (
        <div className={productGridClassName}>
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {activeTab === "new" && (
        <div className={productGridClassName}>
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {activeTab === "bundles" && (
        <div className={productGridClassName}>
          {bundles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
