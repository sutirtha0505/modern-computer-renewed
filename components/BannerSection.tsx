"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const BannerSection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

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

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    // Loop through each slide and update opacity based on its relative position
    emblaApi.slideNodes().forEach((slide, index) => {
      const slideProgress = emblaApi.scrollSnapList()[index] - emblaApi.scrollProgress();
      const opacity = 1 - Math.abs(slideProgress);
      slide.style.opacity = opacity.toString();
    });
  }, [emblaApi]);

  useEffect(() => {
    fetchGalleryImages();
    if (emblaApi) {
      emblaApi.on("scroll", onScroll);
      emblaApi.on("select", onScroll);
      onScroll(); // Initialize opacity on mount
    }
  }, [emblaApi, onScroll]);

  return (
    <div className="flex flex-col items-center ">
      {galleryImages.length > 0 && (
        <>
          {/* Embla Carousel with absolute positioning for fade effect */}
          <div className="embla relative w-full h-80 overflow-hidden" ref={emblaRef}>
            <div className="embla__container relative w-full h-full">
              {galleryImages.map((image, index) => (
                <div
                  className="embla__slide absolute top-0 left-0 w-full h-full transition-opacity duration-300"
                  key={index}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    layout="fill"
                    objectFit="contain" // Changed from 'cover' to 'contain'
                    objectPosition="center" // Centers the image
                    className="rounded-lg shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className="w-3 h-3 rounded-full mx-1 bg-gray-300 hover:bg-gray-500 transition duration-200"
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSection;
