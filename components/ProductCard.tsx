"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { HeatMeter } from "@/components/HeatMeter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { imageSrcForNext } from "@/lib/media-url";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  /** Shorter image + tighter padding for dense grids (e.g. homepage products). */
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    // Simulate brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageSrcForNext(product.image),
    });
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border-black/10 transition-all hover:shadow-xl hover:shadow-black/10">
        <Link href={`/shop/${product.slug}`} className="block shrink-0">
          <div
            className={cn(
              "relative overflow-hidden bg-gray-100",
              compact ? "aspect-[4/3]" : "aspect-square"
            )}
          >
            <Image
              src={imageSrcForNext(product.image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.originalPrice && (
              <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--primary))] px-2 py-1 text-xs font-bold text-white">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
          </div>
        </Link>
        <CardContent
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            compact ? "p-2 sm:p-2.5" : "p-2.5 sm:p-4"
          )}
        >
          <Link href={`/shop/${product.slug}`} className="shrink-0">
            <h3
              className={cn(
                "line-clamp-2 font-display font-semibold leading-snug text-[hsl(var(--text-primary))] transition-colors hover:text-[hsl(var(--primary))]",
                compact
                  ? "mb-1 text-[11px] leading-tight sm:text-xs"
                  : "mb-1 text-xs sm:mb-1.5 sm:text-sm"
              )}
            >
              {product.name}
            </h3>
          </Link>
          <div className={cn("shrink-0", compact ? "mb-1" : "mb-2")}>
            <HeatMeter level={product.heatLevel} size="sm" />
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div>
              <span
                className={cn(
                  "font-bold text-[hsl(var(--text-primary))]",
                  compact ? "text-sm sm:text-base" : "text-base sm:text-xl"
                )}
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-1 text-xs text-[hsl(var(--text-muted))] line-through sm:ml-2 sm:text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="h-8 flex-shrink-0 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
              disabled={adding || !product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {adding ? (
                "Adding..."
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
