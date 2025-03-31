import { useAppDispatch } from "@/lib/hooks/redux";
import { addToCart } from "@/redux/cartSlice";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { ToastContainer } from "react-toastify"; // Import toast and ToastContainer from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS for react-toastify
import { useRouter } from "next/navigation";
import { ProductJsonLd } from "next-seo";
import RatingForProduct from "./RatingForProduct";
import CharacterCounterInputForProduct from "./CharacterCounterInputForProduct";
import { supabase } from "@/lib/supabaseClient";
import SingleProductReviews from "./SingleProductReviews";
import { User } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import LoadingScreen from "./LoadingScreen";

interface SingleProduct {
  product_id: string;
  product_name: string;
  product_SP: number;
  product_MRP: number;
  product_image?: { url: string }[];
  product_description: string;
  quantity: number;
  product_discount: number;
  product_amount: number;
}

const SingleProduct = ({
  singleProduct,
}: {
  singleProduct: SingleProduct | null;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0);
  const [resetRating, setResetRating] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number | null>(null); // State for average rating

  // Star Component
  const Star = ({
    color = "#fa9302",
    fill = "none",
    strokeWidth = 1,
    className = "",
    isFilled = false,
    isHalfFilled = false,
  }: {
    color: string;
    fill: string;
    strokeWidth: number;
    className?: string;
    isFilled?: boolean;
    isHalfFilled?: boolean;
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke={color}
      fill={isFilled ? color : isHalfFilled ? "url(#gradient)" : fill}
      strokeWidth={strokeWidth}
      className={className}
    >
      {isHalfFilled && (
        <defs>
          <linearGradient id="gradient">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="none" />
          </linearGradient>
        </defs>
      )}
      <polygon points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8" />
    </svg>
  );

  // Stars Component
  const Stars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    return (
      <div className="flex">
        {Array.from({ length: totalStars }, (_, index) => {
          if (index < fullStars) {
            return (
              <Star
                key={index}
                color="#fa9302"
                fill="#fa9302"
                strokeWidth={1}
                isFilled={true}
              />
            );
          }
          if (index === fullStars && halfStar) {
            return (
              <Star
                key={index}
                color="#fa9302"
                fill="none"
                strokeWidth={1}
                isHalfFilled={true}
              />
            );
          }
          return (
            <Star key={index} color="#fa9302" fill="none" strokeWidth={1} />
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    // Set the user from the session data
    const fetchUserData = async () => {
      if (session) {
        setUser(session.user as User);
      }
    };
    
    
    setLoading(false);


    const fetchAverageRating = async () => {
      if (!singleProduct) return; // Early exit if singleProduct is not defined
      try {
        const { data, error } = await supabase
          .from("products")
          .select("user_rating")
          .eq("product_id", singleProduct.product_id)
          .single();

        if (error) throw error;

        if (data?.user_rating) {
          const ratings = data.user_rating;
          const totalReviews = ratings.length;
          const totalRating = ratings.reduce(
            (acc: number, curr: { review: number }) => acc + curr.review,
            0
          );
          const average = totalReviews > 0 ? totalRating / totalReviews : 0;
          setAverageRating(average);
        }
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };
    fetchUserData();
    fetchAverageRating();
  }, [singleProduct, session]);

  const handleResetRating = () => {
    setRating(0);
    setResetRating(true);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  useEffect(() => {
    if (resetRating) {
      setResetRating(false);
    }
  }, [resetRating]);

  // Loading state handling
  if (loading) {
    return <LoadingScreen />;
  }

  // Handle case where singleProduct is not available
  if (!singleProduct) {
    return <div>No product found.</div>;
  }

  const productImages = singleProduct.product_image || []; // Set to an empty array if undefined

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };

  const handleAddToCart = () => {
    dispatch(addToCart(singleProduct));
  };

  const handleBuyNow = () => {
    router.replace(
      `/checkout-single-product?product_id=${singleProduct.product_id}`
    );
  };

  return (
    <>
      {singleProduct && (
        <ProductJsonLd
          productName={singleProduct.product_name}
          description={singleProduct.product_description}
          images={singleProduct.product_image?.map((img) => img.url) || []}
          offers={{
            price: singleProduct.product_SP.toString(),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          }}
          aggregateRating={
            averageRating
              ? {
                  ratingValue: averageRating.toString(),
                  reviewCount: "1",
                  bestRating: "5",
                  worstRating: "1",
                }
              : undefined
          }
        />
      )}

      <div className="pb-20">
        <div className="w-full flex flex-row flex-wrap md:flex-nowrap items-center justify-center pt-16">
          <div className="md:w-1/2 w-full flex p-6 flex-col justify-center items-center relative">
            <div
              className="absolute top-2 right-2 z-10 rounded-full bg-white/50 p-2 custom-backdrop-filter cursor-pointer"
              onClick={handleHeartClick}
            >
              <Heart
                className={
                  isHeartFilled ? "text-red-500 fill-current" : "text-red-500"
                }
              />
            </div>
            {/* Carousel to display product images */}
            {productImages.length > 0 && (
              <Carousel
                showThumbs={false} // Enable the thumbnails
                autoPlay={true} // Enable auto play
                interval={3000} // Interval between slides in milliseconds (3 seconds)
                infiniteLoop={true} // Enable infinite loop
                showStatus={false} // Hide the status bar
              >
                {productImages.map((image: { url: string }, index: number) => (
                  <div key={index} className="relative">
                    <Image
                      src={image.url}
                      alt={`Product Image ${index}`}
                      width={500} // Adjust width and height as needed
                      height={500}
                      className="rounded-lg h-[500px] w-[500px] object-contain"
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
          <div className="md:w-1/2 w-full flex flex-col justify-center gap-6 p-6">
            <h1 className="font-extrabold text-2xl">
              {singleProduct.product_name}
            </h1>
            <div className="flex gap-2 justify-start items-center">
              {/* Rating Component */}
              <Stars rating={averageRating ?? 0} />{" "}
              <p className="text-xs font-bold">
                {averageRating !== null
                  ? averageRating.toFixed(1)
                  : "No Reviews"}
              </p>
              {/* Stars component for average rating */}
            </div>
            <p className="text-xs">{singleProduct.product_description}</p>
            <div className="flex gap-5">
              <p className="font-extrabold text-xl">
                &#x20B9;{singleProduct.product_SP}
              </p>
              <div className="flex gap-1">
                <p className="line-through text-[#b8b4b4] text-sm">
                  &#x20B9;{singleProduct.product_MRP}
                </p>
                <p className="font-bold text-sm text-emerald-300">
                  ({singleProduct.product_discount.toFixed(2)}%)
                </p>
              </div>
            </div>
            <div className="w-full flex gap-10">
              <button
                className={`${
                  singleProduct.product_amount <= 0
                    ? "bg-gray-400 cursor-not-allowed filter grayscale"
                    : "bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl"
                } focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200`}
                onClick={handleAddToCart}
                disabled={singleProduct.product_amount <= 0}
              >
                {singleProduct.product_amount <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
              <button
                className={`${
                  singleProduct.product_amount <= 0
                    ? "bg-gray-400 cursor-not-allowed filter grayscale"
                    : "bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl"
                } focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200`}
                onClick={handleBuyNow}
                disabled={singleProduct.product_amount <= 0}
              >
                {singleProduct.product_amount <= 0 ? "Out of Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-center" />
        <div className="flex flex-col justify-center items-center gap-4 pb-8">
          <h1 className="font-bold text-xl text-center">
            Want to say something about{" "}
            <span className="text-indigo-500">this product?</span>
          </h1>
          {/* Rating Component */}
          <RatingForProduct
            onRatingChange={handleRatingChange}
            resetRating={resetRating}
          />
          {/* CharacterCounterInput Component */}
          <CharacterCounterInputForProduct
            user={user}
            rating={rating}
            onResetRating={handleResetRating}
            productId={singleProduct.product_id}
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-4 pb-12">
          <h1 className="font-bold text-xl text-center">
            What people think about{" "}
            <span className="text-indigo-500">this product?</span>
          </h1>

          <SingleProductReviews productId={singleProduct.product_id} />
        </div>
      </div>
    </>
  );
};

export default SingleProduct;
