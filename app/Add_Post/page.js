"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";
import { Menu, X } from "lucide-react";

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

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setHydrated(true), []);

  // Fetch user college
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, "users", u.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) setCollege(userSnap.data().collegeName || "Not Specified");
          else setCollege("Not Specified");
        } catch (err) {
          console.error(err);
          setCollege("Not Specified");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (!hydrated) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => e.target.files?.[0] && setImage(e.target.files[0]);
  const resetForm = () => {
    setForm({ title: "", description: "", location: "", date: "", contact: "", category: "", otherCategory: "" });
    setImage(null);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.date.trim() || !form.category.trim() || (form.category === "Other" && !form.otherCategory.trim())) {
      setError("⚠️ Please fill out all required fields before submitting.");
      setSuccess("");
      return;
    }

    try {
      let imageURL = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const response = await fetch("https://api.imgbb.com/1/upload?key=97d6db2b04a85a251125af9109610b31", { method: "POST", body: formData });
        const data = await response.json();
        if (data.success) imageURL = data.data.url;
        else throw new Error("Image upload failed");
      }

      await addDoc(collection(db, "items"), {
        ...form,
        postID: activeTab,
        postType: activeTab,
        category: form.category === "Other" ? form.otherCategory : form.category,
        imageURL: imageURL || "https://www.shutterstock.com/shutterstock/videos/1111389205/thumb/12.jpg?ip=x480",
        timestamp: serverTimestamp(),
        college: college || "Not Specified",
        userEmail: user?.email || "Anonymous",
      });

      setSuccess("🎉 Your post has been added successfully!");
      setError("");
      resetForm();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add post. Please try again.");
      setSuccess("");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-gray-100 to-white">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-1/5 bg-white shadow-md">
        <Sideheader />
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white rounded-lg shadow-md">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40">
          <div className="bg-white w-64 h-full shadow-xl p-4">
            <Sideheader />
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="flex-1 flex justify-center items-center py-10 px-4 w-full">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">Add Post – Lost & Found Hub</h2>

          {!user && <p className="text-red-600 text-center font-semibold mb-5">Please log in to post an item.</p>}

          <p className="text-center text-gray-700 font-medium mb-5">
            College: <span className="text-indigo-600 font-semibold">{college || "Loading..."}</span>
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex border rounded-xl overflow-hidden">
              <button type="button" onClick={() => setActiveTab("lost")} className={`px-6 py-2 text-sm sm:text-base font-medium transition ${activeTab === "lost" ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>Lost Item</button>
              <button type="button" onClick={() => setActiveTab("found")} className={`px-6 py-2 text-sm sm:text-base font-medium transition ${activeTab === "found" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>Found Item</button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder={activeTab === "lost" ? "E.g., Lost Wallet" : "E.g., Found Mobile Phone"} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Provide details like color, brand, unique marks..." className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-indigo-500" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Location *</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Where it was lost/found" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} max={today} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" required>
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
                <label className="block font-medium text-gray-700 mb-1">Enter Category Name *</label>
                <input type="text" name="otherCategory" value={form.otherCategory} onChange={handleChange} placeholder="Enter your category name" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">Contact Info</label>
              <input type="text" name="contact" value={form.contact} onChange={handleChange} placeholder="Phone or Email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
              {image && <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button type="submit" disabled={!user} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition disabled:opacity-50">Add Post</button>
              <button type="button" onClick={resetForm} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg shadow-sm transition">Reset</button>
            </div>

            {success && <p className="text-green-600 font-semibold text-center mt-4">{success}</p>}
            {error && <p className="text-red-600 font-semibold text-center mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
