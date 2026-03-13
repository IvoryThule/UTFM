import { reviews } from "@backend/data/reviews";
import type { ReviewEntity } from "@backend/types";

export interface SummaryResult {
	total: number;
	averageRating: number;
	topTags: string[];
	samples: ReviewEntity[];
}

export function getReviewSummary(restaurantId: string): SummaryResult {
	const matched = reviews.filter((review) => review.restaurantId === restaurantId);
	const total = matched.length;

	const averageRating = total
		? Number((matched.reduce((acc, item) => acc + item.rating, 0) / total).toFixed(1))
		: 0;

	const tagCounter = new Map<string, number>();
	matched.forEach((review) => {
		review.tags.forEach((tag) => {
			tagCounter.set(tag, (tagCounter.get(tag) ?? 0) + 1);
		});
	});

	const topTags = Array.from(tagCounter.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map((entry) => entry[0]);

	return {
		total,
		averageRating,
		topTags,
		samples: matched.slice(0, 5)
	};
}
