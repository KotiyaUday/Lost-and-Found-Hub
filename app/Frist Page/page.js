"use client"
import Link from 'next/link';
import React from 'react';

const User = () => {
  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-6xl overflow-hidden items-stretch">

        {/* Image Section */}
        <div className="md:flex-1 w-full h-64 md:h-auto">
          <img
            src="/assets/registration.jpg"
            alt="Registration"
            className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          />
        </div>

        {/* Text + Button Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-6 md:p-10">
          <p className="text-justify text-base sm:text-lg md:text-lg mb-6">
            The sun dipped below the horizon, painting the sky in shades of orange and pink. 
            A gentle breeze rustled through the trees, carrying the scent of rain. 
            Somewhere in the distance, a dog barked, breaking the peaceful silence. 
            It was one of those evenings that felt like the world had slowed down just for a moment.
          </p>

          <Link
            href="/User"
            className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 hover:shadow-xl active:scale-95 transition-all duration-200 w-full max-w-xs"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-black text-sm sm:text-base md:text-base">
              Sign in with Google
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default User;
