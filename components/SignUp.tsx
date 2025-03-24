"use client";
import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";
import Image from "next/image";

export const SignUp = () => {
  return (
    <div className="w-96 relative items-center p-10 flex flex-col border rounded-md">
        <Image src={"https://supabase.moderncomputer.in/storage/v1/object/public/product-image/logo/logo.jpg"} width={100} height={100} alt="logo" className="border rounded-full absolute -top-20" />
      <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    theme="dark"
    providers={['google']}
    localization={{
        variables: {
          sign_in: {
            email_label: 'E-Mail',
            password_label: 'Password',
          },
        },
      }}
      socialLayout="horizontal"
      view="sign_up"
  />
    </div>
  );
};
