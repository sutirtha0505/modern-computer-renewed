import React, { useState, useEffect } from "react";
import { Star, Sparkles } from "lucide-react";

interface RatingProps {
  onRatingChange: (rating: number) => void;
  resetRating: boolean;
}

const RatingForProduct: React.FC<RatingProps> = ({ onRatingChange, resetRating }) => {
  const [rating, setRating] = useState<number>(0);
  const [showSparkles, setShowSparkles] = useState<boolean>(false);

  const handleClick = (index: number) => {
    const newRating = index + 1;
    setRating(newRating);
    onRatingChange(newRating);
    setShowSparkles(true);
    setTimeout(() => {
      setShowSparkles(false);
    }, 2000);
  };

  useEffect(() => {
    if (resetRating) {
      setRating(0);
    }
  }, [resetRating]);

  return (
    <div className="flex justify-center items-center relative">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">
          Rate our <span className="text-indigo-600">Product</span>
        </h1>
        <div className="flex justify-center items-center">
          {showSparkles && (
            <>
              <Sparkles className="absolute -left-4 fill-yellow-500 text-yellow-500 w-2 h-2" />
              <Sparkles className="absolute -right-4 fill-yellow-500 text-yellow-500 w-2 h-2" />
              <Sparkles className="absolute -bottom-6 left-6 fill-yellow-500 text-yellow-500 w-2 h-2" />
              <Sparkles className="absolute top-4 right-6 fill-yellow-500 text-yellow-500 w-2 h-2" />
            </>
          )}
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              onClick={() => handleClick(index)}
              color={index < rating ? "#fa9302" : "#fa9302"}
              fill={index < rating ? "#fa9302" : "none"}
              strokeWidth={1}
              className="cursor-pointer"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingForProduct;
