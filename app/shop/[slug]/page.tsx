"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeatMeter } from "@/components/HeatMeter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { ShoppingCart, Minus, Plus } from "lucide-react";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const addItem = useCart((state) => state.addItem);

  if (!product) {
    notFound();
  }

  const handleAddToCart = async () => {
    setAddingToCart(true);
    // Simulate brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    setAddingToCart(false);
  };

  // Get related products (same category, exclude current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
                <Image
                  src={product.images[selectedImageIndex] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-crimson-600"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
                  {product.name}
                </h1>
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <HeatMeter level={product.heatLevel} size="lg" />
                </div>
                <p className="text-lg text-gray-600">
                  {product.description}
                </p>
              </div>

              {/* Flavor Notes */}
              {product.flavorNotes.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Flavor Notes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.flavorNotes.map((note) => (
                      <Badge key={note} variant="outline">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-900">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={addingToCart || !product.inStock}
                  >
                    {addingToCart ? (
                      "Adding..."
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    disabled={addingToCart || !product.inStock}
                    onClick={async () => {
                      await handleAddToCart();
                      window.location.href = "/checkout";
                    }}
                  >
                    {addingToCart ? (
                      "Processing..."
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </div>
                {!product.inStock && (
                  <p className="text-sm text-destructive">Out of stock</p>
                )}
              </div>

              {/* Accordion */}
              <Accordion type="single" className="w-full">
                {product.ingredients && (
                  <AccordionItem value="ingredients">
                    <AccordionTrigger value="ingredients">Ingredients</AccordionTrigger>
                    <AccordionContent value="ingredients">
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {product.ingredients.map((ingredient) => (
                          <li key={ingredient}>{ingredient}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.nutrition && (
                  <AccordionItem value="nutrition">
                    <AccordionTrigger value="nutrition">Nutrition</AccordionTrigger>
                    <AccordionContent value="nutrition">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong>Serving Size:</strong>{" "}
                          {product.nutrition.servingSize}
                        </p>
                        <p>
                          <strong>Calories:</strong> {product.nutrition.calories}
                        </p>
                        <p>
                          <strong>Total Fat:</strong>{" "}
                          {product.nutrition.totalFat}
                        </p>
                        <p>
                          <strong>Sodium:</strong> {product.nutrition.sodium}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="shipping">
                  <AccordionTrigger value="shipping">Shipping</AccordionTrigger>
                  <AccordionContent value="shipping">
                    <p className="text-sm text-muted-foreground">
                      Free shipping on orders over ৳5,000. Ships within 24 hours.
                      Estimated delivery: 3-5 business days.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="storage">
                  <AccordionTrigger value="storage">Storage</AccordionTrigger>
                  <AccordionContent value="storage">
                    <p className="text-sm text-muted-foreground">
                      Store in a cool, dry place. Refrigerate after opening.
                      Best consumed within 6 months of opening.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
                <h2 className="mb-8 font-display text-3xl font-bold text-gray-900">
                Pairs well with
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
