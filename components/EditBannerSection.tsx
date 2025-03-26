import React, { useCallback, useEffect, useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleRemove = (file: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const handleUpload = async () => {
    const uploads = selectedFiles.map(async (file) => {
      const { data, error } = await supabase.storage
        .from("product-image")
        .upload(`banners/${file.name}`, file);

      if (error) {
        console.error("Error uploading file:", error);
        return null;
      }

      return data;
    });

    const results = await Promise.all(uploads);

    if (results.every((result) => result !== null)) {
      toast.success("The images are uploaded successfully!", {
        position: "bottom-center",
      });
      setSelectedFiles([]);
      fetchGalleryImages(); // Fetch the updated list of images after upload
    }
  };

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
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
        const publicUrl = publicUrlData.publicUrl;
        return { name: file.name, url: publicUrl };
      });
      setGalleryImages(imageUrls);
    }
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage
      .from("product-image")
      .remove([`banners/${fileName}`]);

    if (error) {
      toast.error("Error deleting image: " + error.message, {
        position: "bottom-center",
      });
    } else {
      toast.success("Image is deleted successfully!", {
        position: "bottom-center",
      });
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
        <ImageUp className="w-15 h-15"/>
      </div>
      {selectedFiles.length > 0 && (
        <>
          <div className="mt-4 h-40 overflow-y-scroll flex flex-wrap justify-center gap-4">
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
          <button
            onClick={handleUpload}
            className="mt-4 bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
          >
            Upload
          </button>
        </>
      )}
      <div className="h-64 flex justify-start items-center w-full gap-2 p-2 overflow-x-scroll">
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
              onClick={() => handleDelete(image.name)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditBannerSection;
