"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase"; 
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const Registration = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check auth state and handle user creation
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
        router.push("/User"); // ✅ move to User details page
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // ✅ Google sign-in handler
  const handleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account" // you can also try "none" but "select_account" is safer
    });
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Sign-in failed:", error);
    alert("Failed to sign in. Please try again.");
  }
};


  if (loading)
    return <div className="h-screen flex items-center justify-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-6xl overflow-hidden">
        
        {/* Image Section */}
        <div className="md:flex-1 w-full h-64 md:h-auto">
          <img
            src="/assets/registration.jpg"
            alt="Registration"
            className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          />
        </div>

        {/* Text + Button Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-6 md:p-10">
          <p className="text-justify text-base sm:text-lg md:text-lg mb-6">
            Start your registration by signing in with Google. You’ll then be redirected
            to fill in your details.
          </p>

          <button
            onClick={handleSignIn}
            className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 hover:shadow-xl active:scale-95 transition-all duration-200 w-full max-w-xs"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-6 h-6"
            />
            <span className="font-medium text-black text-sm sm:text-base md:text-base">
              Sign in with Google
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Registration;
