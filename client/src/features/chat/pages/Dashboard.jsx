// import React from 'react'

// import { useChat } from '../hooks/useChat';
// import { useEffect } from 'react';
// import { initializeSocket } from '../service/chat.socket';


// const Dashboard = () => {
//   const chat = useChat();
//      const {user} = useSelector((state) => state.auth);
//     console.log('Current user:', user);

//     useEffect(()=>{
//       chat.initializeSocket();
//     },[])
//   return (
//     <main className='h-screen w-full flex bg-neutral-800'>

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hooks/useChat";
import { setCurrentChatId, createNewChat, addNewMessage } from "../chat.slice";
import { getSocket } from "../service/chat.socket";

const navItems = [
  { icon: "⊹", label: "Discover", active: false },
  { icon: "◈", label: "Spaces", active: false },
  { icon: "⟁", label: "Finance", active: false },
  { icon: "⋯", label: "More", active: false },
];




const suggestions = [
  "Explain dark matter simply",
  "Best practices in TypeScript",
  "Summarize today's tech news",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Sidebar({ active, setActive, threads, newThread, onSelectChat }) {
  return (
    <aside
      className="flex flex-col h-full w-64 shrink-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(10,14,20,0.98) 0%, rgba(13,18,26,0.98) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
            boxShadow: "0 0 16px rgba(13,148,136,0.4)",
          }}
        >
          ✦
        </div>
        <span
          className="text-white font-semibold tracking-wide text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}
        >
          INTERA AI
        </span>
      </div>

      {/* Search + Computer */}
      <div className="px-3 mb-3">
        {["Search", "Computer"].map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 text-left"
            style={{
              background:
                active === item
                  ? "rgba(13,148,136,0.12)"
                  : "transparent",
              border:
                active === item
                  ? "1px solid rgba(13,148,136,0.25)"
                  : "1px solid transparent",
              color: active === item ? "#2dd4bf" : "rgba(255,255,255,0.45)",
            }}
          >
            <span className="text-xs opacity-70">{i === 0 ? "⌕" : "⊡"}</span>
            <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {item}
            </span>
          </button>
        ))}
      </div>

      {/* New Thread */}
      <div className="px-3 mb-4">
        <button
          onClick={newThread}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{ background: "rgba(13,148,136,0.2)", color: "#2dd4bf" }}
          >
            +
          </span>
          New thread
        </button>
      </div>

      <div className="px-3 mb-2">
        <p className="text-xs px-2 mb-2 font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
          RECENTS
        </p>
        <div className="space-y-0.5">
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectChat(t.id)}
              className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: t.active ? "rgba(13,148,136,0.1)" : "transparent",
                borderLeft: t.active ? "2px solid #0d9488" : "2px solid transparent",
              }}
            >
              <span
                className="text-sm truncate"
                style={{
                  color: t.active ? "#2dd4bf" : "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {t.title}
              </span>
              <span className="text-xs shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.2)" }}>
                {t.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav items */}
      <div className="px-3 mt-auto mb-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Sign In */}
      <div
        className="mx-3 mb-4 px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
          style={{
            background: "linear-gradient(135deg, #0d9488, #0891b2)",
            color: "white",
          }}
        >
          ✦
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
            Sign In
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
            Unlock full access
          </p>
        </div>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
      </div>
    </aside>
  );
}

function ChatMessage({ msg, isNew }) {
  const [visible, setVisible] = useState(!isNew);
  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-xs text-sm"
          style={{
            background: "linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(8,145,178,0.2) 100%)",
            border: "1px solid rgba(13,148,136,0.3)",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 0 20px rgba(13,148,136,0.1)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mb-6 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, #0d9488, #0891b2)",
            boxShadow: "0 0 12px rgba(13,148,136,0.3)",
          }}
        >
          ✦
        </div>
        <div className="flex-1">
          {msg.typing ? (
            <div
              className="inline-flex px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <TypingIndicator />
            </div>
          ) : (
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.82)",
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: "560px",
              }}
            >
              {msg.content}
            </div>
          )}
          {!msg.typing && !msg.streaming && (
            <div className="flex items-center gap-2 mt-2 px-1">
              {["↗", "↓", "⧉", "↺"].map((icon, i) => (
                <button
                  key={i}
                  className="text-xs w-6 h-6 flex items-center justify-center rounded-md transition-all duration-150"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  {icon}
                </button>
              ))}
              <div className="ml-auto flex gap-1.5">
                <button
                  className="text-xs w-6 h-6 flex items-center justify-center rounded-md transition-all"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  ↑
                </button>
                <button
                  className="text-xs w-6 h-6 flex items-center justify-center rounded-md transition-all"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  ↓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { initializeSocket, handleSendMessage, handleGetChats, handleGetMessages } = useChat();
  const { chats, currentChatId } = useSelector((state) => state.chat);
  console.log('Current user:', chats);

  const [messages, setMessages] = useState([
    { id: 1, role: "user", content: "hi", isNew: false },
    { id: 2, role: "assistant", content: "Hi! What's up? 😊", isNew: false },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("Search");
  // const [model, setModel] = useState("intera Pro");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Derive threads array from Redux chats object
  const threads = Object.values(chats).map((chat) => ({
    id: chat.id,
    title: chat.title,
    time: chat.lastUpdated ? new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
    active: chat.id === currentChatId,
  }));

  const currentChatIdRef = useRef(currentChatId);
  const activeMessageContentRef = useRef("");
  const dispatch = useDispatch();

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const socket = initializeSocket();
    handleGetChats();

    socket.on("ai_stream_start", ({ chatId, title }) => {
      // If it's a new chat, setup the thread in Redux
      dispatch(createNewChat({ chatId, title }));
      dispatch(setCurrentChatId(chatId));
    });

    socket.on("ai_chunk", ({ chatId, content }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.role === "assistant" && (m.typing || m.streaming)) {
            return { ...m, typing: false, streaming: true, content: m.content + content };
          }
          return m;
        })
      );
    });

    socket.on("ai_stream_end", ({ chatId, aiMessage }) => {
      setLoading(false);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.role === "assistant" && (m.typing || m.streaming)) {
            return { ...m, typing: false, streaming: false, content: aiMessage.content };
          }
          return m;
        })
      );

      // Persist the user and ai messages in Redux history
      dispatch(addNewMessage({
        chatId,
        content: activeMessageContentRef.current,
        role: "user"
      }));
      dispatch(addNewMessage({
        chatId,
        content: aiMessage.content,
        role: "ai"
      }));
    });

    socket.on("ai_error", ({ message }) => {
      setLoading(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.typing || m.streaming
            ? { ...m, typing: false, streaming: false, content: message || "Something went wrong. Please try again." }
            : m
        )
      );
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setLoading(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.typing || m.streaming
            ? { ...m, typing: false, streaming: false, content: "Connection failed. Please verify your login session." }
            : m
        )
      );
    });

    return () => {
      socket.off("ai_stream_start");
      socket.off("ai_chunk");
      socket.off("ai_stream_end");
      socket.off("ai_error");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch and display messages when a chat is selected
  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }
    // Guard: Do not overwrite local messages with a database fetch while streaming a response
    if (loading) {
      return;
    }
    // If messages already loaded in Redux, use them
    const cached = chats[currentChatId]?.messages;
    if (cached && cached.length > 0) {
      setMessages(cached.map((m, i) => ({
        id: i,
        role: m.role === "ai" ? "assistant" : m.role,
        content: m.content,
        isNew: false,
      })));
    } else {
      // Fetch from API
      handleGetMessages(currentChatId).then((fetched) => {
        if (fetched) {
          setMessages(fetched.map((m, i) => ({
            id: i,
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
            isNew: false,
          })));
        }
      });
    }
  }, [currentChatId]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    activeMessageContentRef.current = content;

    const userMsg = { id: Date.now(), role: "user", content, isNew: true };
    const typingMsg = { id: Date.now() + 1, role: "assistant", typing: true, content: "", isNew: true };
    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const socket = getSocket();
      console.log("📤 sendMessage called with content:", content, "| currentChatIdRef:", currentChatIdRef.current);
      console.log("Socket connection status:", socket.connected, "| socket ID:", socket.id);
      
      if (!socket.connected) {
        throw new Error("Chat server is disconnected. Please refresh or log in again.");
      }
      
      socket.emit("send_message", { message: content, chatId: currentChatIdRef.current });
      console.log("✅ Event 'send_message' emitted to server");
    } catch (err) {
      console.error("❌ Error in sendMessage:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.typing
            ? { ...m, typing: false, content: err.message || "Failed to connect to chat server." }
            : m
        )
      );
      setLoading(false);
    }
  };

  const newThread = () => {
    dispatch(setCurrentChatId(null));
    setMessages([]);
  };

  const handleSelectChat = (chatId) => {
    dispatch(setCurrentChatId(chatId));
    // messages will be loaded by the currentChatId useEffect above
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "#080c12",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        textarea { resize: none; }
        .glow-border:focus-within {
          box-shadow: 0 0 0 1px rgba(13,148,136,0.4), 0 0 24px rgba(13,148,136,0.08);
        }
      `}</style>

      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-100px",
          left: "200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(13,148,136,0.04) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <Sidebar active={activeNav} setActive={setActiveNav} threads={threads} newThread={newThread} onSelectChat={handleSelectChat} />

      {/* Main */}
      <main className="flex flex-col flex-1 relative" style={{ zIndex: 1 }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "rgba(13,148,136,0.12)",
                border: "1px solid rgba(13,148,136,0.2)",
                color: "#2dd4bf",
              }}
            >
              Active thread
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-xs px-4 py-2 rounded-xl font-medium transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              ↗ Share
            </button>
            <button className="text-xs w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)" }}>
              ···
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8">
          <div className="max-w-2xl mx-auto min-h-full flex flex-col py-8">
            {messages.length > 0 ? (
              <>
                <div className="flex-grow" />
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} isNew={msg.isNew} />
                ))}
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center h-64 gap-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{
                      background: "linear-gradient(135deg, #0d9488, #0891b2)",
                      boxShadow: "0 0 32px rgba(13,148,136,0.3)",
                    }}
                  >
                    ✦
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    What do you want to explore today?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-4 py-2 rounded-xl transition-all duration-200"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.5)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(13,148,136,0.3)";
                          e.currentTarget.style.color = "#2dd4bf";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-8 pb-6 pt-2 shrink-0">
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-1 glow-border transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="flex items-end gap-3 px-4 pt-3 pb-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                    caretColor: "#2dd4bf",
                    minHeight: "24px",
                    maxHeight: "120px",
                    overflowY: "auto",
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 transition-all duration-200"
                  style={{
                    background:
                      input.trim() && !loading
                        ? "linear-gradient(135deg, #0d9488, #0891b2)"
                        : "rgba(255,255,255,0.06)",
                    color: input.trim() && !loading ? "white" : "rgba(255,255,255,0.2)",
                    boxShadow: input.trim() && !loading ? "0 0 16px rgba(13,148,136,0.35)" : "none",
                  }}
                >
                  ↑
                </button>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-xs transition-all"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    +
                  </button>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-xs transition-all"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    ♪
                  </button>
                </div>

                {/* Model selector */}
                {/* <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#2dd4bf", boxShadow: "0 0 6px #2dd4bf" }}
                  />
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="text-xs bg-transparent border-0 outline-none cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <option value="intera Pro" style={{ background: "#0d1117" }}>intera Pro</option>
                    <option value="intera Fast" style={{ background: "#0d1117" }}>intera Fast</option>
                    <option value="intera Mini" style={{ background: "#0d1117" }}>intera Mini</option>
                  </select>
                </div> */}
              </div>
            </div>

            <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.15)" }}>
              intera can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}