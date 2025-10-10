"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  // Filter / Sort states
  const [college, setCollege] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  // Dropdown options
  const [colleges, setColleges] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const currentUserEmail = auth.currentUser?.email || "";

        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            title: docData.title || "Unnamed Item",
            image: docData.imageURL || "https://i.ibb.co/MDMk4K6v/6f14784a35f5.jpg",
            postType: docData.postType || "found",
            status: docData.postType === "lost" ? "Lost" : "Found",
            category: docData.category || docData.otherCategory || "Other",
            college: docData.college || "Not Specified",
            location: docData.location || "Unknown",
            contact: docData.contact || "N/A",
            description: docData.description || "",
            time: docData.date || "Not Available",
            timestamp: docData.timestamp || null,
            userEmail: docData.userEmail || "", // store who posted
          };
        });

        // 🔥 Hide current user's own posts
        const filteredData = data.filter((item) => item.userEmail !== currentUserEmail);

        setItems(filteredData);

        // Extract dropdown values
        const uniqueColleges = Array.from(new Set(filteredData.map((i) => i.college))).filter(Boolean);
        const uniqueCategories = Array.from(new Set(filteredData.map((i) => i.category))).filter(Boolean);
        setColleges(uniqueColleges);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Apply filters & sorting
  const filteredItems = items
    .filter((item) => (college ? item.college === college : true))
    .filter((item) => (category ? item.category === category : true))
    .sort((a, b) => {
      if (sortOrder === "asc") return new Date(a.time) - new Date(b.time);
      if (sortOrder === "desc") return new Date(b.time) - new Date(a.time);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-indigo-600">
        Loading items...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="flex-shrink-0 sticky top-0 h-screen">
        <Sideheader />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto max-h-screen">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6 text-center">
          🧭 Explore Lost & Found Items
        </h1>

        {/* 🔹 Filters */}
        <div className="flex flex-wrap justify-center gap-5 mb-6 w-full">
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

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">🕒 Sort By Time</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

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

        {/* 🔹 Item Cards */}
        <div className="w-full grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 px-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-indigo-100 hover:-translate-y-2 cursor-pointer relative"
              onClick={() => setSelectedPost(item)}
            >
              {/* Lost / Found Tag */}
              <span
                className={`absolute top-4 left-4 text-sm font-semibold px-3 py-1 rounded-full z-10 ${
                  item.status === "Lost"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {item.status}
              </span>

              {/* Image */}
              <div className="h-56 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col justify-between h-[220px]">
                <h2 className="text-xl font-semibold text-indigo-800">{item.title}</h2>

                <div className="mt-2 text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium text-gray-800">Category:</span> {item.category}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Date:</span> {item.time}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">College:</span> {item.college}
                  </p>
                </div>

                <button className="mt-4 bg-indigo-500 text-white font-medium py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300">
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <p className="text-center text-gray-600 col-span-full">
              No items found.
            </p>
          )}
        </div>
      </div>

      {/* 🔹 Modal Popup */}
      {selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8">
          <div
            className="absolute inset-0 bg-white opacity-40"
            onClick={() => setSelectedPost(null)}
          ></div>

          <div className="relative z-10 max-w-md w-full bg-gradient-to-b from-indigo-50 to-white rounded-2xl shadow-2xl overflow-hidden md:max-w-lg">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl font-bold z-20"
            >
              &times;
            </button>

            <div className="w-full bg-gray-100 flex justify-center items-center">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-5 md:p-6 space-y-3">
              <span
                className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                  selectedPost.status === "Lost"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {selectedPost.status}
              </span>

              <h2 className="text-xl md:text-2xl font-bold text-indigo-800">
                {selectedPost.title}
              </h2>

              <div className="flex flex-wrap gap-4 text-gray-700 text-sm md:text-base">
                <p>
                  <span className="font-medium text-gray-800">Category:</span>{" "}
                  {selectedPost.category}
                </p>
                <p>
                  <span className="font-medium text-gray-800">College:</span>{" "}
                  {selectedPost.college || "Not Specified"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-700 text-sm md:text-base">
                <p>
                  <span className="font-medium text-gray-800">Location:</span>{" "}
                  {selectedPost.location}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Contact:</span>{" "}
                  {selectedPost.contact}
                </p>
              </div>

              <p className="text-gray-700 text-sm md:text-base">
                <span className="font-medium text-gray-800">Date:</span>{" "}
                {selectedPost.time || "Not Available"}
              </p>

              <p className="text-gray-700 text-sm md:text-base">
                <span className="font-medium text-gray-800">Description:</span>{" "}
                {selectedPost.description}
              </p>

              {/* Show Message Button only if Lost */}
              {selectedPost.postType === "lost" && (
                <button
                onClick={() =>
                  window.location.href = `/Chat?otherUser=${selectedPost.userEmail}&itemImage=${selectedPost.image}`
                }
                className="mt-5 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
              >
                Send Message to Owner
              </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
