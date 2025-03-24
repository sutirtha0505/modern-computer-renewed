"use client"
import CustomPCCombo from '@/components/CustomPCCombo';
import PreventAdminAccess from '@/components/PreventAdminAccess';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { BlinkBlur } from 'react-loading-indicators';


const CustomPCComboPage = () => {
    const [user, setUser] = useState<User |null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile, error } = await supabase
            .from('profile')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile) {
            setRole(profile.role);
          } else if (error) {
            console.error('Error fetching profile:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  if (loading) {
    return (
    <div className='pt-16 w-full h-screen flex justify-center items-center'>
      <BlinkBlur
          color="#8a31cc"
          size="medium"
          text="Loading..."
          textColor="#8a31cc"
        />
    </div>
  );
  }

  if (user && role === 'admin') {
    return (
      <div className='pt-16 w-screen overflow-x-hidden pl-4 pr-4 pb-4 flex flex-col'>
        <CustomPCCombo />
      </div>
    );
  } else {
    return (
      <PreventAdminAccess />
    );
  }
};


export default CustomPCComboPage