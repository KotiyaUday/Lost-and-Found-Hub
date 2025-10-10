"use client";
import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Sideheader from "@/Components/Sideheader";

export default function ChatPage({ searchParams }) {
  // const { otherUser: initialOtherUser, itemImage: initialItemImage } =
  //   searchParams || {};
  const currentUser = auth.currentUser?.email;
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const otherUserEmail = searchParams.get("otherUser");
  const itemImage = searchParams.get("itemImage");
  const itemTitle = searchParams.get("itemTitle");

  // 🔹 Load all chat users
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user, please log in.");
      return;
    }
    console.log("Current User:", currentUser);
    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot Data:", snapshot.docs.map((d) => d.data()));
      const users = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const participants = data.participants || [];
        if (participants.includes(currentUser)) {
          const otherUser = participants.find((u) => u !== currentUser);
          if (otherUser) {
            users.push({
              email: otherUser,
              chatId: doc.id,
              itemImage: data.itemImage || null,
              itemTitle: data.itemTitle || "Unnamed Item",
            });
          }
        }
      });
      setChatUsers(users);
      console.log("Chat Users:", users);

      if (otherUserEmail && !selectedUser) {
        const user = users.find((u) => u.email === decodeURIComponent(otherUserEmail));
        if (user) {
          setSelectedUser(user);
        } else {
          const newChatId = [currentUser, decodeURIComponent(otherUserEmail)].sort().join("_");
          setSelectedUser({
            email: decodeURIComponent(otherUserEmail),
            chatId: newChatId,
            itemImage: itemImage || null,
            itemTitle: itemTitle || "Unnamed Item",
          });
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, otherUserEmail, itemImage, itemTitle, selectedUser]);

  // 🔹 Load messages for selected user
  useEffect(() => {
    if (!selectedUser) {
      console.log("No selected user.");
      setMessages([]);
      return;
    }
    console.log("Selected User:", selectedUser);
    const q = query(
      collection(db, "chats", selectedUser.chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      console.log("Messages:", msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) {
      console.log("Cannot send message: Empty message or no selected user.");
      return;
    }

    try {
      const chatId = [currentUser, selectedUser.email].sort().join("_");
      await setDoc(doc(db, "chats", chatId), {
        participants: [currentUser, selectedUser.email],
        itemImage: selectedUser.itemImage || itemImage || null,
        itemTitle: selectedUser.itemTitle || itemTitle || "Unnamed Item",
      }, { merge: true });

      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender: currentUser,
        text: newMessage.trim(),
        timestamp: new Date(),
      });

      console.log("Message sent successfully.");
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar / User List */}
      <div className="w-64 border-r bg-white shadow-md">
        <Sideheader currentPath={pathname} />
        <div className="mt-16 overflow-y-auto h-[calc(100vh-96px)]">
          {chatUsers.map((user) => (
            <div
              key={user.chatId}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center cursor-pointer p-3 hover:bg-indigo-100 ${
                selectedUser?.chatId === user.chatId ? "bg-indigo-200" : ""
              }`}
            >
              {user.itemImage && (
                <img
                  src={user.itemImage}
                  alt={user.itemTitle}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              )}
              <div>
                <span className="font-medium text-gray-800">{user.email}</span>
                <p className="text-xs text-gray-500">{user.itemTitle}</p>
              </div>
            </div>
          ))}
          {chatUsers.length === 0 && (
            <p className="p-3 text-gray-400">No chats yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center space-x-4">
              {selectedUser.itemImage && (
                <img
                  src={selectedUser.itemImage}
                  alt={selectedUser.itemTitle}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-indigo-700">
                  {selectedUser.email}
                </h2>
                <p className="text-sm text-gray-500">{selectedUser.itemTitle}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.length === 0 && (
                <p className="text-gray-400 italic text-center">No messages yet</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === currentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
                      msg.sender === currentUser
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

            {/* Input */}
            <div className="p-3 border-t bg-white flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p className="text-xl">Select a chat to start messaging 💬</p>
          </div>
        )}
      </div>
    </div>
  );
}