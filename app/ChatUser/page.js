"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Sideheader from "@/Components/Sideheader";
import { Menu, X } from "lucide-react";

export default function ChatUserList() {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch all chats where the user is a participant
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((chat) =>
          chat.participants?.includes(user.email) // only show chats involving logged-in user
        );
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle click on user to redirect to chat page
  const openChat = (chat) => {
    const otherUserEmail = chat.participants.find((email) => email !== user.email);
    router.push(
      `/Chat?chatId=${chat.id}&otherUser=${encodeURIComponent(
        otherUserEmail
      )}&itemId=${chat.itemId || ""}`
    );
    setSidebarOpen(false); // close sidebar on mobile
  };

  return (
    <div className="h-screen w-full flex bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 border-r bg-white shadow-md">
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
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white shadow-xl p-4">
            <Sideheader />
          </div>
        </div>
      )}

      {/* Chat User List */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          💬 Your Chats
        </h1>

        {chats.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No chats yet. Start a conversation!
          </p>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => {
              const otherUserEmail = chat.participants.find(
                (email) => email !== user.email
              );
              return (
                <div
                  key={chat.id}
                  onClick={() => openChat(chat)}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition-all duration-200"
                >
                  {/* User avatar */}
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                    {otherUserEmail.charAt(0).toUpperCase()}
                  </div>

                  {/* User info */}
                  <div className="flex-1 flex flex-col">
                    <p className="text-gray-800 font-medium truncate">
                      {otherUserEmail}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {chat.lastMessage || "Say hi!"}
                    </p>
                  </div>

                  {/* Right arrow */}
                  <div className="text-gray-400">&#8250;</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
