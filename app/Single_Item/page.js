"use client";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SingleItemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item; // We pass the item via router state

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg font-semibold">
          ❌ No item data available
        </p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 sm:p-8 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Image */}
        <div className="lg:w-1/2 h-80 lg:h-auto overflow-hidden">
          <img
            src={item.imageURL || "/assets/no-image.jpg"}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Right: Details */}
        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          {/* Status Tag */}
          <span
            className={`self-start px-4 py-1 rounded-full font-semibold text-sm ${
              item.postType === "lost"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {item.postType?.toUpperCase() || "N/A"}
          </span>

          {/* Title & Category */}
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-indigo-800">{item.title}</h1>
            <p className="text-gray-600 mt-1">
              Category: <span className="font-medium">{item.category}</span>
            </p>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium">Location:</p>
              <p>{item.location}</p>
            </div>
            <div>
              <p className="font-medium">Date:</p>
              <p>{item.date}</p>
            </div>
            <div>
              <p className="font-medium">College:</p>
              <p>{item.college || "Not Specified"}</p>
            </div>
            <div>
              <p className="font-medium">Contact:</p>
              <p>{item.contact}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-2 text-indigo-700">Description:</h2>
            <p className="text-gray-700">{item.description}</p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${item.contact}`}
              className="flex-1 text-center px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Contact Owner
            </a>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 text-center px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleItemPage;
