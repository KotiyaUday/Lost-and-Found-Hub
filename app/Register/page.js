"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
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
        college,
        email,
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
            onSubmit={handleRegister}
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? "Registering..." : "Sign Up"}
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
