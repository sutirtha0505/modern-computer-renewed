import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";
import { ImageUp } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Image from "next/image";

const EditAboutSection: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [yt1, setYt1] = useState("");
  const [yt2, setYt2] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImage(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  const handleSave = async () => {
    let imageUrl: string | null = null;

    if (image) {
      // Check if the image already exists in the About folder
      const { data: listData, error: listError } = await supabase.storage
        .from("product-image")
        .list("About");

      if (listError) {
        toast.error("Error listing images: " + listError.message);
        return;
      }

      const existingImage = listData?.find((img) => img.name === image.name);

      if (existingImage) {
        // Delete the existing image
        const { error: deleteError } = await supabase.storage
          .from("product-image")
          .remove([`About/${existingImage.name}`]);

        if (deleteError) {
          toast.error("Error deleting existing image: " + deleteError.message);
          return;
        }
      }

      // Upload the new image
      const { error: uploadError } = await supabase.storage
        .from("product-image")
        .upload(`About/${image.name}`, image);

      if (uploadError) {
        toast.error("Error uploading image: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-image")
        .getPublicUrl(`About/${image.name}`);
      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("about").insert({
      about_image: imageUrl,
      about_description: description,
      about_yt_1: yt1,
      about_yt_2: yt2,
    });

    if (error) {
      toast.error("Error inserting data: " + error.message);
    } else {
      toast.success("Uploaded Successfully");
      setImage(null);
      setDescription("");
      setYt1("");
      setYt2("");
    }
  };

  return (
    <div className="flex flex-col p-4 rounded-md bg-slate-800 custom-backdrop-filter w-96 h-[550px] items-center justify-center gap-3">
      <ToastContainer />
      <h1 className="text-xl font-extrabold text-center">
        Edit the <span className="text-indigo-600">About </span>section
      </h1>
      <div className="flex flex-col gap-2 justify-center items-center w-full">
        <div
          {...getRootProps({ className: "dropzone" })}
          className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center outline-none"
        >
          <input {...getInputProps()} />
          {image ? (
            <Image
              src={URL.createObjectURL(image)}
              alt="Uploaded"
              className="w-full h-full rounded-full"
              width={500}
              height={500}
            />
          ) : (
            <ImageUp />
          )}
        </div>
        <label
          htmlFor="Description"
          className="text-left w-full text-xs font-bold"
        >
          Description
        </label>
        <textarea
          rows={4}
          className="resize-none border rounded-md p-2 w-full bg-transparent text-sm outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add business description"
        />
        <label htmlFor="yt1" className="text-left w-full text-xs font-bold">
           Embeded URL of first YouTube video(1):
        </label>
        <input
          type="text"
          className="border-b p-2 bg-transparent w-full text-sm outline-none"
          value={yt1}
          onChange={(e) => setYt1(e.target.value)}
          placeholder="YouTube video 1 URL"
        />
        <label htmlFor="yt2" className="text-left w-full text-xs font-bold">
        Embeded URL of first YouTube video(2):
        </label>
        <input
          type="text"
          className="border-b p-2 bg-transparent w-full text-sm outline-none"
          value={yt2}
          onChange={(e) => setYt2(e.target.value)}
          placeholder="YouTube video 2 URL"
        />
        <button
          onClick={handleSave}
          className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditAboutSection;
