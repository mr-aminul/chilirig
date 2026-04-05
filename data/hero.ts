export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
}

export interface HeroContent {
  slides: HeroSlide[];
}
