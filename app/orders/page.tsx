"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import OrdersForU from '@/components/OrdersForU';
import { User } from '@supabase/supabase-js';

const OrdersPage = () => {
    const [user, setUser] = useState<User|null>(null);
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
      <div className='w-full pt-20'>
        <h1 className='text-3xl font-bold text-center'>
          Check Your <span className='text-indigo-500'>Ordered Products</span>
        </h1>
        {user && <OrdersForU userId={user.id} />} {/* Pass user.id to CustomerDetails */}
      </div>
    </div>
  )
}

export default OrdersPage