"use client";
import React from "react";
import Sideheader from "@/Components/Sideheader";

const UserProfile = () => {
  return (
    <div className='bg-gray-300 grid grid-cols-4 '>
      <Sideheader/>
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-6 col-span-3">
        {/* Profile Card */}
        <div className="bg-white flex flex-col md:flex-row items-center md:items-start p-6 md:p-10 rounded-2xl shadow-2xl shadow-black max-w-4xl w-full">

          {/* LEFT - User Image */}
          <div className="flex-1 flex justify-center mb-6 md:mb-0">
            <img
              src="/assets/user-placeholder.jpg"
              alt="User"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg"
            />
          </div>

          {/* RIGHT - User Info */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-4">
            {/* Name */}
            <div>
              <p className="text-gray-700 text-lg sm:text-xl md:text-2xl font-semibold">John Doe</p>
            </div>

            {/* College Name */}
            <div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">ABC College of Engineering</p>
            </div>

            {/* Email */}
            <div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">johndoe@example.com</p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">+91 9876543210</p>
            </div>

            {/* Edit Profile Button */}
            <button className="mt-4 bg-white border border-black rounded-lg px-6 py-3 hover:shadow-xl active:scale-95 transition flex items-center justify-center text-gray-700 font-medium">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
