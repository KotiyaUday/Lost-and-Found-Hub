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

  // extra form for new Google users
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [name, setName] = useState("");
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          console.log("onAuthStateChanged login ->", u.uid);
          // if google flow in progress, don't auto-redirect
          if (showExtraForm) {
            setUser(u);
            setLoading(false);
            return;
          }

          // check user doc
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.name && data.collegeName) {
              setUser(u);
              router.push("/Home");
            } else {
              // show extra form to complete profile
              setUser(u);
              setName(data.name || u.displayName || "");
              setCollegeName(data.collegeName || "");
              setShowExtraForm(true);
            }
          } else {
            // no doc: just set user (don't redirect) — user will trigger flow via Google button
            setUser(u);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("onAuthStateChanged error (login):", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router, showExtraForm]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      setGoogleUser(gUser);

      // try to prefill from firestore doc if exists
      const userRef = doc(db, "users", gUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || gUser.displayName || "");
        setCollegeName(data.collegeName || "");
      } else {
        setName(gUser.displayName || "");
        setCollegeName("");
      }

      // show the extra form (user will submit)
      setShowExtraForm(true);
    } catch (error) {
      console.error("Sign-in failed:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  const handleGoogleFormSubmit = async (e) => {
    e.preventDefault();
    if (!googleUser && !user) {
      alert("No authenticated Google user. Please try again.");
      return;
    }
    const uid = (googleUser && googleUser.uid) || (user && user.uid);
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(
        userRef,
        {
          uid,
          name,
          collegeName,
          email: (googleUser && googleUser.email) || (user && user.email) || email || "",
          photoURL: (googleUser && googleUser.photoURL) || (user && user.photoURL) || "",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      setShowExtraForm(false);
      alert("Profile completed successfully!");
      router.push("/Home");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save details. Try again.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle redirect after checking doc
    } catch (error) {
      console.error("Email login failed:", error);
      alert("Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert(
        "Password reset email sent! Check your inbox and follow the instructions."
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Failed to send password reset email. Please check your email.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );

  if (showExtraForm) {
    return (
      <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black p-8 w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Complete Your Profile
          </h1>
          <form onSubmit={handleGoogleFormSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="College Name"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-5xl overflow-hidden">

        {/* Image Section */}
        <div className="md:flex-1 w-full h-56 sm:h-72 md:h-auto">
          <img
            src="/assets/registration.jpg"
            alt="Registration"
            className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          />
        </div>

        {/* Form Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-center text-gray-800">
            Welcome Back!
          </h1>

          <form
            onSubmit={handleEmailLogin}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm sm:text-base"
            >
              Login
            </button>
          </form>

          {/* Forgot password */}
          <button
            onClick={handleForgotPassword}
            className="mt-2 text-sm text-blue-600 hover:underline font-medium"
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
            className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 hover:shadow-xl active:scale-95 transition-all duration-200 w-full max-w-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-black text-sm sm:text-base md:text-base">
              Continue with Google
            </span>
          </button>

          {/* Sign-up link */}
          <p className="mt-6 text-sm sm:text-base text-gray-600 text-center">
            Don’t have an account?{" "}
            <button
              onClick={() => router.push("/Register")}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;