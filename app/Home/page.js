"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const [college, setCollege] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [colleges, setColleges] = useState([]);
  const [categories, setCategories] = useState([]);

  const currentUserEmail = auth.currentUser?.email || "";

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || "Unnamed Item",
            image: d.imageURL || "https://i.ibb.co/MDMk4K6v/6f14784a35f5.jpg",
            postType: d.postType || "found",
            status: d.postType === "lost" ? "Lost" : "Found",
            category: d.category || d.otherCategory || "Other",
            college: d.college || "Not Specified",
            location: d.location || "Unknown",
            contact: d.contact || "N/A",
            description: d.description || "",
            timestamp: d.timestamp || null,
            userEmail: d.userEmail || "",
          };
        });

        const filtered = data.filter((i) => i.userEmail !== currentUserEmail);

        setItems(filtered);
        setColleges([...new Set(filtered.map((i) => i.college))]);
        setCategories([...new Set(filtered.map((i) => i.category))]);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentUserEmail]);

  const getChatId = (a, b) => [a, b].sort().join("_");

  const handleSendMessage = (item) => {
    if (!currentUserEmail) return;
    const chatId = getChatId(currentUserEmail, item.userEmail);
    window.location.href = `/Chat?chatId=${chatId}&otherUser=${encodeURIComponent(
      item.userEmail
    )}&itemTitle=${encodeURIComponent(item.title)}&itemImage=${encodeURIComponent(
      item.image
    )}`;
  };

  const filteredItems = items
    .filter((i) => (college ? i.college === college : true))
    .filter((i) => (category ? i.category === category : true))
    .filter((i) =>
      searchTerm
        ? i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.timestamp - b.timestamp;
      if (sortOrder === "desc") return b.timestamp - a.timestamp;
      return 0;
    });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-indigo-600 animate-pulse">
        Loading items...
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="md:w-72 w-full sticky top-0 z-20">
        <Sideheader />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-800 mb-6 text-center">
          🧭 Explore Lost & Found Items
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 flex-wrap justify-center">
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="p-2 sm:p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 w-full sm:max-w-xs"
          >
            <option value="">🎓 Select College</option>
            {colleges.map((clg, idx) => (
              <option key={idx}>{clg}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 sm:p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 w-full sm:max-w-xs"
          >
            <option value="">📦 Category</option>
            {categories.map((cat, idx) => (
              <option key={idx}>{cat}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 sm:p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 w-full sm:max-w-xs"
          >
            <option value="">🕒 Sort</option>
            <option value="asc">Oldest</option>
            <option value="desc">Newest</option>
          </select>

          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 sm:p-3 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 w-full sm:flex-1"
          />
        </div>

        {/* Grid Items */}
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 flex flex-col relative"
              >
                <span
                  className={`absolute top-4 left-4 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full ${
                    item.status === "Lost"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.status}
                </span>

                <div
                  className="cursor-pointer flex-1"
                  onClick={() => setSelectedPost(item)}
                >
                  <div className="w-full h-60 sm:h-72 md:h-60 xl:h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-indigo-800 line-clamp-1">
                      {item.title}
                    </h2>
                    {item.postType === "lost" && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="text-gray-700 text-sm mt-2">
                      <span className="font-medium">College:</span> {item.college}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendMessage(item)}
                  className="w-full bg-indigo-500 text-white py-2 hover:bg-indigo-600 transition-all duration-300 text-sm sm:text-base font-medium rounded-b-2xl"
                >
                  💬 Message Owner
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full py-10">
              No items found.
            </p>
          )}
        </div>

        {/* Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl overflow-hidden relative animate-fadeIn">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 text-gray-700 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>

              <div className="w-full h-64 overflow-hidden">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="p-5 flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-indigo-800 mb-2">
                  {selectedPost.title}
                </h2>
                <p className="text-gray-700">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={
                      selectedPost.status === "Lost"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {selectedPost.status}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">College:</span>{" "}
                  {selectedPost.college}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Category:</span>{" "}
                  {selectedPost.category}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedPost.location}
                </p>
                {selectedPost.status === "Lost" && (
                  <p className="text-gray-700">{selectedPost.description}</p>
                )}
                <button
                  onClick={() =>
                    window.location.href = `/Chat?otherUser=${selectedPost.userEmail}&itemImage=${selectedPost.image}`
                  }
                  className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300 mt-2"
                >
                  💬 Message Owner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
