"use client";
import React from "react";

const SingleItemModal = ({ item, onClose }) => {
  if (!item) return null;

  const postType = (item.postType || item.status || "").toLowerCase();
  const isLost = postType === "lost";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center p-4 md:p-6 lg:p-8"
      style={{ pointerEvents: "auto" }}
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative z-10 max-w-md md:max-w-lg w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-2xl font-bold z-20"
        >
          &times;
        </button>

        {/* Image */}
        <div className="w-full bg-gray-100 flex justify-center items-center">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-auto max-h-[250px] md:max-h-[300px] object-contain transition-all duration-300"
          />
        </div>

        {/* Info Section */}
        <div className="p-5 md:p-6 space-y-3">
          {/* Status Tag */}
          <span
            className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
              isLost ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            {isLost ? "Lost" : "Found"}
          </span>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-indigo-800">
            {item.name || item.title}
          </h2>

          {/* Category & College */}
          <div className="flex flex-wrap gap-4 text-gray-700 text-sm md:text-base">
            <p>
              <span className="font-medium text-gray-800">Category:</span>{" "}
              {item.category}
            </p>
            <p>
              <span className="font-medium text-gray-800">College:</span>{" "}
              {item.college}
            </p>
          </div>

          {/* Location & Contact */}
          <div className="flex flex-wrap gap-4 text-gray-700 text-sm md:text-base">
            <p>
              <span className="font-medium text-gray-800">Location:</span>{" "}
              {item.location}
            </p>
            <p>
              <span className="font-medium text-gray-800">Contact:</span>{" "}
              {item.contact}
            </p>
          </div>

          {/* Date */}
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-medium text-gray-800">Date:</span>{" "}
            {item.timestamp
              ? new Date(item.timestamp.seconds * 1000).toLocaleString()
              : "Not Available"}
          </p>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            <span className="font-medium text-gray-800">Description:</span>{" "}
            {item.description}
          </p>

          {/* ✅ Show Send Message button only if postType is 'lost' */}
          {isLost && (
            <button className="mt-5 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300">
              Send Message to Owner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItemModal;
