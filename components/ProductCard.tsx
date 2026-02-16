"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { HeatMeter } from "@/components/HeatMeter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      image: product.image,
    });
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-black/10 border-black/10">
        <Link href={`/shop/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.originalPrice && (
              <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--primary))] px-2 py-1 text-xs font-bold text-white">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
              }}
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </Link>
        <CardContent className="p-4">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="mb-2 font-display text-lg font-semibold text-[hsl(var(--text-primary))] transition-colors hover:text-[hsl(var(--primary))]">
              {product.name}
            </h3>
          </Link>
          <div className="mb-3">
            <HeatMeter level={product.heatLevel} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-[hsl(var(--text-primary))]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-sm text-[hsl(var(--text-muted))] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="flex-shrink-0"
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
