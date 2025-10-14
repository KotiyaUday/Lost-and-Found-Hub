"use client";
import React, { useState, useEffect, useRef } from "react";
import Sideheader from "@/Components/Sideheader";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const otherUserEmail = searchParams.get("otherUser");
  const itemId = searchParams.get("itemId");
  const itemTitle = searchParams.get("itemTitle");
  const itemImage = searchParams.get("itemImage");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);

  // Track auth user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Generate unique chatId
  const chatId =
    user && otherUserEmail ? [user.email, otherUserEmail].sort().join("_") : null;

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUserEmail) return;

    try {
      // Update chat metadata
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [user.email, otherUserEmail],
          lastMessage: newMessage.trim(),
          itemId: itemId || null,
          itemTitle: itemTitle || "",
          itemImage: itemImage || "",
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      // Add message
      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender: user.email,
        receiver: otherUserEmail,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        itemId: itemId || null,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r bg-white/70 backdrop-blur-md shadow-md">
        <Sideheader />
      </div>

      {/* Chat Section */}
      <div className="flex flex-1 flex-col">
        {otherUserEmail ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white/70 backdrop-blur-md border-b shadow-sm flex items-center space-x-4">
              {itemImage && (
                <img
                  src={itemImage}
                  alt="Item"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border"
                />
              )}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-indigo-700">
                  💬 Chat with {otherUserEmail}
                </h2>
                <p className="text-sm text-gray-500">
                  Discuss this item: {itemTitle}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 md:px-8 md:py-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === user?.email ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm md:text-base shadow-md ${
                      msg.sender === user?.email
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Box */}
            <div className="p-3 md:p-4 border-t bg-white flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all duration-200"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
