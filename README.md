# ChiliRig E-commerce Website

![ChiliRig Hero](images/Attached_image1.png)

A premium, conversion-focused e-commerce marketing website for ChiliRig, a premium chili oil brand. Built with Next.js, TypeScript, TailwindCSS, and Framer Motion.

## Screenshots

<div align="center">
  <img src="images/Attached_image2.png" width="45%" alt="Product Showcase" />
  <img src="images/Attached_image3.png" width="45%" alt="Recipe Section" />
  <br />
  <img src="images/Attached_image4.png" width="91%" alt="Mobile View / Detailed View" />
</div>

## Features

- **Premium Design**: Clean, modern layout with dark theme and fiery accents
- **Fully Responsive**: Optimized for all screen sizes
- **Product Showcase**: Product grid with filtering, sorting, and detailed product pages
- **Shopping Cart**: Full cart functionality with Zustand state management
- **Recipe Section**: Curated recipes featuring ChiliRig products
- **Smooth Animations**: Subtle Framer Motion animations throughout
- **Accessible**: Proper semantic HTML, ARIA labels, and focus states

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components built with shadcn/ui patterns
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chilirig/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── shop/              # Shop pages
│   ├── story/              # About/Story page
│   ├── recipes/            # Recipe pages
│   ├── faq/                # FAQ page
│   └── checkout/           # Checkout page
├── components/             # React components
│   ├── ui/                # Base UI components
│   └── sections/          # Page sections
├── data/                   # Mock data
│   ├── products.ts        # Product data
│   ├── recipes.ts         # Recipe data
│   └── reviews.ts         # Review data
├── lib/                    # Utilities
│   ├── utils.ts           # Helper functions
│   └── store.ts           # Zustand store
└── public/                # Static assets
```

## Adding Images

All images are stored in the `public/images/` directory. The site expects the following structure:

```
public/images/
├── products/          # Product images (600x600px recommended)
│   ├── product-1.jpg
│   ├── product-2.jpg
│   └── ...
├── recipes/            # Recipe images (800x600px recommended)
│   ├── recipe-garlic-chili-noodles.jpg
│   └── ...
├── hero/               # Hero section images
│   ├── hero-main.jpg
│   └── hero-craftsmanship.jpg
├── categories/         # Category card images (600x400px recommended)
│   ├── category-original.jpg
│   ├── category-beef.jpg
│   └── category-gift-set.jpg
└── instagram/         # Instagram gallery images (400x400px recommended)
    ├── instagram-1.jpg
    └── ...
```

**Important**: Add your actual product photos to these folders. The site is configured to use local image paths. If images are missing, they will show as broken images. Replace the placeholder paths with your actual product photos.

## Editing Product Data

Product data is stored in `data/products.ts`. To add or modify products:

1. Open `data/products.ts`
2. Add or edit product objects in the `products` array
3. Each product should have:
   - `id`: Unique identifier
   - `name`: Product name
   - `slug`: URL-friendly identifier
   - `description`: Product description
   - `price`: Price in USD
   - `image`: Main product image path (e.g., `/images/products/product-1.jpg`)
   - `images`: Array of image paths
   - `heatLevel`: Heat level (1-5)
   - `category`: Product category
   - `flavorNotes`: Array of flavor descriptors
   - `ingredients`: Array of ingredients

## Editing Recipes

Recipe data is stored in `data/recipes.ts`. To add or modify recipes:

1. Open `data/recipes.ts`
2. Add or edit recipe objects in the `recipes` array
3. Each recipe should have:
   - `id`: Unique identifier
   - `title`: Recipe title
   - `slug`: URL-friendly identifier
   - `description`: Recipe description
   - `image`: Recipe image path (e.g., `/images/recipes/recipe-garlic-chili-noodles.jpg`)
   - `prepTime`: Preparation time
   - `cookTime`: Cooking time
   - `servings`: Number of servings
   - `heatLevel`: Heat level (1-5)
   - `ingredients`: Array of ingredient objects
   - `steps`: Array of step objects
   - `tips`: Optional array of tips

## Design System

### Colors

- **Charcoal**: Dark backgrounds (`charcoal-950`, `charcoal-900`, etc.)
- **Chili Red**: Primary accent (`chili-600`, `chili-500`, etc.)
- **Ember Orange**: Secondary accent (`ember-600`, `ember-500`, etc.)
- **Gold**: Premium highlights (`gold-400`, `gold-500`, etc.)

### Typography

- **Display Font**: Playfair Display (headings)
- **Body Font**: Inter (body text)

### Components

- **Buttons**: Primary (ember gradient), Secondary (outline), Ghost
- **Cards**: Rounded-2xl with subtle shadows
- **Heat Meter**: Visual indicator for spice levels
- **Product Cards**: Hover effects and quick add to cart

## Building for Production

```bash
npm run build
npm start
```

## Notes

- This is a mock e-commerce site. No actual payments are processed.
- Images use placeholder URLs. Replace with actual product images.
- Cart state is stored in memory (Zustand). It will reset on page refresh.
- All checkout functionality is simulated for demonstration purposes.

## License

This project is for demonstration purposes.
