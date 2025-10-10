"use client";
import React from "react";
import { User, Mail, Phone, Building } from "lucide-react";
import Sideheader from "@/Components/Sideheader";

const UserProfile = () => {
  // Sample posts
  const posts = [
    "https://via.placeholder.com/200",
    "https://via.placeholder.com/201",
    "https://via.placeholder.com/202",
    "https://via.placeholder.com/203",
    "https://via.placeholder.com/204",
    "https://via.placeholder.com/205",
    "https://via.placeholder.com/206",
    "https://via.placeholder.com/207",
  ];

  return (
    <>
    <div className="bg-gray-100 grid grid-cols-4 min-h-screen">
        <Sideheader />

    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center">
      
      {/* Profile Section */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center mt-6 px-4">
        
        {/* LEFT SIDE - Image */}
        <div className="flex justify-center md:justify-start md:w-1/3 mb-6 md:mb-0">
          <img
            src="https://via.placeholder.com/150"
            alt="User Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-500"
          />
        </div>

        {/* RIGHT SIDE - Details */}
        <div className="flex-1 flex flex-col md:pl-8 items-center md:items-start space-y-3 text-gray-800">
          <div className="flex items-center space-x-3">
            <User className="text-blue-600 w-5 h-5" />
            <span className="font-semibold text-2xl">John Doe</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Building className="text-blue-600 w-5 h-5" />
            <span>Marwadi University</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Mail className="text-blue-600 w-5 h-5" />
            <span>johndoe@example.com</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Phone className="text-blue-600 w-5 h-5" />
            <span>+91 9876543210</span>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-3">
             <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Buttons */}
      <div className="flex justify-center space-x-50 mt-18">
         <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200">
          Lost Items
        </button>
        <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200">
          Found Items
        </button>
         <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200">
          Total Items
        </button>
      </div>

      {/* Posts Section */}
      <div className="w-full max-w-6xl mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
        {posts.map((post, index) => (
          <img
            key={index}
            src={post}
            alt={`Post ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
          />
        ))}
      </div>
    </div>
    </div>
    </>
  );
};

export default UserProfile;