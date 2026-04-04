"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApiJson } from "@/lib/fetch-api";

type Product = { slug: string };
type Recipe = { slug: string };

export function HomePrefetch() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const runPrefetch = async () => {
      try {
        router.prefetch("/shop");
        router.prefetch("/recipes");
        router.prefetch("/story");
        router.prefetch("/faq");

        const [productsRes, recipesRes] = await Promise.all([
          fetchApiJson<{ success: boolean; data?: Product[] }>("/api/products"),
          fetchApiJson<{ success: boolean; data?: Recipe[] }>("/api/recipes"),
        ]);

        if (cancelled) return;

        for (const product of (productsRes.data ?? []).slice(0, 6)) {
          router.prefetch(`/shop/${product.slug}`);
        }
        for (const recipe of (recipesRes.data ?? []).slice(0, 6)) {
          router.prefetch(`/recipes/${recipe.slug}`);
        }
      } catch {
        // Ignore prefetch errors, this is an optimization path.
      }
    };

    const timer = window.setTimeout(runPrefetch, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  return null;
}
