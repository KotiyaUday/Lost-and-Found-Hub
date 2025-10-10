"use client";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import Sideheader from "@/Components/Sideheader";

const categoryQuestions = {
  Electronics: [
    "Device model?",
    "Serial number?",
    "Purchase bill?",
    "Password/Passcode?",
  ],
  Wallet: [
    "Wallet brand?",
    "Color?",
    "Last transaction?",
    "Contents description?",
  ],
  Jewelry: ["Type?", "Material?", "Purchase date?", "Engraving/mark?"],
  Documents: ["Document type?", "Issue date?", "Unique ID?", "Place of issue?"],
  Clothing: ["Brand?", "Size?", "Color?", "Unique marks/patterns?"],
  Other: ["Custom question?"],
};

const Message = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Track current logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const convRef = collection(db, "conversations");
    const q = query(convRef); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const messagesRef = collection(
      db,
      "conversations",
      selectedConversation.id,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages([]); // clear old messages while loading
    setNewMessage("");
  };

  const sendMessage = async (text, type = "text") => {
    if (!text.trim() || !selectedConversation || !user) return;
    try {
      await addDoc(
        collection(db, "conversations", selectedConversation.id, "messages"),
        {
          senderId: user.uid,
          text,
          type,
          timestamp: serverTimestamp(),
        }
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = () => sendMessage(newMessage, "text");
  const handleSendQuestion = (question) => sendMessage(question, "question");

  return (
    <div className="bg-gray-100 grid grid-cols-4 min-h-screen">
        <Sideheader />
      <div className="col-start-2 m-5 col-end-5 grid grid-cols-3 mt-10 h-[600px] border rounded-xl overflow-hidden shadow-lg">
        {/* Left Panel: Inbox */}
        <div className="border-r overflow-y-auto bg-gray-50 col-span-1">
          <h2 className="text-xl font-bold p-4 border-b">Inbox</h2>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conv.id ? "bg-gray-200" : ""
              }`}
            >
              <p className="font-semibold text-sm">{conv.itemTitle}</p>
              <p className="text-xs text-gray-600">
                Participants: {conv.users?.length || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Right Panel: Chat Area */}
        <div className="flex flex-col col-span-3 bg-white ml-6 rounded-lg shadow-inner col-start-2 col-end-4">
          {selectedConversation ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold text-indigo-700 mb-4">
                  {selectedConversation.itemTitle}
                </h3>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 p-2 rounded-lg max-w-xs ${
                      msg.senderId === user?.uid
                        ? "bg-indigo-600 text-white self-end"
                        : "bg-gray-300 text-gray-800 self-start"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              <div className="p-4 border-t bg-gray-50 space-x-2 flex flex-wrap">
                {(categoryQuestions[selectedConversation.category] || []).map(
                  (q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuestion(q)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {q}
                    </button>
                  )
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t flex gap-2 bg-gray-50">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;