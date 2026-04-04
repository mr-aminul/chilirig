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

  return (
    <SectionContainer>
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          {content.heading}
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">{content.subheading}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 border border-black/10"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
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
