"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import LoadingScreen from "./LoadingScreen";

const RecentProductsShow: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: lastItemRef } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Fetch images from Supabase storage
  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("product-image")
        .list("recent_products", { limit: 100 });

      if (error) {
        console.error("Error fetching gallery images:", error);
        return;
      }

      if (data) {
        const imageUrls = data.map((file) => {
          const { data: publicUrlData } = supabase.storage
            .from("product-image")
            .getPublicUrl(`recent_products/${file.name}`);
          return { name: file.name, url: publicUrlData.publicUrl };
        });
        setGalleryImages(imageUrls);
      }
    } catch (error) {
      console.error("Error in fetchGalleryImages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  // Auto scroll effect
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          // Reset to top when reaching bottom
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          // Smooth scroll down
          container.scrollBy({
            top: 1,
            behavior: 'smooth'
          });
        }
      }, 50); // Adjust speed by changing this value
    };

    startAutoScroll();

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, []);

  // Pause scroll on hover
  const handleMouseEnter = () => {
    if (containerRef.current) {
      containerRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.animationPlayState = 'running';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500">
          <LoadingScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2 h-full">
      {galleryImages.length > 0 && (
        <>
          <div 
            ref={containerRef}
            className="w-full h-72 overflow-hidden relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex flex-col animate-scroll">
              {galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  ref={index === galleryImages.length - 1 ? lastItemRef : undefined}
                  className="flex-none h-[300px] flex justify-center items-center"
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    className="object-contain"
                    width={2400}
                    height={400}
                    priority={index < 2}
                  />
                </div>
              ))}
              {/* Duplicate images for seamless loop */}
              {galleryImages.map((image, index) => (
                <div 
                  key={`duplicate-${index}`}
                  className="flex-none h-[300px] flex justify-center items-center"
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    className="object-contain"
                    width={2400}
                    height={400}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentProductsShow;
