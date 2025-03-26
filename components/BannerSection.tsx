"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

const BannerSection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 4000;

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase.storage
      .from("product-image")
      .list("banners", { limit: 100 });

    if (error) {
      console.error("Error fetching gallery images:", error);
      return;
    }

    if (data) {
      const imageUrls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from("product-image")
          .getPublicUrl(`banners/${file.name}`);
        const publicUrl = publicUrlData.publicUrl;
        return { name: file.name, url: publicUrl };
      });
      setGalleryImages(imageUrls);
    }
  };

  // Start the autoplay interval
  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        galleryImages.length ? (prevIndex + 1) % galleryImages.length : 0
      );
    }, delay);
  };

  // Stop the autoplay interval
  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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
  }, [galleryImages]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    // Restart autoplay after manual change
    stopAutoplay();
    startAutoplay();
  };

  return (
    <div className="flex flex-col items-center bg-amber-200">
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
                className="absolute top-0 left-0 w-full h-full transition-opacity duration-300 bg-green-300"
                style={{ opacity: index === currentIndex ? 1 : 0 }}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  className="w-full h-full rounded-lg shadow-lg"
                  priority
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
