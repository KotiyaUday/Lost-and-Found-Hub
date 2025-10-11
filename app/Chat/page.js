"use client";
import React, { useState, useEffect, useRef } from "react";
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
import Sideheader from "@/Components/Sideheader";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const otherUserEmail = searchParams.get("otherUser"); // Other person's email
  const itemId = searchParams.get("itemId"); // Item id
  const itemTitle = searchParams.get("itemTitle"); // Item title
  const itemImage = searchParams.get("itemImage"); // Item image URL

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);

  const chatEndRef = useRef(null);

  // Track auth user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Generate unique chatId based on emails
  const chatId = user && otherUserEmail
    ? [user.email, otherUserEmail].sort().join("_")
    : null;

  // Fetch chat messages from Firestore
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

      // Auto scroll
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUserEmail) return;

    try {
      // 1️⃣ Create or update parent chat document
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

      // 2️⃣ Add message to messages subcollection
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
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r bg-white shadow-md">
        <Sideheader />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 bg-white border-b shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {itemImage && (
              <img
                src={itemImage}
                alt={itemTitle}
                className="w-10 h-10 object-cover rounded-full"
              />
            )}
            <h2 className="text-lg md:text-xl font-semibold text-indigo-700">
              💬 Chat about "{itemTitle || "Item"}"
            </h2>
          </div>
          <span className="text-sm text-gray-500 hidden sm:block">
            Chatting with {otherUserEmail}
          </span>
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
      </div>
    </div>
  );
}
