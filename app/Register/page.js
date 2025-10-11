"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const Signup = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExtraForm, setShowExtraForm] = useState(false);

  // form states
  const [name, setName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const colleges = [
    "Marwadi University",
    "RK University",
    "Atmiya University",
    "Darshan University",
    "VVP Engineering College",
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!googleUser && !user) {
      alert("No authenticated Google user found. Please try again.");
      return;
    }

    const uid = googleUser?.uid || user?.uid;
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      alert("Account already exists! Redirecting to Home...");
      router.push("/Home");
      return;
    }

    try {
      await setDoc(userRef, {
        uid,
        name,
        collegeName,
        email: googleUser?.email || user?.email || email,
        photoURL: googleUser?.photoURL || user?.photoURL || "",
        createdAt: serverTimestamp(),
      });

      alert("Account created successfully!");
      router.push("/Home");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save user details. Try again.");
    }
  };

  // ✅ Email & Password Signup
  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 🔹 Check if email is already registered
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);
      if (existingMethods.length > 0) {
        alert("This email is already registered. Please log in instead.");
        return;
      }

      // 🔹 Create new user
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", res.user.uid);

      await setDoc(userRef, {
        uid: res.user.uid,
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        collegeName,
        email: res.user.email,
        photoURL: "",
        createdAt: serverTimestamp(),
      });

      await signOut(auth);
      setMessage({
        type: "success",
        text: "🎉 Registration successful! Redirecting to login...",
      });

      setTimeout(() => router.push("/Login"), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text:
          error.code === "auth/email-already-in-use"
            ? "Email already in use."
            : "Failed to register. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-5xl overflow-hidden">
        {/* Image Section */}
        <div className="md:flex-1 w-full h-56 sm:h-72 md:h-auto">
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-xl w-full max-w-5xl overflow-hidden border border-gray-200">
        {/* Left Side Image */}
        <div className="md:flex-1 hidden md:block">
          <img
            src="/assets/registration.jpg"
            alt="Register"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-8 md:p-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">
            Create Your Account
          </h1>

          {/* Message Banner */}
          {message.text && (
            <div
              className={`w-full max-w-sm text-center mb-4 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-400"
                  : "bg-red-100 text-red-700 border border-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form
            onSubmit={handleEmailSignUp}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
            <input
              type="text"
              placeholder="Full Name"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
            >
              <option value="">Select Your College</option>
              {colleges.map((clg, index) => (
                <option key={index} value={clg}>
                  {clg}
                </option>
              ))}
            </select>

            <input
              type="email"
              placeholder="Email Address"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/Login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
