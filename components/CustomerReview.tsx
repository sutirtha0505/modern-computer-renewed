"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import CharacterCounterInput from './CharacterCounterInput';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Rating from './Rating';
import { User } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';

const CustomerReview: React.FC = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0);
  const [resetRating, setResetRating] = useState<boolean>(false);

  // Update user if session is available
  useEffect(() => {
    if (session) {
      setUser(session.user as User);
    }
  }, [session]);

  // Mark loading as false when the component mounts (i.e. when the UI renders)
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleResetRating = () => {
    setRating(0);
    setResetRating(true);
  };

  useEffect(() => {
    if (resetRating) {
      setResetRating(false);
    }
  }, [resetRating]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full h-full gap-0 md:gap-10 text-center flex justify-center items-center flex-col pb-28 lg:pb-0'>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className='font-bold text-3xl'>
        Share <span className='text-indigo-600'>Your Experience</span> with Us
      </h1>
      <div className='flex gap-4 justify-center items-center flex-wrap'>
        <Image 
          src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Review/bendy-person-rates-a-product-or-service.gif" 
          width={1000} 
          height={1000} 
          alt="Review Image" 
          className='w-64 h-64 md:w-96 md:h-96'
          unoptimized
        />
        <div className='flex flex-col p-4 w-full gap-3 h-64 md:w-96 md:h-96 rounded-md justify-between items-center'>
          <Rating onRatingChange={setRating} resetRating={resetRating} />
          <CharacterCounterInput user={user} rating={rating} onResetRating={handleResetRating} />
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;
