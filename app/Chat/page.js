"use client";
import React, { useState, useRef, useEffect } from "react";
import Sideheader from "@/Components/Sideheader";

export default function ChatPage() {
  // Mock user list (you can replace with Firestore users later)
  const [users] = useState([
    { id: 1, name: "Ravi Kumar", lastMessage: "Thanks, I got my bag!", online: true },
    { id: 2, name: "Priya Sharma", lastMessage: "Did you find my keys?", online: false },
    { id: 3, name: "Aman Patel", lastMessage: "Let’s meet near library.", online: true },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([
    { id: 1, sender: "other", text: "Hey 👋, how can I help you?" },
    { id: 2, sender: "me", text: "Hi! I found your wallet near the cafeteria." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: Date.now(), sender: "me", text: newMessage.trim() },
    ]);
    setNewMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r bg-white shadow-md">
        <Sideheader />
      </div>

      {/* Chat Layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Panel: User List */}
        <div className="w-full md:w-1/3 border-r bg-white shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-indigo-700">Messages</h2>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-70px)]">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-50 transition-all ${
                  selectedUser?.id === user.id ? "bg-indigo-100" : ""
                }`}
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-500 truncate w-40">
                    {user.lastMessage}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex flex-col flex-1">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-indigo-700">
                    💬 {selectedUser.name}
                  </h2>
                  <span
                    className={`text-sm ${
                      selectedUser.online ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {selectedUser.online ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 md:px-8 md:py-5 bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm md:text-base shadow-md ${
                        msg.sender === "me"
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
            // Default Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <h2 className="text-xl font-semibold text-indigo-700">
                Select a user to start chat 💬
              </h2>
              <p className="mt-2 text-sm">Your conversations will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
