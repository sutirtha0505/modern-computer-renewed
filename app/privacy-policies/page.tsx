'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const PrivacyPoliciespage = () => {
  const [privacyStatement, setPrivacyStatement] = useState("");
  const [refundStatement, setRefundStatement] = useState("");
  const [shippingStatement, setShippingStatement] = useState("");
  const [termsConditions, setTermsConditions] = useState("");

  useEffect(() => {
    fetchLastEntry();
  }, []);

  const fetchLastEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("privacy_policy")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const lastEntry = data[0];
        setPrivacyStatement(lastEntry.privacy_statement || "");
        setRefundStatement(lastEntry.refund_statement || "");
        setShippingStatement(lastEntry.shipping_statement || "");
        setTermsConditions(lastEntry.terms_n_conditions_statement || "");
      }
    } catch (error) {
      console.error("Error fetching privacy policy data:", error);
    }
  };

  return (
    <div className='w-full h-full min-h-screen flex flex-col justify-center items-center gap-8 p-8 pt-28'>
      <div className='w-[80%] rounded-lg shadow-lg p-8 bg-slate-600 dark:bg-slate-800 flex flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-indigo-600 text-center'>Privacy Policy</h2>
        <div 
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: privacyStatement }}
        />
      </div>

      <div className='w-[80%] rounded-lg shadow-lg p-8 bg-slate-600 dark:bg-slate-800 flex flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-indigo-600 text-center'>Refund Policy</h2>
        <div 
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: refundStatement }}
        />
      </div>

      <div className='w-[80%] rounded-lg shadow-lg p-8 bg-slate-600 dark:bg-slate-800 flex flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-indigo-600 text-center'>Shipping Policy</h2>
        <div 
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: shippingStatement }}
        />
      </div>

      <div className='w-[80%] rounded-lg shadow-lg p-8 bg-slate-600 dark:bg-slate-800 flex flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-indigo-600 text-center'>Terms and Conditions</h2>
        <div 
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: termsConditions }}
        />
      </div>
    </div>
  );
};

export default PrivacyPoliciespage;