"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BannerSection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<
    { name: string; url: string; product_link: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 4000;
  const router = useRouter();

  // Fetch images from the offer_banner table
  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from("offer_banner")
      .select("image_url, product_link");
    if (error) {
      console.error("Error fetching gallery images:", error);
      return;
    }
    if (data) {
      const imageUrls = data.map(
        (row: { image_url: string; product_link: string }) => ({
          name: row.image_url, // Using image_url as the image name
          url: row.image_url,
          product_link: row.product_link,
        })
      );
      setGalleryImages(imageUrls);
    }
  };

  // Start the autoplay interval
  const startAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        galleryImages.length > 0 ? (prevIndex + 1) % galleryImages.length : 0
      );
    }, delay);
  }, [galleryImages]);

  // Stop the autoplay interval
  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  useEffect(() => {
    if (galleryImages.length > 0) {
      startAutoplay();
    }
    return () => {
      stopAutoplay();
    };
  }, [galleryImages, startAutoplay, stopAutoplay]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    stopAutoplay();
    startAutoplay();
  };

  return (
    <div className="flex flex-col items-center">
      {galleryImages.length > 0 && (
        <>
          <div
            className="relative w-full h-80 overflow-hidden"
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
          >
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
                style={{ opacity: index === currentIndex ? 1 : 0 }}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  className="w-full h-full rounded-lg shadow-lg cursor-pointer"
                  priority
                  onClick={() => {
                    router.push(image.product_link);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full mx-1 transition duration-200 ${
                  index === currentIndex ? "bg-gray-500" : "bg-gray-300"
                }`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSection;
