"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionContainer } from "@/components/SectionContainer";
import { Input } from "@/components/ui/input";
import { products, getProductsByCategory } from "@/data/products";
import { Search, Filter } from "lucide-react";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHeatLevel, setSelectedHeatLevel] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = getProductsByCategory(selectedCategory);

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedHeatLevel !== null) {
      filtered = filtered.filter((p) => p.heatLevel === selectedHeatLevel);
    }

    // Sort
    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedHeatLevel, sortBy]);

  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-8">
            <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
              Shop
            </h1>
            <p className="text-gray-600">
              Find your perfect heat level and flavor profile
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted md:hidden"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } space-y-6 lg:block`}
            >
              <div>
                <h3 className="mb-4 font-semibold text-gray-900">Category</h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Products" },
                    { value: "original", label: "Original Recipe" },
                    { value: "beef", label: "Beef Chili Oil" },
                    { value: "gift-set", label: "Gift Sets" },
                  ].map((cat) => (
                    <label
                      key={cat.value}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={selectedCategory === cat.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 accent-crimson-600"
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-gray-900">Heat Level</h3>
                <div className="space-y-2">
                  {[
                    { level: null, label: "All Levels" },
                    { level: 1, label: "Mild" },
                    { level: 2, label: "Medium" },
                    { level: 3, label: "Hot" },
                    { level: 4, label: "Very Hot" },
                    { level: 5, label: "Extreme" },
                  ].map((option) => (
                    <label
                      key={option.label}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <input
                        type="radio"
                        name="heat"
                        checked={selectedHeatLevel === option.level}
                        onChange={() => setSelectedHeatLevel(option.level)}
                        className="h-4 w-4 accent-crimson-600"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-600">
                    No products found. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

