import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";
import { ImageUp, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const EditBannerSection: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [galleryImages, setGalleryImages] = useState<
    { name: string; url: string }[]
  >([]);
  const [productLink, setProductLink] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleRemove = (file: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select an image to upload.");
      return;
    }
    if (!productLink) {
      toast.error("Please provide a product link.");
      return;
    }

    const file = selectedFiles[0];
    const filePath = `banners/${file.name}`;

    // 1. Upload image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-image")
      .upload(filePath, file);
    

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      toast.error("Error uploading image.");
      return;
    } else {
      console.log("Upload successful:", uploadData);
    }

    // 2. Retrieve public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("product-image")
      .getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    // 3. Insert data into offer_banner table
    const offer_banner_id = crypto.randomUUID();
    const { error: dbError } = await supabase
      .from("offer_banner")
      .insert([{ offer_banner_id, image_url: imageUrl, product_link: productLink }]);

    if (dbError) {
      console.error("Error inserting record:", dbError);
      toast.error("Error saving banner info.");
    } else {
      toast.success("Banner uploaded successfully!");
      setSelectedFiles([]);
      setProductLink("");
      fetchGalleryImages();
    }
  };

  const dropzoneOptions = {
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  };

  const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

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
        return { name: file.name, url: publicUrlData.publicUrl };
      });
      setGalleryImages(imageUrls);
    }
  };

  // Updated handleDelete function with additional logic
  const handleDelete = async (fileName: string, imageUrl: string) => {
    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from("product-image")
      .remove([`banners/${fileName}`]);

    if (error) {
      toast.error("Error deleting image: " + error.message, {
        position: "bottom-center",
      });
    } else {
      // New logic: Delete from offer_banner table where image_url matches
      const { error: dbError } = await supabase
        .from("offer_banner")
        .delete()
        .eq("image_url", imageUrl);

      if (dbError) {
        toast.error("Error deleting banner record: " + dbError.message, {
          position: "bottom-center",
        });
      } else {
        toast.success("Image and banner record deleted successfully!", {
          position: "bottom-center",
        });
      }
      fetchGalleryImages();
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[550px] h-[750px] rounded-md bg-slate-800 p-4">
      <ToastContainer />
      <h1 className="text-xl font-extrabold text-center">
        Add images of <span className="text-indigo-600">your Banner section</span>
      </h1>
      <div
        {...getRootProps()}
        className="w-40 h-40 mt-4 rounded-full border-2 border-dashed flex items-center justify-center outline-none cursor-pointer"
      >
        <input {...getInputProps()} />
        <ImageUp className="w-15 h-15" />
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-4 h-40 flex items-center justify-center">
          {selectedFiles.map((file) => (
            <div key={file.name} className="relative w-20 h-20">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover rounded-md"
                width={1920}
                height={1080}
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleRemove(file)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 w-full p-6">
        <label htmlFor="productLink">Product Link:</label>
        <input
          type="text"
          placeholder="Enter Product Link for this banner image"
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          className="w-full p-2 rounded-md border-2 border-white border-solid"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
      >
        Submit
      </button>
      <div className="flex justify-center items-center w-full gap-2 p-2 flex-col">
        {galleryImages.length === 0 && (
          <div className="text-center text-gray-500">No Banners uploaded yet.</div>
        )}
        {galleryImages.length > 0 && (
          <h1 className="text-center font-bold">Uploaded Banners:</h1>
        )}
        <div className="flex flex-wrap w-full justify-center items-center gap-2">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative flex-shrink-0 w-32 h-32">
              <Image
                src={image.url}
                alt={`Gallery image ${index}`}
                className="w-full h-full object-fill rounded-md"
                width={1920}
                height={1080}
              />
              <button
                className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleDelete(image.name, image.url)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditBannerSection;
