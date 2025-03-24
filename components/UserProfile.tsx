"use client";
import { useDropzone } from "react-dropzone";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const UserProfile = () => {
  const params = useParams();
  const { id } = params;
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [phoneNo, setPhoneNo] = useState<string | null>(null);
  const [houseNo, setHouseNo] = useState<string | null>(null);
  const [streetName, setStreetName] = useState<string | null>(null);
  const [landmark, setLandmark] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current logged-in user's ID
        const {
          data: { user },
        } = await supabase.auth.getUser();

if (!user || user && user.id !== id) {
          // If the user ID does not match the profile ID, redirect to /SignIn
          router.push("/SignIn");
          return;
        }

        // If the IDs match, fetch the profile data
        if (id) {   
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profile")
              .select(
                "email, phone_no, customer_house_no, customer_house_street, customer_house_landmark, customer_house_city, customer_house_pincode, profile_photo"
              )
              .eq("id", id)
              .single();

            console.log(profileData); // Check if email is being fetched

            if (profileError) {
              console.error("Error fetching profile data:", profileError);
            } else {
              setEmail(profileData?.email || null);
              setPhoneNo(profileData?.phone_no || null);
              setHouseNo(profileData?.customer_house_no || null);
              setStreetName(profileData?.customer_house_street || null);
              setLandmark(profileData?.customer_house_landmark || null);
              setCity(profileData?.customer_house_city || null);
              setPinCode(profileData?.customer_house_pincode || null);
              setPhotoUrl(profileData?.profile_photo || null);
            }

            // Fetch user name from supabase.auth
            if (user) {
              setName(user.user_metadata.name);
            }
          } catch (error) {
            console.error("Unexpected error fetching user data:", error);
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setProfilePhoto(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (id && name) {
      try {
        let uploadedPhotoUrl = photoUrl;

        // Upload the profile photo if there's a new one
        if (profilePhoto) {
          const { error: uploadError } = await supabase.storage
            .from("product-image")
            .upload(`profile_photos/${id}/${profilePhoto.name}`, profilePhoto);

          if (uploadError) {
            console.error("Error uploading photo:", uploadError);
            toast.error("Error uploading photo. Please try again.");
            return;
          }

          const { data: publicUrl } = supabase.storage
            .from("product-image")
            .getPublicUrl(`profile_photos/${id}/${profilePhoto.name}`);

          uploadedPhotoUrl = publicUrl.publicUrl;
        }
        const { error } = await supabase
          .from("profile")
          .update({
            customer_name: name,
            phone_no: phoneNo,
            customer_house_no: houseNo,
            customer_house_street: streetName,
            customer_house_landmark: landmark,
            customer_house_city: city,
            customer_house_pincode: pinCode,
            profile_photo: uploadedPhotoUrl,
          })
          .eq("id", id);

        if (error) {
          console.error("Error updating profile:", error);
          toast.error("Error updating information. Please try again.");
        } else {
          toast.success("Your information has been updated successfully.");
          setTimeout(() => {
            router.push("/"); // Adjust the homepage route as needed
          }, 3000);
        }
      } catch (error) {
        console.error("Unexpected error updating profile:", error);
        toast.error("Unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col relative items-center justify-center">
      {/* Circular react dropzone here */}
      <div
        {...getRootProps()}
        className="w-28 h-28 rounded-full border-2 border-dashed border-white flex items-center justify-center cursor-pointer mb-4 overflow-hidden absolute -top-12 snap-center z-10 backdrop-blur-lg"
      >
        <input {...getInputProps()} />
        {profilePhoto ? (
          <Image
            src={URL.createObjectURL(profilePhoto)}
            alt="Profile"
            className="w-full h-full object-cover"
            width={500}
            height={500}
          />
        ) : photoUrl ? (
          <Image
            src={photoUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            height={500}
            width={500}
          />
        ) : (
          <Image
            src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/profile_display.png"
            alt=""
            className="w-10 h-10"
            height={500}
            width={500}
          />
        )}
      </div>

      <div className="p-6 mt-10 flex flex-col justify-center items-center gap-4 bg-gray-800 rounded-lg w-96 relative">
        <h1 className="font-extrabold bg-gradient-to-br from-pink-500 to-orange-400 text-center text-transparent inline-block text-3xl bg-clip-text">
          User Profile
        </h1>
        <div className="w-full">
          <div className="flex gap-3 items-center ">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/email.png"
              alt=""
              className="w-4 h-4"
              width={200}
              height={200}
            />
            <label htmlFor="email" className="text-xs font-bold">
              Email:
            </label>
          </div>

          <input
            id="email"
            type="text"
            value={email || ""}
            readOnly
            className="border-b bg-transparent text-white p-2 w-full outline-none cursor-not-allowed"
          />
        </div>
        <div className="w-full">
          <div className="flex gap-3 items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/profile.png"
              alt=""
              className="w-4 h-4"
              width={200}
              height={200}
            />

            <label htmlFor="name" className="text-xs font-bold">
              Name:
            </label>
          </div>
          <input
            id="name"
            type="text"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            className="border-b bg-transparent text-white p-2 w-full outline-none"
            required
          />
        </div>
        <div className="w-full">
          <div className="flex gap-3 items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/call.png"
              alt=""
              className="w-4 h-4"
              width={200}
              height={200}
            />
            <label htmlFor="phoneNo" className="text-xs font-bold">
              Phone No:
            </label>
          </div>
          <input
            id="phoneNo"
            type="number"
            value={phoneNo || ""}
            onChange={(e) => setPhoneNo(e.target.value)}
            required
            className="border-b bg-transparent text-white p-2 w-full outline-none"
          />
        </div>
        <div className="flex gap-2 w-full">
          <div className="w-1/3">
            <div className="flex gap-3 items-center">
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/house.png"
                alt=""
                className="w-4 h-4"
                width={200}
                height={200}
              />
              <label htmlFor="houseNo" className="text-xs font-bold">
                House No.:
              </label>
            </div>
            <input
              id="houseNo"
              type="text"
              value={houseNo || ""}
              onChange={(e) => setHouseNo(e.target.value)}
              className="border-b bg-transparent text-white p-2 w-full outline-none"
              required
            />
          </div>
          <div className="w-2/3">
            <div className="flex gap-3 items-center">
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/streets.png"
                alt=""
                className="w-4 h-4"
                width={200}
                height={200}
              />
              <label htmlFor="streetName" className="text-xs font-bold">
                Street Name:
              </label>
            </div>
            <input
              id="streetName"
              type="text"
              value={streetName || ""}
              onChange={(e) => setStreetName(e.target.value)}
              required
              className="border-b bg-transparent text-white p-2 w-full outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="w-1/3">
            <div className="flex gap-3 items-center">
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/landmark.png"
                alt=""
                className="w-4 h-4"
                width={200}
                height={200}
              />
              <label htmlFor="landmark" className="text-xs font-bold">
                Landmark:
              </label>
            </div>
            <input
              id="landmark"
              type="text"
              value={landmark || ""}
              onChange={(e) => setLandmark(e.target.value)}
              className="border-b bg-transparent text-white p-2 w-full outline-none"
              required
            />
          </div>
          <div className="w-1/3">
            <div className="flex gap-3 items-center">
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/architecture-and-city.png"
                alt=""
                className="w-4 h-4"
                width={200}
                height={200}
              />
              <label htmlFor="city" className="font-bold text-xs">
                City:
              </label>
            </div>
            <input
              id="city"
              type="text"
              value={city || ""}
              onChange={(e) => setCity(e.target.value)}
              required
              className="border-b bg-transparent text-white p-2 w-full outline-none"
            />
          </div>
          <div className="w-1/3">
            <div className="flex gap-3 items-center">
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/mailbox.png"
                alt=""
                className="w-4 h-4"
                width={200}
                height={200}
              />
              <label htmlFor="pinCode" className="text-xs font-bold">
                Pin Code:
              </label>
            </div>
            <input
              id="pinCode"
              type="number"
              value={pinCode || ""}
              onChange={(e) => setPinCode(e.target.value)}
              required
              className="border-b bg-transparent text-white p-2 w-full outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
        >
          Save
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserProfile;
