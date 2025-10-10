"use client";
import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";

const AddPost = () => {
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
  const [college, setCollege] = useState("");

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // You can fetch college info from Firestore users collection if needed
        setCollege("RK University");
      }
    });
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

    try {
      let imageURL = "";

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=97d6db2b04a85a251125af9109610b31",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.success) imageURL = data.data.url;
        else throw new Error("Image upload failed");
      }

      const submittedData = {
        ...form,
        postType: activeTab,
        category: form.category === "Other" ? form.otherCategory : form.category,
        imageURL:
          imageURL ||
          "https://www.shutterstock.com/shutterstock/videos/1111389205/thumb/12.jpg?ip=x480",
        timestamp: serverTimestamp(),
        college: college || "Not Specified",
        userEmail: user?.email || "Anonymous", // ✅ Add current user’s email
      };

      await addDoc(collection(db, "items"), submittedData);

      setSuccess("🎉 Your post has been added successfully!");
      setError("");
      resetForm();
    } catch (err) {
      console.error("Error adding document:", err);
      setError("❌ Failed to add post. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-300">
      {/* 🔹 Sticky Sidebar */}
      <div className="flex-shrink-0 sticky top-0 h-screen">
        <Sideheader />
      </div>

      {/* 🔹 Scrollable Main Content */}
      <div className="flex-1 p-6 overflow-y-auto max-h-screen">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-700 mb-6">
            Add Post – Lost & Found Hub
          </h2>

          {!user && (
            <p className="text-red-600 text-center font-semibold mb-4 text-sm sm:text-base">
              Please log in to post an item
            </p>
          )}

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row justify-center mb-5 gap-2 sm:gap-0">
            <button
              onClick={() => setActiveTab("lost")}
              className={`px-5 py-2 rounded-lg sm:rounded-l-lg ${
                activeTab === "lost"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Lost Item
            </button>
            <button
              onClick={() => setActiveTab("found")}
              className={`px-5 py-2 rounded-lg sm:rounded-r-lg ${
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
            className="bg-gray-50 p-5 sm:p-6 rounded-lg shadow-inner space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder={
                  activeTab === "lost" ? "E.g., Lost Wallet" : "E.g., Found Mobile Phone"
                }
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">Description *</label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block font-medium mb-1 text-gray-700">Location *</label>
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
                <label className="block font-medium mb-1 text-gray-700">Date *</label>
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
              <label className="block font-medium mb-1 text-gray-700">Category *</label>
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

            {form.category === "Other" && (
              <div>
                <label className="block font-medium mb-1 text-gray-700">Enter Category Name *</label>
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
              <label className="block font-medium mb-1 text-gray-700">Contact Info *</label>
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
              <label className="block font-medium mb-1 text-gray-700">Image</label>
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <button
                type="submit"
                disabled={!user}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition disabled:opacity-50"
              >
                Add Post
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg shadow-sm transition"
              >
                Reset
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <p className="text-green-600 font-medium text-center mt-4">{success}</p>
            )}
            {error && (
              <p className="text-red-600 font-medium text-center mt-4">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
