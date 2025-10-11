"use client";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  getDocs,
  where,
} from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";
import OpenAI from "openai"; // ✅ Import OpenAI package (install with: npm install openai)

// ✅ Initialize OpenAI client
const client = new OpenAI({
  apiKey: "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", // store key in .env.local (never hardcode it!)
  dangerouslyAllowBrowser: true, // needed if using directly in client component
});

export default function ChatApp() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // --- Track logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- Fetch chats
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((chat) => chat.participants?.includes(user.email));

      setChats(chatList);

      const emailsToFetch = [
        ...new Set(
          chatList.flatMap((chat) =>
            chat.participants.filter((e) => e !== user.email)
          )
        ),
      ];

      if (emailsToFetch.length === 0) return;

      const usersQuery = query(
        collection(db, "users"),
        where("email", "in", emailsToFetch)
      );

      try {
        const userSnapshots = await getDocs(usersQuery);
        const userMap = {};
        userSnapshots.forEach((doc) => {
          userMap[doc.data().email] = doc.data().name || doc.data().email;
        });
        setUserDetails(userMap);
      } catch (err) {
        console.error("Error fetching user names:", err);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // --- Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
  };

  // --- AI Question Generator Function
  const generateAIQuestions = async (category) => {
    try {
      const prompt = `Generate 4 clear, simple questions for ${category} to collect key details or identify ownership: brand, model, size, color, material, condition, price, manufacturer, dates, quantity, features, SKU, warranty.`;

      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Error generating AI questions:", error);
      return "⚠️ Failed to generate AI response.";
    }
  };

  // --- Send Message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;

    try {
      const otherUserEmail = selectedChat.participants.find(
        (email) => email !== user.email
      );

      // Add user message
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        sender: user.email,
        receiver: otherUserEmail,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      // Update chat
      await setDoc(
        doc(db, "chats", selectedChat.id),
        {
          lastMessage: newMessage.trim(),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      // --- Check if message starts with "/ai"
      if (newMessage.startsWith("/ai")) {
        const category = newMessage.replace("/ai", "").trim();
        const aiResponse = await generateAIQuestions(category);

        // Add AI message
        await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
          sender: "AI Assistant",
          receiver: user.email,
          text: aiResponse,
          timestamp: serverTimestamp(),
        });

        // Update chat with AI reply
        await setDoc(
          doc(db, "chats", selectedChat.id),
          {
            lastMessage: aiResponse,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-4 bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r bg-white shadow-md">
        <Sideheader />
      </div>

      {/* Chat List */}
      <div className="bg-white border-r border-gray-300 overflow-y-auto">
        <div className="p-4 text-lg font-semibold border-b">Chats</div>
        {chats.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No chats yet. Start a conversation!
          </p>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const otherUserEmail = chat.participants.find(
                (email) => email !== user.email
              );
              const displayName =
                userDetails[otherUserEmail] || otherUserEmail.split("@")[0];
              return (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 hover:bg-gray-100 cursor-pointer ${
                    selectedChat?.id === chat.id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {displayName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {chat.lastMessage || "Say hi!"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="col-span-2 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-300 flex justify-between items-center">
          <div className="font-semibold text-lg">
            {selectedChat
              ? `Chat with ${
                  userDetails[
                    selectedChat.participants.find(
                      (email) => email !== user.email
                    )
                  ] ||
                selectedChat.participants.find(
                  (email) => email !== user.email
                )
              }`
              : "Select a chat"}
          </div>
          {selectedChat && <div className="text-sm text-gray-500">Online</div>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {selectedChat ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === user.email
                    ? "justify-end"
                    : msg.sender === "AI Assistant"
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    msg.sender === user.email
                      ? "bg-blue-500 text-white rounded-br-none"
                      : msg.sender === "AI Assistant"
                      ? "bg-green-100 text-gray-800 border border-green-300 italic"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">
              Select a chat to start messaging
            </p>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        {selectedChat && (
          <div className="p-4 bg-white border-t border-gray-300 flex gap-3">
            <input
              type="text"
              placeholder="Type a message... (use /ai <category> for AI)"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}