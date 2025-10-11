"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User, Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Sideheader = () => {
  const [isOpen, setIsOpen] = useState(false); // collapsed by default on mobile
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Home", icon: Home, href: "/Home" },
    { name: "Search", icon: Search, href: "#" },
    { name: "Add Post", icon: PlusCircle, href: "/Add_Post" },
    { name: "Message", icon: MessageCircle, href: "/ChatApp" },
    { name: "Profile", icon: User, href: "/User_Profile" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      router.push("/Login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-100 to-indigo-200 border-r-4 border-indigo-300 shadow-2xl z-30 transform transition-transform duration-300
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} md:translate-x-0 md:w-72 flex flex-col`}
      >
        {/* Top */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full shadow-lg"
            />
            <h1 className="text-2xl font-semibold text-indigo-800 tracking-wide">
              L&F Hub
            </h1>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 bg-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-6 h-6 text-indigo-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 mt-5 gap-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`group flex items-center gap-4 px-5 py-3 rounded-xl mx-2 transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-800 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-indigo-600 group-hover:text-white"
                  }`}
                />
                <span className="font-medium tracking-wide text-base">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="m-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
        >
          Log out
        </button>

        {/* Footer */}
        <div className="mt-auto px-4 py-4 text-sm text-gray-600 border-t border-indigo-300">
          <p className="text-center font-medium">
            ©️ {new Date().getFullYear()} Lost & Found Hub
          </p>
        </div>
      </div>

      {/* Hamburger button for mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 md:hidden z-40 p-2 bg-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6 text-indigo-700" />
      </button>
    </>
  );
};

export default Sideheader;