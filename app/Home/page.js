"use client";
import Sideheader from "@/Components/Sideheader";
import React, { useState } from "react";

const Home = () => {
  const [college, setCollege] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [category, setCategory] = useState("");

  const colleges = [
    "Marwadi University",
    "Atmiya University",
    "RK University",
    "Darshan University",
    "VVP Engineering College",
    "Christ College",
    "Gardi Vidyapith",
    "Government Engineering College Rajkot",
    "Saurashtra University",
    "Om Engineering College",
  ];

  const categories = [
    "Electronics",
    "Wallet",
    "Jewellery",
    "Documents",
    "Clothing",
    "Other",
  ];

  const posts = [
    { image:'/assets/b.jpg' ,status: "Lost", category: "Electronics", title: "Wireless Buds", time: "09/10/2025 10:20 AM" },
    { image:'/assets/b.jpg' ,status: "Found", category: "Documents", title: "PAN Card", time: "08/10/2025 02:35 PM" },
    { image:'/assets/b.jpg' ,status: "Lost", category: "Wallet", title: "Brown Leather Wallet", time: "07/10/2025 05:45 PM" },
    { image:'/assets/b.jpg' ,status: "Found", category: "Jewellery", title: "Gold Chain", time: "06/10/2025 11:10 AM" },
    { image:'/assets/b.jpg' ,status: "Lost", category: "Clothing", title: "Black Hoodie", time: "05/10/2025 06:50 PM" },
  ];

  return (
    <>
      <div className="bg-gray-100 grid grid-cols-4 min-h-screen">
        <Sideheader />

        {/* Main Section */}
        <div className="col-start-2 col-end-5 flex flex-col items-center p-6">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-5 mb-6 w-full">
            {/* College Dropdown */}
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">🎓 Select College</option>
              {colleges.map((clg, index) => (
                <option key={index} value={clg}>
                  {clg}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">🕒 Sort By Time</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">📦 Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Horizontal Cards */}
          <div className="w-180 h-[85vh] overflow-y-auto pr-3" style={{ scrollbarWidth: "none" }}>
            <div className="flex flex-col gap-8">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="flex bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-200"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={post.image}
                      alt="Item"
                      className="w-48 h-48 object-cover rounded-l-2xl"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between p-5 w-full">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {post.title}
                      </h2>
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          post.status === "Lost"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-2 text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium text-gray-800">Category:</span>{" "}
                        {post.category}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Date & Time:</span>{" "}
                        {post.time}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">College:</span>{" "}
                        {college || "Not Specified"}
                      </p>
                    </div>

                    {/* Button */}
                    <div className="mt-4">
                      <button className="bg-slate-400 text-white px-5 py-2 rounded-lg hover:bg-slate-600 transition-all duration-300">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
