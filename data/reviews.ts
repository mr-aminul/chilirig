export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export const reviews: Review[] = [
  {
    id: "1",
    name: "Sarah Chen",
    rating: 5,
    comment:
      "This is hands down the best chili oil I've ever had. The flavor is complex and the heat is perfect. I put it on everything!",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    rating: 5,
    comment:
      "The Beef Chili Oil is incredible. So much umami depth. My noodles have never been better. Worth every penny.",
    date: "2024-01-10",
    verified: true,
  },
  {
    id: "3",
    name: "Emily Park",
    rating: 5,
    comment:
      "I'm not usually a spice person, but the Mild version is perfect. Great flavor without overwhelming heat. My new pantry staple.",
    date: "2024-01-08",
    verified: true,
  },
  {
    id: "4",
    name: "James Liu",
    rating: 5,
    comment:
      "The quality is outstanding. You can tell it's made with real ingredients. The garlic and chili balance is perfect.",
    date: "2024-01-05",
    verified: true,
  },
  {
    id: "5",
    name: "Alex Thompson",
    rating: 5,
    comment:
      "Fast shipping, beautiful packaging, and the product is amazing. The gift set made a perfect present.",
    date: "2024-01-03",
    verified: true,
  },
];

export function getAverageRating(): number {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

export function getFeaturedReviews(count: number = 3): Review[] {
  return reviews.slice(0, count);
}
