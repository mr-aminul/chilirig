import { REMOTE_MEDIA_PLACEHOLDER } from "@/lib/remote-media-placeholder";

export const DEFAULT_INSTAGRAM_PROFILE_URL = "https://www.instagram.com/chilirig";

export interface InstagramGalleryTile {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export interface InstagramGalleryContent {
  heading: string;
  subheading: string;
  tiles: InstagramGalleryTile[];
}

export const defaultInstagramGalleryContent: InstagramGalleryContent = {
  heading: "Follow us on Instagram",
  subheading: "Share your ChiliRig creations with #ChiliRig",
  tiles: Array.from({ length: 6 }, (_, i) => ({
    id: `ig-default-${i + 1}`,
    image: REMOTE_MEDIA_PLACEHOLDER,
    alt: `ChiliRig Instagram post ${i + 1}`,
    href: DEFAULT_INSTAGRAM_PROFILE_URL,
  })),
};
