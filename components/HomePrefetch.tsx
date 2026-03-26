"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCachedApiJson } from "@/lib/api-cache";

type Product = { slug: string };
type Recipe = { slug: string };

export function HomePrefetch() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const runPrefetch = async () => {
      try {
        // Warm static route bundles.
        router.prefetch("/shop");
        router.prefetch("/recipes");
        router.prefetch("/story");
        router.prefetch("/faq");

        // Warm API caches used by target pages.
        const [productsRes, recipesRes] = await Promise.all([
          getCachedApiJson<{ success: boolean; data?: Product[] }>("/api/products", {
            ttlMs: 10 * 60 * 1000,
          }),
          getCachedApiJson<{ success: boolean; data?: Recipe[] }>("/api/recipes", {
            ttlMs: 10 * 60 * 1000,
          }),
          getCachedApiJson("/api/story", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/faq", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/reviews", { ttlMs: 10 * 60 * 1000 }),
        ]);

        if (cancelled) return;

        // Prefetch a few detail pages likely to be visited next.
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

