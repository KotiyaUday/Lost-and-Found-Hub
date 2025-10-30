"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Building, Menu, X } from "lucide-react";
import Sideheader from "@/Components/Sideheader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import md5 from "crypto-js/md5";

const UserProfile = () => {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("total");
  const [userInfo, setUserInfo] = useState({
    name: "User",
    email: "",
    college: "N/A",
    profileImage: "https://via.placeholder.com/150",
  });
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [editImage, setEditImage] = useState(null);

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUserPosts([]);
        setFilteredPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userEmail = currentUser.email || "";
      const uid = currentUser.uid;

      const hash = md5(userEmail.trim().toLowerCase()).toString();
      const gravatarURL = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

      try {
        let firestoreUser = null;
        const userDocRefByUid = doc(db, "users", uid);
        const userSnapByUid = await getDoc(userDocRefByUid);
        if (userSnapByUid.exists()) firestoreUser = userSnapByUid.data();

        if (!firestoreUser && userEmail) {
          const q = query(collection(db, "users"), where("email", "==", userEmail));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) firestoreUser = qSnap.docs[0].data();
        }

        setUserInfo({
          name: firestoreUser?.name || currentUser.displayName || "User",
          email: firestoreUser?.email || userEmail,
          college: firestoreUser?.collegeName || "N/A",
          profileImage: gravatarURL,
        });
      } catch (err) {
        console.error(err);
        setUserInfo((prev) => ({ ...prev, email: userEmail, profileImage: gravatarURL }));
      }

      // Fetch posts
      try {
        const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const postsData = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || "Unnamed Item",
              postType: data.postType || "found",
              timestamp: data.timestamp || null,
              description: data.description || "",
              userEmail: data.userEmail || "",
              userId: data.userId || data.userUid || "",
              location: data.location || "",
              category: data.category || data.otherCategory || "Other",
              image: data.imageURL || "https://i.ibb.co/MDMk4K6v/6f14784a35f5.jpg",
              contact: data.contact || "",
              date: data.date || "",
            };
          })
          .filter(
            (post) =>
              post.userEmail?.trim().toLowerCase() === userEmail?.trim().toLowerCase() ||
              post.userId === uid
          );

        setUserPosts(postsData);
        setFilteredPosts(postsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === "lost") setFilteredPosts(userPosts.filter((p) => p.postType === "lost"));
    else if (filter === "found") setFilteredPosts(userPosts.filter((p) => p.postType === "found"));
    else setFilteredPosts(userPosts);
  };

  const handleEditClick = (post) => {
    setEditPostData(post);
    setEditImage(null);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditPostData({ ...editPostData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => e.target.files?.[0] && setEditImage(e.target.files[0]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editPostData) return;

    try {
      let imageURL = editPostData.image;

      if (editImage) {
        const formData = new FormData();
        formData.append("image", editImage);
        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=97d6db2b04a85a251125af9109610b31",
          { method: "POST", body: formData }
        );
        const data = await response.json();
        if (data.success) imageURL = data.data.url;
        else throw new Error("Image upload failed");
      }

      const postRef = doc(db, "items", editPostData.id);
      await updateDoc(postRef, {
        ...editPostData,
        imageURL,
        timestamp: serverTimestamp(),
      });

      setUserPosts((prev) =>
        prev.map((p) => (p.id === editPostData.id ? { ...editPostData, image: imageURL } : p))
      );
      setFilteredPosts((prev) =>
        prev.map((p) => (p.id === editPostData.id ? { ...editPostData, image: imageURL } : p))
      );

      setEditModalOpen(false);
      setEditImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update post. Try again.");
    }
  };

  // ✅ ADD THIS FUNCTION
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-1/5">
        <Sideheader />
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
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

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 w-full">
        {/* Profile */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 max-w-5xl mx-auto">
          <img
            src={userInfo.profileImage}
            alt="User Profile"
            className="w-36 h-36 rounded-full border-4 border-blue-500 object-cover"
          />
          <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-gray-800">
            <div className="flex items-center gap-2">
              <User className="text-blue-600 w-5 h-5" />
              <span className="text-2xl font-semibold">{userInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Building className="text-blue-600 w-5 h-5" />
              <span>{userInfo.college}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="text-blue-600 w-5 h-5" />
              <span>{userInfo.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-400 p-2 w-30 m-3 rounded-2xl text-white hover:bg-blue-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {["lost", "found", "total"].map((filter) => (
            <button
              key={filter}
              className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                selectedFilter === filter
                  ? filter === "lost"
                    ? "bg-red-500 text-white"
                    : filter === "found"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
              onClick={() => handleFilterChange(filter)}
            >
              {filter === "total"
                ? "Total Items"
                : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Items`}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {loading ? (
            <p className="text-center col-span-full">Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center col-span-full text-gray-600">No posts found.</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                    post.postType === "lost"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {post.postType.toUpperCase()}
                </span>
                <div className="p-3">
                  <h2 className="font-semibold text-indigo-800 text-lg line-clamp-1">{post.title}</h2>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.description}</p>
                  <p className="text-gray-700 text-sm mt-1">
                    <span className="font-medium">Category:</span> {post.category}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    <span className="font-medium">Location:</span> {post.location}
                  </p>
                  <button
                    className="mt-2 w-full bg-indigo-500 text-white py-1 rounded-lg hover:bg-indigo-600 transition-all duration-300 text-sm"
                    onClick={() => handleEditClick(post)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editModalOpen && editPostData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute top-3 right-3 text-gray-700 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-xl font-bold text-indigo-700 mb-4">Edit Post</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={editPostData.title}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Title"
                  required
                />
                <textarea
                  name="description"
                  value={editPostData.description}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Description"
                  required
                />
                <input
                  type="text"
                  name="location"
                  value={editPostData.location}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Location"
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={editPostData.date}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={editPostData.category}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Category"
                  required
                />
                <input
                  type="text"
                  name="contact"
                  value={editPostData.contact}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Contact Info"
                  required
                />
                <div>
                  <label className="block mb-1 font-medium">Update Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {editImage && <p className="text-sm mt-1">{editImage.name}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
                >
                  Update Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
