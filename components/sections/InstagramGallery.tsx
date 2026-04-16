"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionContainer } from "@/components/SectionContainer";
import {
  DEFAULT_INSTAGRAM_PROFILE_URL,
  InstagramGalleryContent,
} from "@/data/instagram-gallery";
import { imageSrcForNext } from "@/lib/media-url";

type InstagramGalleryProps = {
  content: InstagramGalleryContent;
};

export function InstagramGallery({ content }: InstagramGalleryProps) {
  const tiles = content.tiles.map((tile) => ({
    id: tile.id,
    src: imageSrcForNext(tile.image),
    alt: tile.alt,
    href: tile.href?.trim() || DEFAULT_INSTAGRAM_PROFILE_URL,
  }));

  const columnCount = Math.max(tiles.length, 1);
  const gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <SectionContainer>
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          {content.heading}
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">{content.subheading}</p>
      </div>
      <div
        className="mx-auto grid w-full max-w-5xl gap-2 sm:gap-3 md:gap-4"
        style={{ gridTemplateColumns }}
      >
        {tiles.map((image, index) => (
          <motion.a
            key={image.id}
            href={image.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative aspect-square min-h-0 min-w-0 w-full overflow-hidden rounded-lg border border-black/10 bg-gray-100"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes={`(max-width: 640px) ${Math.ceil(100 / columnCount)}vw, (max-width: 1024px) ${Math.ceil(100 / columnCount)}vw, ${Math.ceil(1024 / columnCount)}px`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-sm font-semibold text-white">View</span>
            </div>
          </motion.a>
        ))}
      </div>
    </SectionContainer>
  );
}
