"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Package,
  ChefHat,
  Star,
  Home,
  ImageIcon,
  HelpCircle,
  LogOut,
  Instagram,
  ChevronRight,
  BookOpen,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOrdersPanel } from "@/components/admin/AdminOrdersPanel";
import type { LucideIcon } from "lucide-react";

type AdminSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
};

/** Pages you touch less often — long-form content and reference material */
const adminSectionsStable: AdminSection[] = [
  {
    id: "story",
    title: "Story",
    description: "Our Story page content",
    icon: BookOpen,
    href: "/admin/story",
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
    id: "faq",
    title: "FAQ",
    description: "Manage frequently asked questions",
    icon: HelpCircle,
    href: "/admin/faq",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

/** Catalog, homepage promos, social proof — orders live under the Orders tab */
const adminSectionsFrequent: AdminSection[] = [
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
    id: "hero",
    title: "Hero",
    description: "Manage homepage hero slides",
    icon: ImageIcon,
    href: "/admin/hero",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "featured-banner",
    title: "Featured banner",
    description: "“Grow your cravings” homepage image",
    icon: Flame,
    href: "/admin/featured-banner",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "Homepage Instagram gallery section",
    icon: Instagram,
    href: "/admin/instagram",
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
];

function AdminSectionColumn({
  heading,
  headingId,
  sections,
}: {
  heading: string;
  headingId: string;
  sections: AdminSection[];
}) {
  return (
    <div className="min-w-0">
      <h3
        id={headingId}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1"
      >
        {heading}
      </h3>
      <nav aria-labelledby={headingId} className="border border-black/10 rounded-xl overflow-hidden bg-white/80">
        <ul className="divide-y divide-black/10">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <li key={section.id}>
                <Link
                  href={section.href}
                  className="flex items-center gap-4 px-4 py-4 sm:px-5 hover:bg-black/[0.03] transition-colors group"
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-lg ${section.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {section.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminTab, setAdminTab] = useState<"controls" | "orders">("orders");
  const [pendingDispatchCount, setPendingDispatchCount] = useState<number | null>(null);

  const refreshPendingDispatchCount = useCallback(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/orders/pending-count", { cache: "no-store" });
        const data = await response.json();
        if (data.success && typeof data.count === "number") {
          setPendingDispatchCount(data.count);
        } else {
          setPendingDispatchCount(0);
        }
      } catch {
        setPendingDispatchCount(0);
      }
    })();
  }, []);

  useEffect(() => {
    refreshPendingDispatchCount();
  }, [refreshPendingDispatchCount]);

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
                {loggingOut ? (
                  "Logging out..."
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={adminTab}
          onValueChange={(value) => setAdminTab(value as "controls" | "orders")}
          className="w-full max-w-6xl"
        >
          <TabsList className="mb-6 w-full max-w-md sm:w-auto" aria-label="Admin sections">
            <TabsTrigger
              value="orders"
              className="gap-2"
              aria-label={
                pendingDispatchCount != null && pendingDispatchCount > 0
                  ? `Orders, ${pendingDispatchCount} pending dispatch to Pathao`
                  : "Orders"
              }
            >
              <span>Orders</span>
              {pendingDispatchCount != null && pendingDispatchCount > 0 ? (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[0.625rem] font-bold leading-none text-destructive-foreground"
                  aria-hidden={true}
                >
                  {pendingDispatchCount > 99 ? "99+" : pendingDispatchCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0 focus-visible:ring-0">
            <AdminOrdersPanel embedded onOrdersChanged={refreshPendingDispatchCount} />
          </TabsContent>

          <TabsContent value="controls" className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl">
              <AdminSectionColumn
                headingId="admin-col-stable"
                heading="Site content"
                sections={adminSectionsStable}
              />
              <AdminSectionColumn
                headingId="admin-col-frequent"
                heading="Often updated"
                sections={adminSectionsFrequent}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
