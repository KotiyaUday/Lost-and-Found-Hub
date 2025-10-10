"use client";
import React, { useState, useEffect, useRef } from "react";
import Sideheader from "@/Components/Sideheader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

export default function ChatPage({ searchParams }) {
  // const { otherUser: initialOtherUser, itemImage: initialItemImage } =
  //   searchParams || {};
  const currentUser = auth.currentUser?.email;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [otherUser, setOtherUser] = useState(initialOtherUser || null);
  const [itemImage, setItemImage] = useState(initialItemImage || null);
  const chatEndRef = useRef(null);

  const chatId =
    currentUser && otherUser
      ? [currentUser, otherUser].sort().join("_")
      : null;

  // 🧩 Listen to all chat rooms that current user is part of
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chats = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(currentUser)) {
          chats.push({ id: doc.id, ...data });
        }
      });
      setChatList(chats);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 🧩 Listen to messages for the selected chat
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  // 📨 Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    try {
      await setDoc(doc(db, "chats", chatId), {
        participants: [currentUser, otherUser],
        itemImage: itemImage || null,
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender: currentUser,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 🔄 Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r bg-white/70 backdrop-blur-md shadow-md">
        <Sideheader />
        <div className="flex-1 overflow-y-auto p-3">
          <h2 className="text-gray-600 text-sm font-semibold mb-2 px-1">
            Recent Chats
          </h2>
          {chatList.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-6">
              No chats yet 💬
            </p>
          ) : (
            chatList.map((chat) => {
              const chatPartner = chat.participants.find(
                (u) => u !== currentUser
              );
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setOtherUser(chatPartner);
                    setItemImage(chat.itemImage || null);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-indigo-100 transition ${
                    chatPartner === otherUser
                      ? "bg-indigo-100 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  {chat.itemImage ? (
                    <img
                      src={chat.itemImage}
                      alt="Item"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      {chatPartner?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-800 text-sm truncate">
                      {chatPartner}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex flex-1 flex-col">
        {otherUser ? (
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
                  💬 Chat with {otherUser}
                </h2>
                <p className="text-sm text-gray-500">Discuss this item</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 md:px-8 md:py-6 space-y-3 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 italic">
                  No messages yet. Say hi 👋
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === currentUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[65%] px-4 py-2 rounded-2xl text-sm md:text-base shadow-lg ${
                      msg.sender === currentUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 border-t bg-white/80 backdrop-blur-md flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition-all duration-200"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <h2 className="text-xl md:text-2xl font-semibold text-indigo-700">
              Select a user to start chatting 💬
            </h2>
            <p className="mt-2 text-sm md:text-base">
              Your conversations will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
