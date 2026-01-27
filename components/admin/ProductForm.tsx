"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Product } from "@/data/products";
import { generateSlug } from "@/lib/utils";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    images: "",
    heatLevel: "3",
    category: "original" as "original" | "beef" | "gift-set",
    inStock: true,
    flavorNotes: "",
    ingredients: "",
    nutrition: {
      servingSize: "",
      calories: "",
      totalFat: "",
      sodium: "",
    },
    isBestSeller: false,
    isNew: false,
    isBundle: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        image: product.image,
        images: product.images.join(", "),
        heatLevel: product.heatLevel.toString(),
        category: product.category,
        inStock: product.inStock,
        flavorNotes: product.flavorNotes.join(", "),
        ingredients: product.ingredients.join(", "),
        nutrition: {
          servingSize: product.nutrition?.servingSize || "",
          calories: product.nutrition?.calories.toString() || "",
          totalFat: product.nutrition?.totalFat || "",
          sodium: product.nutrition?.sodium || "",
        },
        isBestSeller: product.isBestSeller || false,
        isNew: product.isNew || false,
        isBundle: product.isBundle || false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...(product && { id: product.id }),
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        image: formData.image,
        images: formData.images
          ? formData.images.split(",").map((img) => img.trim())
          : [formData.image],
        heatLevel: formData.heatLevel,
        category: formData.category,
        inStock: formData.inStock,
        flavorNotes: formData.flavorNotes
          ? formData.flavorNotes.split(",").map((note) => note.trim())
          : [],
        ingredients: formData.ingredients
          ? formData.ingredients.split(",").map((ing) => ing.trim())
          : [],
        nutrition: formData.nutrition.servingSize
          ? {
              servingSize: formData.nutrition.servingSize,
              calories: parseInt(formData.nutrition.calories) || 0,
              totalFat: formData.nutrition.totalFat,
              sodium: formData.nutrition.sodium,
            }
          : undefined,
        isBestSeller: formData.isBestSeller,
        isNew: formData.isNew,
        isBundle: formData.isBundle,
      };

      const url = "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onClose();
      } else {
        alert("Failed to save product: " + result.error);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Original Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Heat Level *</label>
                <select
                  value={formData.heatLevel}
                  onChange={(e) => setFormData({ ...formData, heatLevel: e.target.value })}
                  className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                  required
                >
                  <option value="1">1 - Mild</option>
                  <option value="2">2 - Medium Mild</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - Hot</option>
                  <option value="5">5 - Extra Hot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as "original" | "beef" | "gift-set",
                    })
                  }
                  className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                  required
                >
                  <option value="original">Original</option>
                  <option value="beef">Beef</option>
                  <option value="gift-set">Gift Set</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="inStock" className="text-sm font-medium">
                  In Stock
                </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Product Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isBestSeller" className="text-sm font-medium">
                    Best Seller
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isNew" className="text-sm font-medium">
                    New Product
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBundle"
                    checked={formData.isBundle}
                    onChange={(e) => setFormData({ ...formData, isBundle: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isBundle" className="text-sm font-medium">
                    Bundle
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Main Image URL *</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/products/product-1.png"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Additional Images (comma-separated)</label>
              <Input
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="/images/products/product-1.png, /images/products/product-1-alt.png"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Flavor Notes (comma-separated)</label>
              <Input
                value={formData.flavorNotes}
                onChange={(e) => setFormData({ ...formData, flavorNotes: e.target.value })}
                placeholder="Garlicky, Umami, Crunchy"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Ingredients (comma-separated)</label>
              <Input
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="Premium vegetable oil, Dried red chilies, Garlic"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Nutrition Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Serving Size</label>
                  <Input
                    value={formData.nutrition.servingSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, servingSize: e.target.value },
                      })
                    }
                    placeholder="1 tsp (5ml)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Calories</label>
                  <Input
                    type="number"
                    value={formData.nutrition.calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, calories: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Total Fat</label>
                  <Input
                    value={formData.nutrition.totalFat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, totalFat: e.target.value },
                      })
                    }
                    placeholder="5g"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sodium</label>
                  <Input
                    value={formData.nutrition.sodium}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, sodium: e.target.value },
                      })
                    }
                    placeholder="120mg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : product ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
