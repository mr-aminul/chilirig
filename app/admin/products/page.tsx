"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Home,
  ArrowLeft,
  Search,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Product } from "@/data/products";
import ProductForm from "@/components/admin/ProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">Products Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader size="lg" className="text-[hsl(var(--primary))]" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No products found matching your search." : "No products yet. Add your first product!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">${product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.inStock 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.isBestSeller && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Best Seller
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                    {product.isBundle && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Bundle
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Heat Level: {product.heatLevel}/5 | Category: {product.category}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
