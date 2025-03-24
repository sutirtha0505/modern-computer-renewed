"use client"
import React, { useEffect, useState } from 'react'
import HeaderCart from './HeaderCart'
import CustomerDetails from './CustomerDetails'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import CartFinalCheckOut from './CartFinalCheckOut'
import { User } from '@supabase/supabase-js'

const CheckOutCart = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/SignIn');
        } else {
          setUser(user);
          console.log('User ID:', user.id);  // Print user ID
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full h-full flex flex-col justify-center items-center gap-6'>
      <HeaderCart />
      <div className='w-full pt-16'>
        <h1 className='text-2xl font-bold text-center'>
          Checkout for <span className='text-indigo-500'>Cart Items</span>
        </h1>
        {user && <CustomerDetails userId={user.id} />} {/* Pass user.id to CustomerDetails */}
        {user && <CartFinalCheckOut userId = {user.id} />}
      </div>
    </div>
  )
}

export default CheckOutCart;
