import { Review } from "@/data/reviews";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">{review.comment}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            {review.name}
          </span>
          {review.verified && (
            <span className="text-xs text-[hsl(var(--text-muted))]">Verified</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
