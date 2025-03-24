"use client";
// components/CharacterCounterInput.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  // Add other fields if needed, e.g., email, name, etc.
}

interface CharacterCounterInputForPBPCProductProps {
  user: User | null; // Use the User type and allow null for cases where the user is not logged in
  rating: number;
  onResetRating: () => void;
  productId: string;
}


const CharacterCounterInputForPBPCproduct: React.FC<
  CharacterCounterInputForPBPCProductProps
> = ({
  user,
  rating,
  onResetRating,
  productId, // Add productId prop
}) => {
  const [inputValue, setInputValue] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null); // Store profile photo URL
  const maxChars = 300;
  // Fetch profile photo from the 'profile' table
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profile") // Fetch from the 'profile' table
          .select("profile_photo")
          .eq("id", user.id) // Match the user.id with the id column
          .single();

        if (error) {
          console.error("Error fetching profile photo:", error);
          toast.error("Error fetching profile photo.");
        } else {
          setProfilePhoto(data?.profile_photo || null); // Set the profile photo URL
        }
      }
    };

    fetchProfilePhoto();
  }, [user?.id]); // Fetch when user.id changes

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= maxChars) {
      setInputValue(value);
    }
  };
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("User:", user); // Debug: Log the user object
    console.log("Product Id:", productId); // Debug: Log the product

    if (!user) {
      toast.error("You Forgot to Log In. Do it Right now.");
      // wait for 4 seconds
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Redirect to SignIn page if user is not logged in
      router.push("/SignIn");
      return;
    }

    try {
      // Fetch the current user_rating array from the products table
      const { data: productData, error: fetchError } = await supabase
        .from("pre_build")
        .select("user_rating")
        .eq("id", productId) // Use productId from props
        .single();

      if (fetchError) {
        console.error("Fetch Error:", fetchError); // Debug: Log any fetching errors
        toast.error("Error fetching product data: " + fetchError.message);
        return;
      }

      // Create the new review object
      const newReview = {
        user: user.id, // Use user.id or any identifier for the user
        review: rating,
        comment: inputValue,
        time: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
          .toISOString()
          .replace("T", " ")
          .slice(0, 19), // Convert to IST and format
      };

      // Append the new review to the existing user_rating array
      const updatedUserRating = [
        ...(productData?.user_rating || []),
        newReview,
      ];

      // Update the products table with the new user_rating array
      const { error: updateError } = await supabase
        .from("pre_build")
        .update({ user_rating: updatedUserRating })
        .eq("id", productId); // Use productId from props

      if (updateError) {
        console.error("Supabase Error:", updateError); // Debug: Log any Supabase errors
        toast.error("Error adding review: " + updateError.message);
      } else {
        toast.success("Thanks for your feedback.");
        setInputValue("");
        onResetRating(); // Reset the rating
      }
    } catch (error: unknown) {
      console.error("Catch Error:", error); // Log the error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Error adding review: " + errorMessage);
    }    
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative gap-4 w-full p-10 md:p-4 justify-center items-center h-full flex"
    >
      <Image
        src={profilePhoto || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/user.png"} // Fallback to a default image if profilePhoto is not available
        alt="Profile"
        className="rounded-full w-12 h-12"
        width={500}
        height={500}
      />
      <div className="relative h-full w-96 justify-center items-center flex flex-col">
        <textarea
          value={inputValue}
          onChange={handleChange}
          rows={3}
          className="w-full placeholder:bg-center h-full p-2 bg-transparent border-b-1 border-indigo-600 resize-none outline-none focus:shadow-lg focus:shadow-indigo-600 text-sm"
          placeholder="Type here ..."
          required
        />
        <div className="absolute bottom-2 right-2 text-gray-500 text-sm">
          {inputValue.length}/{maxChars}
        </div>
      </div>
      <button
        type="submit"
        className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 p-4 rounded-md text-l hover:text-l hover:font-bold duration-200"
      >
        <SendHorizonal />
      </button>
    </form>
  );
};

export default CharacterCounterInputForPBPCproduct;
