"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
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
      if (u) setCollege("RK University");
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
        userEmail: user?.email || "Anonymous",
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-100 via-gray-100 to-white">
      {/* Sidebar */}
      <div className="flex-shrink-0 md:sticky md:top-0 h-auto md:h-screen bg-white shadow-md">
        <Sideheader />
      </div>

      {/* Centered Form Section */}
      <div className="flex-1 flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
            Add Post – Lost & Found Hub
          </h2>

          {!user && (
            <p className="text-red-600 text-center font-semibold mb-5">
              Please log in to post an item.
            </p>
          )}

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab("lost")}
                className={`px-6 py-2 text-sm sm:text-base font-medium transition ${
                  activeTab === "lost"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Lost Item
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("found")}
                className={`px-6 py-2 text-sm sm:text-base font-medium transition ${
                  activeTab === "found"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Found Item
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={
                  activeTab === "lost" ? "E.g., Lost Wallet" : "E.g., Found Mobile Phone"
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Provide details like color, brand, unique marks..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Where it was lost/found"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  max={today}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category *</label>
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
                <label className="block font-medium text-gray-700 mb-1">
                  Enter Category Name *
                </label>
                <input
                  type="text"
                  name="otherCategory"
                  value={form.otherCategory}
                  onChange={handleChange}
                  placeholder="Enter your category name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            {/* Contact Info */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Contact Info *
              </label>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Phone or Email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Image */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Image</label>
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="submit"
                disabled={!user}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition disabled:opacity-50"
              >
                Add Post
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg shadow-sm transition"
              >
                Reset
              </button>
            </div>

            {/* Feedback */}
            {success && (
              <p className="text-green-600 font-semibold text-center mt-4">{success}</p>
            )}
            {error && (
              <p className="text-red-600 font-semibold text-center mt-4">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
