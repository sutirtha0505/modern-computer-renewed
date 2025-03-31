"use client";
import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import SinglePBPCProductReviews from "./SinglePBPCProductReviews";
import CharacterCounterInputForPBPCProduct from "./CharacterCounterInputForPBPCProduct";
import RatingForPBPCProduct from "./RatingForPBPCProduct";
import { useSession } from "next-auth/react";
import { User } from "@supabase/supabase-js";
import Head from 'next/head';

interface Product {
  id: string;
  build_name: string;
  selling_price: number;
  processor: string;
  motherboard?: string;
  ram?: string;
  ram_quantity?: number;
  ssd?: string;
  hdd?: string;
  graphics_card?: string;
  psu?: string;
  cabinet?: string;
  cooling_system?: string;
  additional_products?: string[];
  show_product?: boolean;
  image_urls?: { url: string }[];
}

interface ProductItem {
  product_id: string;
  product_image: { url: string }[];
  product_name: string;
}

interface ProductImage {
  url: string; // Assuming `url` is the property being used
}
const PreBuildPCSingleProduct: React.FC = () => {
  const { id } = useParams();
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // New state for mounted check
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0);
  const [resetRating, setResetRating] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number | null>(null); // State for average rating

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
    setIsMounted(true); // Set mounted flag to true once the component is loaded
  }, []);

  useEffect(() => {
    const fetchPreBuilds = async () => {
      try {
        const { data: preBuildData, error: preBuildError } = await supabase
          .from("pre_build")
          .select("*")
          .eq("id", id)
          .single();

        if (preBuildError) {
          throw preBuildError;
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("product_id, product_image, product_name");

        if (productsError) {
          throw productsError;
        }

        setProduct(preBuildData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", (error as Error).message);
      }
    };

    if (id) {
      fetchPreBuilds();
    }
    const fetchUserData = async () => {
      if (session) {
        setUser(session.user as User);
      }
    };
    setLoading(false);
    
    fetchUserData();
  }, [id, session]);

  useEffect(() => {
    const fetchAverageRating = async () => {
      if (!product) return; // Early exit if singleProduct is not defined
      try {
        const { data, error } = await supabase
          .from("pre_build")
          .select("user_rating")
          .eq("id", product.id)
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

    fetchAverageRating();

  }, [product])

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
    return (
      <>
        <Head>
          <title>Loading... | Modern Computer</title>
          <meta name="description" content="Loading pre-built PC details..." />
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  const getProductNameById = (productId: string | undefined) => {
    if (!productId) return "Not specified";
    const product = products.find(
      (product) => product.product_id === productId
    );
    return product
      ? truncateProductName(product.product_name)
      : "No product is added";
  };

  const getProductImageByID = (productId: string) => {
    const product = products.find(
      (product) => product.product_id === productId
    );
    if (product) {
      const imageUrl = product.product_image.find((img: { url: string }) =>
        img.url.includes("_first")
      )?.url;
      return imageUrl ? imageUrl : "";
    } else {
      return ""; // replace with your default image URL
    }
  };

  const truncateProductName = (productName: string, wordLimit: number = 6) => {
    const words = productName.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : productName;
  };

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };

  const handleBuyNow = async () => {
    if (product && isMounted) {
      try {
        // Store data in localStorage
        localStorage.setItem(
          "checkoutProduct",
          JSON.stringify({
            id: product.id,
            selling_price: product.selling_price,
          })
        );

        // Navigate to checkout page
        router.push(`/checkout-pre-build`);
      } catch (error) {
        console.error("Error processing buy now:", error);
      }
    }
  };

  if (!product) {
    return (
      <>
        <Head>
          <title>Product Not Found | Modern Computer</title>
          <meta name="description" content="The requested pre-built PC was not found." />
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  const productImages = product.image_urls || [];
  return (
    <>
      <Head>
        <title>{`${product.build_name} | Modern Computer`}</title>
        <meta
          name="description"
          content={`Buy ${product.build_name} - Custom Gaming PC with ${getProductNameById(product.processor)}${product.graphics_card ? `, ${getProductNameById(product.graphics_card)}` : ''}, ${product.ram_quantity}x${getProductNameById(product.ram)} RAM. Starting at ₹${product.selling_price}. Free shipping available.`}
        />
        
        {/* Basic Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://moderncomputer.in/pre-build/${id}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.build_name} | Modern Computer`} />
        <meta property="og:description" content={`High-performance custom gaming PC featuring ${getProductNameById(product.processor)}${product.graphics_card ? `, ${getProductNameById(product.graphics_card)}` : ''}. Buy now at ₹${product.selling_price}`} />
        <meta property="og:url" content={`https://moderncomputer.in/pre-build/${id}`} />
        {productImages[0]?.url && <meta property="og:image" content={productImages[0].url} />}
        <meta property="og:site_name" content="Modern Computer" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="product" />
        <meta name="twitter:title" content={`${product.build_name} | Modern Computer`} />
        <meta name="twitter:description" content={`High-performance custom gaming PC featuring ${getProductNameById(product.processor)}${product.graphics_card ? `, ${getProductNameById(product.graphics_card)}` : ''}. Buy now at ₹${product.selling_price}`} />
        {productImages[0]?.url && <meta name="twitter:image" content={productImages[0].url} />}
        
        {/* Product Specific Meta Tags */}
        <meta property="product:price:amount" content={product.selling_price.toString()} />
        <meta property="product:price:currency" content="INR" />
        {averageRating && <meta property="product:rating" content={averageRating.toString()} />}
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: product.build_name,
              image: productImages.map(img => img.url),
              description: `Custom Gaming PC featuring ${getProductNameById(product.processor)}${product.graphics_card ? `, ${getProductNameById(product.graphics_card)}` : ''}, ${product.ram_quantity}x${getProductNameById(product.ram)} RAM`,
              brand: {
                "@type": "Brand",
                name: "Modern Computer"
              },
              offers: {
                "@type": "Offer",
                url: `https://moderncomputer.in/pre-build/${id}`,
                priceCurrency: "INR",
                price: product.selling_price,
                availability: "https://schema.org/InStock",
                seller: {
                  "@type": "Organization",
                  name: "Modern Computer"
                }
              },
              ...(averageRating && {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: averageRating,
                  bestRating: "5",
                  worstRating: "1"
                }
              })
            })
          }}
        />
      </Head>
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full flex flex-row flex-wrap md:flex-nowrap items-center justify-center mb-14">
          <div className="w-full md:w-1/2 flex p-6 flex-col justify-center items-center relative">
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
            {productImages && productImages.length > 0 && (
              <Carousel
                showThumbs={true}
                autoPlay={true}
                interval={3000}
                infiniteLoop={true}
                showStatus={false}
              >
                {productImages.map((image: ProductImage, index: number) => (
                  <div key={index} className="relative">
                    <Image
                      src={image.url}
                      alt={`Product Image ${index}`}
                      width={1000}
                      height={1000}
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-6 p-6">
            <h1 className="font-extrabold bg-gradient-to-br from-pink-500 to-orange-400 text-center text-transparent inline-block text-3xl bg-clip-text">
              {product.build_name}
            </h1>

            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/processor/processor.png"
                  className="w-8 h-8"
                  alt=""
                  width={500}
                  height={500}
                />
                <h1 className="text-xl font-bold">Processor: </h1>
              </div>
              <div
                onClick={() => {
                  router.push(`/product/${product.processor}`);
                }}
                className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
              >
                <Image
                  src={getProductImageByID(product.processor)}
                  className="w-8 h-8 rounded-full"
                  alt=""
                  width={500}
                  height={500}
                />
                <p className="text-sm font-semibold hover:text-indigo-600">
                  {getProductNameById(product.processor)}
                </p>
              </div>
            </div>

            {product.motherboard && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/motherboard/motherboard.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Motherboard: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.motherboard}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.motherboard)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.motherboard)}
                  </p>
                </div>
              </div>
            )}
            {product.ram && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/RAM/RAM.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">RAM: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.ram}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.ram)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.ram)}
                  </p>
                </div>
                <p className="text-medium font-bold">X{product.ram_quantity}</p>
              </div>
            )}
            {product.ssd && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SSD/ssd.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">SSD: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.ssd}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.ssd)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.ssd)}
                  </p>
                </div>
              </div>
            )}
            {product.hdd && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/hard%20disk/hard_disk.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Hard Disk: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.hdd}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.hdd)}
                    className="w-8 h-8 rounded-full"
                    width={500}
                    height={500}
                    alt=""
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.hdd)}
                  </p>
                </div>
              </div>
            )}
            {product.graphics_card && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/graphics%20card/graphic_card.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Graphics Card: </h1>
                </div>
                <div
                  onClick={() => {
                    if (product.show_product) {
                      router.push(`/product/${product.graphics_card}`);
                    }
                  }}
                  className={`flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg ${
                    product.show_product
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Image
                    src={getProductImageByID(product.graphics_card)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.graphics_card)}
                  </p>
                </div>
              </div>
            )}
            {product.psu && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SMPS/power_supply.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Power Supply: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.psu}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.psu)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.psu)}
                  </p>
                </div>
              </div>
            )}
            {product.cabinet && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/cabinet/high_tower.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Cabinet: </h1>
                </div>
                <div
                  onClick={() => {
                    router.push(`/product/${product.cabinet}`);
                  }}
                  className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                >
                  <Image
                    src={getProductImageByID(product.cabinet)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.cabinet)}
                  </p>
                </div>
              </div>
            )}
            {product.cooling_system && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/cooler/cooler.png"
                    className="w-8 h-8"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <h1 className="text-xl font-bold">Cooling System: </h1>
                </div>
                <div
                  onClick={() => {
                    if (product.show_product) {
                      router.push(`/product/${product.cooling_system}`);
                    }
                  }}
                  className={`flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg ${
                    product.show_product
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Image
                    src={getProductImageByID(product.cooling_system)}
                    className="w-8 h-8 rounded-full"
                    alt=""
                    width={500}
                    height={500}
                  />
                  <p className="text-sm font-semibold hover:text-indigo-600">
                    {getProductNameById(product.cooling_system)}
                  </p>
                </div>
              </div>
            )}
            {product.additional_products && (
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/gifts/gift_box.png"
                    className="w-8 h-8"
                    width={500}
                    height={500}
                    alt=""
                  />
                  <h1 className="text-xl font-bold">Gift Items: </h1>
                </div>
                {product.additional_products &&
                product.additional_products.length > 0 ? (
                  product.additional_products.map((item: string, index: number) => (
                    <div key={item}
                      onClick={() => {
                        router.push(`/product/${item}`);
                      }}
                      className="flex gap-2 p-2 justify-center items-center bg-white/50 custom-backdrop-filter rounded-lg cursor-pointer"
                    >
                      <Image
                        src={getProductImageByID(item)}
                        className="w-8 h-8 rounded-full"
                        width={200}
                        height={200}
                        alt=""
                      />
                      <p
                        key={index}
                        className="text-sm font-semibold hover:text-indigo-600"
                      >
                        {getProductNameById(item)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No additional products</p>
                )}
              </div>
            )}
            <div className="flex gap-2 justify-start items-center">
              {/* Rating Component */}
              <Stars rating={averageRating ?? 0} />{" "}
              <p className="text-xs font-bold">
                {averageRating !== null ? averageRating.toFixed(1) : "No Reviews"}
              </p>
              {/* Stars component for average rating */}
            </div>
            <div className="flex gap-5">
              <p className="font-extrabold text-xl">
                &#x20B9;{product.selling_price}
              </p>
            </div>
            <div className="w-full flex gap-10">
              {/* <button
                  className="bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button> */}
              <button
                className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
          <ToastContainer position="bottom-center" />
        </div>
        <div className="flex flex-col justify-center items-center gap-4 pb-8">
          <h1 className="font-bold text-xl text-center">
            Want to say something about{" "}
            <span className="text-indigo-500">this product?</span>
          </h1>
          {/* Rating Component */}
          <RatingForPBPCProduct
            onRatingChange={handleRatingChange}
            resetRating={resetRating}
          />
          {/* CharacterCounterInput Component */}
          <CharacterCounterInputForPBPCProduct
            user={user}
            rating={rating}
            onResetRating={handleResetRating}
            productId={product.id}
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-4 pb-12">
          <h1 className="font-bold text-xl text-center">
            What people think about{" "}
            <span className="text-indigo-500">this product?</span>
          </h1>

          <SinglePBPCProductReviews productId={product.id} />
        </div>
      </div>
    </>
  );
};

export default PreBuildPCSingleProduct;