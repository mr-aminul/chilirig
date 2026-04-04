"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionContainer } from "@/components/SectionContainer";
import { Input } from "@/components/ui/input";
import { Product } from "@/data/products";
import { Search, Filter, ChevronDown } from "lucide-react";
import { fetchApiJson } from "@/lib/fetch-api";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHeatLevel, setSelectedHeatLevel] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const sortOptions = useMemo(
    () =>
      [
        { value: "featured", label: "Featured" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "newest", label: "Newest" },
      ] as const,
    []
  );

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      ) {
        setSortOpen(false);
      }
    };
    if (sortOpen) {
      document.addEventListener("pointerdown", onPointerDown);
    }
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sortOpen]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchApiJson<{ success: boolean; data?: Product[] }>("/api/products");
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

  const filteredProducts = useMemo(() => {
    let filtered =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.category === selectedCategory);

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
  }, [products, searchQuery, selectedCategory, selectedHeatLevel, sortBy]);

  return (
    <>
      <Header />
      <main>
        <SectionContainer innerClassName="mx-auto w-full max-w-full sm:max-w-[80vw]">
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
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted md:hidden",
                  showFilters && "border-foreground/20 bg-muted"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <div className="relative min-w-[10rem] flex-1 sm:min-w-[12rem]" ref={sortMenuRef}>
                <button
                  type="button"
                  aria-expanded={sortOpen}
                  aria-haspopup="listbox"
                  onClick={() => setSortOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted",
                    sortOpen && "border-foreground/20 bg-muted"
                  )}
                >
                  <span className="truncate">
                    {sortOptions.find((o) => o.value === sortBy)?.label ??
                      "Sort"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      sortOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                {sortOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-full min-w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-black/5"
                    role="listbox"
                  >
                    <div className="flex flex-col space-y-1 p-2">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={sortBy === opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className={cn(
                            "rounded-lg px-4 py-2 text-left text-sm font-medium text-black transition-colors duration-200",
                            sortBy === opt.value
                              ? "bg-gray-100"
                              : "hover:bg-gray-100"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <aside
              className={cn(
                "min-w-0",
                showFilters
                  ? "grid grid-cols-2 gap-3 lg:block lg:space-y-6"
                  : "hidden lg:block lg:space-y-6"
              )}
            >
              <div className="min-w-0">
                <h3 className="mb-2 text-xs font-semibold text-gray-900 lg:mb-4 lg:text-base">
                  Category
                </h3>
                <div className="space-y-1 lg:space-y-2">
                  {[
                    { value: "all", label: "All Products" },
                    { value: "original", label: "Original Recipe" },
                    { value: "beef", label: "Beef Chili Oil" },
                    { value: "gift-set", label: "Gift Sets" },
                  ].map((cat) => (
                    <label
                      key={cat.value}
                      className="flex cursor-pointer items-start gap-1.5 text-[11px] leading-tight text-gray-600 lg:items-center lg:gap-2 lg:text-sm lg:leading-normal"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={selectedCategory === cat.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-crimson-600 lg:mt-0 lg:h-4 lg:w-4"
                      />
                      <span className="min-w-0">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="mb-2 text-xs font-semibold text-gray-900 lg:mb-4 lg:text-base">
                  Heat Level
                </h3>
                <div className="space-y-1 lg:space-y-2">
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
                      className="flex cursor-pointer items-start gap-1.5 text-[11px] leading-tight text-gray-600 lg:items-center lg:gap-2 lg:text-sm lg:leading-normal"
                    >
                      <input
                        type="radio"
                        name="heat"
                        checked={selectedHeatLevel === option.level}
                        onChange={() => setSelectedHeatLevel(option.level)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-crimson-600 lg:mt-0 lg:h-4 lg:w-4"
                      />
                      <span className="min-w-0">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-6 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))] [&>*]:min-h-0 [&>*]:h-full [&>*]:min-w-0">
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

