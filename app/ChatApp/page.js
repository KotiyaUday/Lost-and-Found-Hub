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
import { Menu, X } from "lucide-react";

export default function ChatApp() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch all chats
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((chat) => chat.participants?.includes(user.email));

      setChats(chatList);

      // Fetch display names
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

  // Fetch messages for selected chat
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
    setSidebarOpen(false); // close sidebar on mobile
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;

    try {
      const otherUserEmail = selectedChat.participants.find(
        (email) => email !== user.email
      );

      await setDoc(
        doc(db, "chats", selectedChat.id),
        {
          lastMessage: newMessage.trim(),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        sender: user.email,
        receiver: otherUserEmail,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
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
            <div className="mt-6 border-t pt-4">
              <div className="text-lg font-semibold mb-2">Chats</div>
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
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                  >
                    <div className="font-medium">{displayName}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {chat.lastMessage || "Say hi!"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chat List (Desktop) */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-300 overflow-y-auto">
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
                  <div className="font-medium">{displayName}</div>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-300 flex justify-between items-center">
          <div className="font-semibold text-lg">
            {selectedChat
              ? `Chat with ${
                  userDetails[
                    selectedChat.participants.find((email) => email !== user.email)
                  ] ||
                  selectedChat.participants.find((email) => email !== user.email)
                }`
              : "Select a chat"}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {selectedChat ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === user.email ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    msg.sender === user.email
                      ? "bg-blue-500 text-white rounded-br-none"
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

        {/* Message Input */}
        {selectedChat && (
          <div className="p-4 bg-white border-t border-gray-300 flex gap-3">
            <input
              type="text"
              placeholder="Type a message..."
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
