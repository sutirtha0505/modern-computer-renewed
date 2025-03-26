"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Star } from "lucide-react"; // Importing the Star icon
import { toast } from "react-toastify"; // Assuming you are using react-toastify for toasts
import Image from "next/image";

interface Review {
  UX_star: number;
  comment: string;
  image: string; // Assuming profile_photo is a URL to an image
  email: string; // Assuming email is unique for each user
  show_in_carousel: boolean; // Assuming show_in_carousel is a boolean indicating whether the review should be displayed in the carousel
}

const EditReview: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("UX_star, comment, email, image, show_in_carousel")
        .not("UX_star", "is", null);

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        console.log("Fetched data:", data); // Debugging line
        setReviews(data || []);

        // Pre-select reviews where show_in_carousel is true
        const preSelectedIndexes = data
          .map((review, index) => (review.show_in_carousel ? index : null))
          .filter((index) => index !== null) as number[];
        setSelectedIndexes(preSelectedIndexes);
      }
    };

    fetchReviews();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedReviewIndex(expandedReviewIndex === index ? null : index);
  };

  const renderStars = (starCount: number) => {
    const totalStars = 5; // Assuming a 5-star rating system
    return (
      <div className="flex gap-1">
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < starCount ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSelect = async (index: number) => {
    const review = reviews[index];

    if (selectedIndexes.includes(index)) {
      // Deselect the review and update show_in_carousel to false
      setSelectedIndexes(selectedIndexes.filter((i) => i !== index));

      try {
        const { error } = await supabase
          .from("users")
          .update({ show_in_carousel: false })
          .eq("email", review.email);

        if (error) {
          console.error("Error updating show_in_carousel:", error);
          toast.error("Failed to update the review.");
        }
      } catch (error) {
        console.error("Error updating show_in_carousel:", error);
        toast.error("Failed to update the review.");
      }
    } else if (selectedIndexes.length < 8) {
      // Select the review
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const handleSendToCarousel = async () => {
    const selectedReviews = selectedIndexes.map((index) => reviews[index]);

    const updates = selectedReviews.map((review) =>
      supabase
        .from("users")
        .update({ show_in_carousel: true })
        .eq("email", review.email)
    );

    try {
      await Promise.all(updates);
      toast.success("Reviews sent to the carousel successfully!");

      // Refresh data after updating the database
      const { data, error } = await supabase
        .from("users")
        .select("UX_star, comment, email, image, show_in_carousel")
        .not("UX_star", "is", null);

      if (!error) {
        setReviews(data || []);
        setSelectedIndexes(
          data
            .map((review, index) => (review.show_in_carousel ? index : null))
            .filter((index) => index !== null) as number[]
        );
      }
    } catch (error) {
      console.error("Error updating show_in_carousel:", error);
      toast.error("Failed to send reviews to the carousel.");
    }
  };

  return (
    <div className="flex flex-col gap-10 justify-center items-center pt-5">
      <h1 className="text-2xl font-extrabold text-center">
        All the <span className="text-indigo-500"> Reviews</span> from the{" "}
        <span className="text-indigo-500">Customers</span>
      </h1>
      <div className="flex gap-5 flex-wrap justify-center">
        {reviews.map((review, index) => (
          <div
            key={index}
            className={`flex flex-col gap-7 w-64 p-4 justify-between items-center rounded-md relative cursor-pointer ${
              selectedIndexes.includes(index)
                ? "bg-blue-700"
                : "bg-slate-900"
            }`}
            onClick={() => handleSelect(index)}
          >
            <div className="w-full flex justify-center items-center">
              <Image
                src={review.image}
                alt="Profile photo"
                className="w-12 h-12 rounded-full absolute -top-5"
                width={300}
                height={300}
              />
            </div>
            <div className="flex">{renderStars(review.UX_star)}</div>
            <div className="w-full flex gap-3 items-center justify-center">
              <h1 className="text-md font-bold text-indigo-500">E-mail:</h1>
              <p className="text-xs break-all">{review.email}</p>
            </div>
            <div className="w-full text-sm text-center">
              {expandedReviewIndex === index ? (
                <span>{review.comment}</span>
              ) : (
                <span>
                  {review.comment.substring(0, 50)}
                  {review.comment.length > 50 && (
                    <>
                      ...{" "}
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-xs hover:text-indigo-500"
                      >
                        Read more
                      </button>
                    </>
                  )}
                </span>
              )}
              {expandedReviewIndex === index && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-xs hover:text-indigo-500"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSendToCarousel}
        className="mt-5 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        disabled={selectedIndexes.length === 0}
      >
        Send to Carousel
      </button>
    </div>
  );
};

export default EditReview;
