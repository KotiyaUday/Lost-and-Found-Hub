"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
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
  const [confirmPassword, setConfirmPassword] = useState("");

  // Google temp user (holds result.user)
  const [googleUser, setGoogleUser] = useState(null);

  // ✅ Check if user is already signed in — only redirect if not in google flow
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          console.log("onAuthStateChanged -> user:", u.uid);
          // If we're currently doing the google-flow / showing extra form, don't auto-redirect
          if (showExtraForm) {
            setUser(u);
            setLoading(false);
            return;
          }

          // Check Firestore user doc to decide redirect
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            // if doc has required fields, go Home
            if (data.name && data.collegeName) {
              setUser(u);
              router.push("/Home");
            } else {
              // doc exists but missing fields -> show extra form with prefill
              setUser(u);
              setName(data.name || u.displayName || "");
              setCollegeName(data.collegeName || "");
              setShowExtraForm(true);
            }
          } else {
            // no doc -> do not redirect; allow user to fill form if they want
            setUser(u);
            // leave showExtraForm false — only show when user clicks Google button
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("onAuthStateChanged error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
    // include showExtraForm so listener respects it
  }, [router, showExtraForm]);

  // ✅ Google sign-up handler — ALWAYS open the form after popup
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      // save the firebase user object temporarily
      const gUser = result.user;
      setGoogleUser(gUser);

      // try to prefill from firestore if exists, else from google displayName
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

      // show the extra-info form (user will submit to create/update doc)
      setShowExtraForm(true);
    } catch (error) {
      console.error("Google Sign-up failed:", error);
      alert("Google sign-up failed. Please try again.");
    }
  };

  // ✅ Submit form for new Google user (or updating existing user's doc)
  const handleGoogleFormSubmit = async (e) => {
    e.preventDefault();
    if (!googleUser && !user) {
      alert("No authenticated Google user found. Please try again.");
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
        { merge: true } // merge so we don't overwrite unintended fields
      );

      setShowExtraForm(false);
      alert("Account information saved!");
      router.push("/Home");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save user details. Try again.");
    }
  };

  // ✅ Email & Password Sign-up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", res.user.uid);

      await setDoc(userRef, {
        uid: res.user.uid,
        name,
        collegeName,
        email: res.user.email,
        photoURL: "",
        createdAt: serverTimestamp(),
      });

      alert("Account created successfully!");
      router.push("/Home");
    } catch (error) {
      console.error("Sign-up failed:", error);
      alert(error.message);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );

  // ✅ Google extra info form (shown after clicking Google)
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

  // ✅ Default Signup Page
  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-5xl overflow-hidden">
        {/* Image Section */}
        <div className="md:flex-1 w-full h-56 sm:h-72 md:h-auto">
          <img
            src="/assets/registration.jpg"
            alt="Signup"
            className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          />
        </div>

        {/* Form Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-center text-gray-800">
            Create Your Account
          </h1>

          <form
            onSubmit={handleEmailSignUp}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
            <input
              type="text"
              placeholder="Full Name"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="College Name"
              className="border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
            />

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
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm sm:text-base"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 w-full max-w-sm">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-sm sm:text-base">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Sign-Up */}
          <button
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 hover:shadow-xl active:scale-95 transition-all duration-200 w-full max-w-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-black text-sm sm:text-base md:text-base">
              Sign up with Google
            </span>
          </button>

          {/* Login link */}
          <p className="mt-6 text-sm sm:text-base text-gray-600 text-center">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/Login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;