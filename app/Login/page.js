"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const Login = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ Check authentication state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email,
            photoURL: u.photoURL || "",
            createdAt: serverTimestamp(),
          });
        }

        setUser(u);
        router.push("/Home");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // ✅ Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setMessage({
        type: "error",
        text: "❌ Failed to sign in with Google. Please try again.",
      });
    }
  };

  // ✅ Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage({
        type: "success",
        text: "✅ Login successful! Redirecting...",
      });
      setTimeout(() => router.push("/Home"), 1500);
    } catch (error) {
      console.error("Email login failed:", error);
      setMessage({
        type: "error",
        text:
          error.code === "auth/invalid-credential"
            ? "⚠️ Invalid email or password."
            : "❌ Something went wrong. Please try again.",
      });
    }
  };

  // ✅ Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "⚠️ Please enter your email first!" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        type: "success",
        text: "Password reset email sent! Check your inbox.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage({
        type: "error",
        text: "Failed to send password reset email. Please try again.",
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-lg text-gray-700">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200">
        {/* Left Image Section */}
        <div className="md:flex-1 hidden md:block">
          <img
            src="assets/registration.jpg"
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-8 md:p-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
            Welcome Back 👋
          </h1>

          {/* ✅ Animated Message Banner */}
          {message.text && (
            <div
              className={`w-full max-w-sm text-center mb-4 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-500 transform ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-400 animate-fadeIn"
                  : "bg-red-100 text-red-700 border border-red-400 animate-fadeIn"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Email Login Form */}
          <form
            onSubmit={handleEmailLogin}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
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
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 font-medium"
            >
              Login
            </button>
          </form>

          {/* Forgot password */}
          <button
            onClick={handleForgotPassword}
            className="mt-3 text-sm text-blue-600 hover:underline font-medium"
          >
            Forgot Password?
          </button>

          {/* Divider */}
          <div className="flex items-center my-6 w-full max-w-sm">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-sm sm:text-base">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 bg-white border border-gray-400 rounded-lg px-5 py-3 hover:shadow-xl active:scale-95 transition-all duration-200 w-full max-w-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>

          {/* Signup Link */}
          <p className="mt-6 text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => router.push("/Register")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* ✨ Fade-in animation style */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
