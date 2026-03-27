export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
}

export interface HeroContent {
  slides: HeroSlide[];
}

export const defaultHeroContent: HeroContent = {
  slides: [
    {
      id: "hero-slide-1",
      image: "/images/hero/fire-flames-on-black-background-free-photo.jpg",
      alt: "ChiliRig hero flames and peppers",
    },
    {
      id: "hero-slide-2",
      image: "/images/eb39ac61-93c8-4954-933f-1cef9406935b.jpg",
      alt: "Garlic and red chilies on a dark background",
    },
    {
      id: "hero-slide-3",
      image: "/images/40004f7d-b2f0-4357-953a-fe35253873ce.jpg",
      alt: "Red chili peppers splashing across a fiery background",
    },
  ],
};
