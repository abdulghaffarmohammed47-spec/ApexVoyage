/* ═══════════════════════════════════════════════════════════════
   ReviewsList — Mock Verified Guest Reviews Display
   Static curated reviews with rating, author, and date metadata
   ═══════════════════════════════════════════════════════════════ */

import { memo } from 'react';

const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    author: 'Sarah M.',
    initials: 'SM',
    rating: 5.0,
    date: '2 weeks ago',
    title: 'Unforgettable experience',
    text: 'The attention to detail was extraordinary. From the personalized welcome to the concierge recommendations, every moment felt curated. The view from our suite was breathtaking.',
  },
  {
    id: 'r2',
    author: 'James K.',
    initials: 'JK',
    rating: 4.8,
    date: '1 month ago',
    title: 'Worth every penny',
    text: 'Premium service from check-in to check-out. The staff anticipated our every need. The on-site restaurant deserves its accolades — try the chef\'s tasting menu.',
  },
  {
    id: 'r3',
    author: 'Elena R.',
    initials: 'ER',
    rating: 4.9,
    date: '3 weeks ago',
    title: 'A true sanctuary',
    text: 'Beautiful property with impeccable design. The spa treatments were world-class and the infinity pool at sunset is something I\'ll never forget. Highly recommend.',
  },
  {
    id: 'r4',
    author: 'David L.',
    initials: 'DL',
    rating: 4.7,
    date: '2 months ago',
    title: 'Exceptional hospitality',
    text: 'Stayed for our anniversary and the team went above and beyond. Champagne on arrival, complimentary upgrade, and a hand-written note from the GM. Class act.',
  },
  {
    id: 'r5',
    author: 'Aisha P.',
    initials: 'AP',
    rating: 5.0,
    date: '1 week ago',
    title: 'Perfection redefined',
    text: 'I have traveled extensively and this is hands down the best property I have ever stayed at. The level of luxury, combined with authentic local touches, is unmatched.',
  },
];

const ReviewsList = memo(function ReviewsList({ maxReviews = 3, showAll = false }) {
  const reviews = showAll ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.slice(0, maxReviews);

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-avatar">{review.initials}</div>
            <div style={{ flex: 1 }}>
              <div className="review-author">{review.author}</div>
              <div className="review-date">{review.date}</div>
            </div>
            <div className="review-rating">
              ★ {review.rating.toFixed(1)}
            </div>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            {review.title}
          </div>
          <div className="review-text">{review.text}</div>
        </div>
      ))}
    </div>
  );
});

export default ReviewsList;
