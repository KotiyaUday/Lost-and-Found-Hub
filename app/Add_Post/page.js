"use client";
import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
// import { db } from "../../lib/firebase";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";
const Add_Post = () => {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("lost");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    contact: "",
    category: "",
    otherCategory: "",
  });
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // prevent hydration mismatch
  useEffect(() => setHydrated(true), []);

  // check firebase auth user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!hydrated) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      date: "",
      contact: "",
      category: "",
      otherCategory: "",
    });
    setImage(null);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation — all required fields
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.date.trim() ||
      !form.contact.trim() ||
      !form.category.trim() ||
      (form.category === "Other" && !form.otherCategory.trim())
    ) {
      setError("⚠️ Please fill out all required fields before submitting.");
      setSuccess("");
      return;
    }

    const submittedData = {
      ...form,
      postType: activeTab,
      category:
        form.category === "Other" ? form.otherCategory : form.category,
      timestamp: new Date().toISOString(),
    };

    try {
      // you can uncomment this when Firestore is ready
      // await addDoc(collection(db, "posts"), {
      //   ...submittedData,
      //   timestamp: serverTimestamp(),
      // });

      setSuccess("✅ Post added successfully!");
      setError("");
      resetForm();
    } catch (error) {
      console.error("Error adding document:", error);
      setError("❌ Failed to add post. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="bg-gray-100 grid grid-cols-4 min-h-screen">
        <Sideheader />
    <div className="h-[90vh] overflow-y-auto col-span-3 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-8 p-8 border border-gray-200" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        Add Post – Lost & Found Hub
      </h2>

      {!user && (
        <p className="text-red-600 text-center font-semibold mb-4">
          Please log in to post an item
        </p>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-5">
        <button
          onClick={() => setActiveTab("lost")}
          className={`px-5 py-2 rounded-l-lg ${
            activeTab === "lost"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Lost Item
        </button>
        <button
          onClick={() => setActiveTab("found")}
          className={`px-5 py-2 rounded-r-lg ${
            activeTab === "found"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Found Item
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder={
              activeTab === "lost"
                ? "E.g., Lost Wallet"
                : "E.g., Found Mobile Phone"
            }
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide details like color, brand, unique marks..."
            required
          />
        </div>

        {/* Location + Date */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Where it was lost/found"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Wallet">Wallet</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Other Category Field */}
        {form.category === "Other" && (
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Enter Category Name *
            </label>
            <input
              type="text"
              name="otherCategory"
              value={form.otherCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your category name"
              required
            />
          </div>
        )}

        {/* Contact Info */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Contact Info *
          </label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Phone or Email"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {image && (
            <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={!user}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition disabled:opacity-50"
          >
            Add Post
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg shadow-sm transition"
          >
            Reset
          </button>
        </div>

        {/* Messages */}
        {success && (
          <p className="text-green-600 font-medium text-center mt-4">
            {success}
          </p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center mt-4">{error}</p>
        )}
      </form>
    </div>
    </div>
  );
};

export default Add_Post;