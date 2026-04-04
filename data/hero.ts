import { REMOTE_MEDIA_PLACEHOLDER } from "@/lib/remote-media-placeholder";

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
      image: REMOTE_MEDIA_PLACEHOLDER,
      alt: "ChiliRig hero flames and peppers",
    },
    {
      id: "hero-slide-2",
      image: REMOTE_MEDIA_PLACEHOLDER,
      alt: "Red chili peppers splashing across a fiery background",
    },
  ],
};
