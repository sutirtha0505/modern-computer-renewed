"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer here
import { supabase } from "@/lib/supabaseClient";
import { ImageUp, X } from "lucide-react";
import 'react-toastify/dist/ReactToastify.css'; // Make sure this is imported
import Image from "next/image";

interface HeroSectionData {
  hero_paragraph: string;
  hero_button_link: string;
  hero_image?: string; // Optional because it might not always be present
}

const EditHeroSection: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [paragraph, setParagraph] = useState("");
  const [link, setLink] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleUpload = async () => {
    if (!paragraph || !link) {
      toast.error("Paragraph and link are required");
      return;
    }

    try {
      let imageUrl = null;

      // Upload image to Supabase storage if an image is selected
      if (image) {
        const { error: uploadError } = await supabase.storage
          .from("product-image")
          .upload(`Hero/${image.name}`, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-image")
          .getPublicUrl(`Hero/${image.name}`);

        if (!publicUrlData) {
          throw new Error("Unable to get public URL");
        }

        imageUrl = publicUrlData.publicUrl;
      }

      // Prepare the data to be saved
      const dataToSave: HeroSectionData = {
        hero_paragraph: paragraph,
        hero_button_link: link,
      };

      if (imageUrl) {
        dataToSave.hero_image = imageUrl;
      }

      // Save data to Supabase table
      const { error: dbError } = await supabase.from("hero_section").upsert(dataToSave);

      if (dbError) {
        throw dbError;
      }

      // Show success toast
      toast.success("Hero section updated perfectly");

      // Clear the form after showing the toast
      setImage(null);
      setParagraph("");
      setLink("");
    } catch (error) {
      console.error("Error updating hero section:", error);
      toast.error("Failed to update hero section");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="font-bold text-3xl text-center">
        Update <span className="text-indigo-600">Hero section</span> from here
      </h1>
      <div className="w-80 h-[400px] flex flex-col justify-center items-center gap-5 rounded-lg bg-slate-700 p-4 relative">
        <div
          {...getRootProps()}
          className="w-28 h-28 border-2 border-dashed border-white rounded-lg flex justify-center items-center cursor-pointer relative"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here...</p>
          ) : image ? (
            <>
              <Image
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="h-full w-full object-cover rounded-lg"
                width={200}
                height={200}
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 p-1 text-red-500 hover:bg-red-500 hover:text-white rounded-full"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <ImageUp className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm text-white font-bold">
            Hero Section Paragraph:
          </label>
          <textarea
            className="w-full h-20 p-2 bg-transparent resize-none border-b-2 border-white text-white outline-none"
            placeholder="Enter paragraph for hero section..."
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="link" className="text-sm text-white font-bold">
            Hero Section Link:
          </label>
          <input
            type="url"
            className="w-full p-2 bg-transparent border-b-2 border-white text-white outline-none"
            placeholder="Enter link for 'Know more' button..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />
        </div>
        <button
          onClick={handleUpload}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          Save
        </button>
      </div>
      {/* Render ToastContainer here */}
      <ToastContainer />
    </div>
  );
};

export default EditHeroSection;
