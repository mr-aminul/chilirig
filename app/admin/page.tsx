"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Package, 
  ChefHat, 
  Star, 
  Home,
  ShoppingBag,
  FileText,
  BookOpen,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const adminSections = [
  {
    id: "products",
    title: "Products",
    description: "Manage your product catalog",
    icon: Package,
    href: "/admin/products",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "recipes",
    title: "Recipes",
    description: "Manage recipe content",
    icon: ChefHat,
    href: "/admin/recipes",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "reviews",
    title: "Reviews",
    description: "Manage customer reviews",
    icon: Star,
    href: "/admin/reviews",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "story",
    title: "Story",
    description: "Manage your story page content",
    icon: BookOpen,
    href: "/admin/story",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Manage frequently asked questions",
    icon: HelpCircle,
    href: "/admin/faq",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="font-display text-xl font-semibold">ChiliRig</span>
              </Link>
              <span className="text-muted-foreground">|</span>
              <h1 className="text-xl font-display font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  View Site
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">Welcome to Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage all aspects of your ecommerce website from here
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Products</CardTitle>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Active products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Recipes</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Published recipes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Reviews</CardTitle>
              <Star className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Customer reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.id} href={section.href}>
                <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
