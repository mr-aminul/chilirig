"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SectionContainer } from "@/components/SectionContainer";
import { Product } from "@/data/products";
import { getCachedApiJson } from "@/lib/api-cache";

export function ProductGrid() {
  const [activeTab, setActiveTab] = useState("bestsellers");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await getCachedApiJson<{ success: boolean; data?: Product[] }>(
          "/api/products",
          { ttlMs: 10 * 60 * 1000 }
        );
        if (result.success) {
          setProducts(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller === true);
  const newProducts = products.filter((p) => p.isNew === true);
  const bundles = products.filter((p) => p.isBundle === true);

  const tabs = [
    { id: "bestsellers", label: "Best Sellers" },
    { id: "new", label: "New" },
    { id: "bundles", label: "Bundles" },
  ];

  return (
    <SectionContainer className="!py-6 md:!py-8 lg:!py-10">
      <div className="mb-5 text-center md:mb-6">
        <h2 className="mb-1.5 font-display text-2xl font-bold text-[hsl(var(--text-primary))] sm:mb-2 sm:text-3xl lg:text-3xl">
          Our Products
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] md:text-base">
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

      {/* Content */}
      {loading && (
        <div className="py-4 text-center text-sm text-[hsl(var(--text-secondary))] md:py-6">
          Loading products...
        </div>
      )}
      {!loading && activeTab === "bestsellers" && (
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 [&>*]:min-h-0 [&>*]:h-full [&>*]:min-w-0">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}

      {!loading && activeTab === "new" && (
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 [&>*]:min-h-0 [&>*]:h-full [&>*]:min-w-0">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}

      {!loading && activeTab === "bundles" && (
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 [&>*]:min-h-0 [&>*]:h-full [&>*]:min-w-0">
          {bundles.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
