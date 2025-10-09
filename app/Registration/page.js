"use client";
import React from "react";

const Registration = () => {
  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center px-4">
      {/* Outer Card */}
      <div className="bg-white flex flex-col md:flex-row items-center md:items-stretch p-6 md:p-10 rounded-2xl shadow-2xl shadow-black max-w-5xl w-full">
        
        {/* LEFT SIDE - IMAGE */}
        <div className="flex-1 flex justify-center mb-6 md:mb-0">
          <img
            src="/assets/registration.jpg"
            alt="Registration"
            className="w-64 sm:w-80 md:w-96 lg:w-[420px] object-contain"
          />
        </div>

        {/* RIGHT SIDE - TEXT + BUTTON */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center">
          <p className="p-4 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed text-justify">
            The sun dipped below the horizon, painting the sky in shades of orange and pink. A gentle breeze rustled through the trees, carrying the scent of rain. Somewhere in the distance, a dog barked, breaking the peaceful silence.
          </p>

          <button className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 mt-5 hover:shadow-xl active:scale-95 transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-black">
              Sign in with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
