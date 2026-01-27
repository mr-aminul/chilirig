export interface StorySection {
  id: string;
  type: "hero" | "promises" | "content" | "cta";
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  promises?: {
    id: string;
    title: string;
    description: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
  order: number;
}

export interface StoryContent {
  id: string;
  pageTitle: string;
  pageSubtitle: string;
  sections: StorySection[];
}

export const storyContent: StoryContent = {
  id: "1",
  pageTitle: "Our Story",
  pageSubtitle: "Born from a passion for bold flavor and real ingredients",
  sections: [
    {
      id: "hero-1",
      type: "hero",
      title: "Crafted with care",
      description: "ChiliRig was born from a simple idea: chili oil should be bold, complex, and made with real ingredients. No shortcuts. No preservatives. Just premium chilies, slow-infused in quality oils, balanced for depth and heat.\n\nEvery jar is crafted in small batches using traditional methods passed down through generations. We source the finest dried chilies, carefully blend them with garlic, Sichuan peppercorns, and premium oils, then slow-infuse them to extract maximum flavor.",
      image: "/images/hero/hero-craftsmanship.png",
      imageAlt: "ChiliRig craftsmanship",
      imagePosition: "left",
      order: 1,
    },
    {
      id: "promises-1",
      type: "promises",
      title: "Our Small Batch Promise",
      promises: [
        {
          id: "1",
          title: "Real Ingredients",
          description: "We use premium dried chilies, not extracts. Every ingredient is carefully selected for quality and flavor.",
        },
        {
          id: "2",
          title: "Slow Infusion",
          description: "Our chili oil is slow-infused over time, allowing flavors to develop depth and complexity. No shortcuts.",
        },
        {
          id: "3",
          title: "Small Batches",
          description: "Every batch is crafted by hand in small quantities, ensuring consistency and quality in every jar.",
        },
      ],
      order: 2,
    },
    {
      id: "content-1",
      type: "content",
      title: "From our kitchen to yours",
      description: "We believe great food starts with great ingredients. That's why we're committed to sourcing the best chilies, using traditional methods, and never compromising on quality.\n\nWhether you're drizzling it on rice, drowning your noodles, or dipping your favorite snacks, ChiliRig elevates every bite with bold, complex flavor. Join thousands of customers who have made ChiliRig a pantry staple.",
      image: "/images/hero/hero-craftsmanship.png",
      imageAlt: "ChiliRig ingredients",
      imagePosition: "right",
      order: 3,
    },
    {
      id: "cta-1",
      type: "cta",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      order: 4,
    },
  ],
};
