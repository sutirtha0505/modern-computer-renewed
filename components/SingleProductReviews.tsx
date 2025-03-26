import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface Review {
  time: string;
  user: string;
  review: number;
  comment: string;
  profile_photo?: string;
  customer_name?: string;
}

interface SingleProductReviewsProps {
  productId: string;
}

const Star = ({
  color = "#fa9302",
  fill = "none",
  strokeWidth = 1,
  className = "",
}: {
  color: string;
  fill: string;
  strokeWidth: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke={color}
    fill={fill}
    strokeWidth={strokeWidth}
    className={className}
  >
    <polygon points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8" />
  </svg>
);

const SingleProductReviews: React.FC<SingleProductReviewsProps> = ({
  productId,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviewsWithProfiles = async () => {
      setLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("user_rating")
          .eq("product_id", productId)
          .single();

        if (productError) {
          setError("Error fetching reviews");
          setLoading(false);
          return;
        }

        if (productData && productData.user_rating) {
          const reviewsWithProfiles: Review[] = await Promise.all(
            productData.user_rating.map(async (review: Review) => {
              const { data: profileData } = await supabase
                .from("users")
                .select("name, image")
                .eq("id", review.user)
                .single();

              return {
                ...review,
                customer_name: profileData?.name || "Non-Verified User",
                profile_photo: profileData?.image || null,
              };
            })
          );

          setReviews(reviewsWithProfiles);
          setFilteredReviews(reviewsWithProfiles);
        }
      } catch {
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsWithProfiles();
  }, [productId]);

  
  const filterReviews = useCallback(() => {
    let filtered = reviews;

    // Filter reviews based on the selected rating
    if (selectedRating !== null) {
      filtered = reviews.filter((review) => review.review === selectedRating);
    }

    setFilteredReviews(filtered);
  }, [reviews, selectedRating]);

  useEffect(() => {
    filterReviews();
  }, [selectedRating, filterReviews]);

  // Render stars based on rating value
  const renderStars = (rating: number) => (
    <div className="stars flex">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          color={index < rating ? "#fa9302" : "#fa9302"}
          fill={index < rating ? "#fa9302" : "none"}
          strokeWidth={1}
          className="cursor-pointer"
        />
      ))}
    </div>
  );

  // Display relative time in a user-friendly way
  const renderRelativeTime = (reviewTime: string) => {
    const now = new Date();
    const reviewDate = new Date(reviewTime);
    const timeDiff = now.getTime() - reviewDate.getTime();

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-start justify-start w-full px-4 py-0 md:px-24">
      <div className="flex justify-center items-center w-full mb-4">
        <label className="mr-2 font-bold text-indigo-500">
          Filter by rating:
        </label>
        <select
          value={selectedRating || ""}
          onChange={(e) =>
            setSelectedRating(e.target.value ? parseInt(e.target.value) : null)
          }
          className="border p-2 rounded-md"
        >
          <option value="">All Ratings</option>
          {[...Array(5)].map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1} Star{index + 1 > 1 && "s"}
            </option>
          ))}
        </select>
      </div>

      {filteredReviews.length > 0 ? (
        filteredReviews.map((review, index) => (
          <div
            key={index}
            className="flex flex-col items-start justify-start mb-4 w-full bg-gray-700 rounded-md p-4"
          >
            <div className="flex justify-start items-center gap-4">
              {review.profile_photo && (
                <Image
                  src={review.profile_photo}
                  alt={`${review.customer_name}'s profile photo`}
                  className="w-12 h-12 rounded-full"
                  width={500}
                  height={500}
                />
              )}
              <p className="text-sm font-bold">{review.customer_name}</p>
            </div>
            <div className="flex gap-4 justify-start items-center p-2">
              {renderStars(review.review)}
              <p className="text-xs">
                <span className="font-bold text-indigo-500">Commented: </span>
                {renderRelativeTime(review.time)}
              </p>
            </div>
            <p className="text-sm mt-2">{review.comment}</p>
          </div>
        ))
      ) : (
        <div className="w-full px-20 py-0 justify-center items-center flex gap-2">
          <Image
            src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/no-comment.png"
            alt=""
            className="w-20 h-20 opacity-85"
            width={500}
            height={500}
          />

          <p className="text-sm text-center">
            No reviews found for this product.
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleProductReviews;
