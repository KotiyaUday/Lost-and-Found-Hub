"use client";
import React from "react";
import { User, Mail, Phone, Building } from "lucide-react"; // icons

const UserProfile = () => {
  return (
    <div className="min-h-screen w-full bg-gray-200 flex flex-col md:flex-row">
      
      {/* LEFT SIDE - EMPTY AREA */}
      <div className="flex-1 hidden md:block"></div>

      {/* RIGHT SIDE - PROFILE PANEL */}
      <div className="w-full md:w-1/3 bg-white shadow-2xl p-8 flex flex-col items-center text-center md:text-left md:items-start space-y-6 rounded-t-2xl md:rounded-none md:rounded-l-3xl">
        
        {/* User Image */}
        <div className="flex flex-col items-center md:items-start w-full">
          <img
            src="https://via.placeholder.com/120"
            alt="User Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
        </div>

        {/* User Info */}
        <div className="w-full space-y-4 text-gray-700 text-base">
          
          {/* Name */}
          <div className="flex items-center space-x-3">
            <User className="text-blue-600 w-5 h-5" />
            <span className="font-semibold text-lg text-gray-800">John Doe</span>
          </div>

          {/* College */}
          <div className="flex items-center space-x-3">
            <Building className="text-blue-600 w-5 h-5" />
            <span>Marwadi University</span>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-3">
            <Mail className="text-blue-600 w-5 h-5" />
            <span>johndoe@example.com</span>
          </div>

          {/* Mobile */}
          <div className="flex items-center space-x-3">
            <Phone className="text-blue-600 w-5 h-5" />
            <span>+91 9876543210</span>
          </div>
        </div>

        {/* Edit Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
