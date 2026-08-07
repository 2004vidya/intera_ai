import { Server } from 'socket.io';
import jwt from "jsonwebtoken";
import { HumanMessage, AIMessage, SystemMessage } from "langchain";
import { agent, generateTitle, getCacheKey } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import redis from "../config/redis.js";

let io;

const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });
    return list;
};

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"].filter(Boolean),
            credentials: true
        }
    });

    console.log("Socket.io initialized");

    // Authenticate socket connections using JWT token in cookie
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            const cookies = parseCookies(cookieHeader);
            const token = cookies.token;
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decodedToken;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("a user connected via socket:", socket.id, "user ID:", socket.user?.id);

        socket.on("send_message", async ({ message, chatId }) => {
            console.log("📩 [Socket Server] Received send_message event | message:", message, "| chatId:", chatId);
            try {
                if (!message || !message.trim()) {
                    console.log("⚠️ [Socket Server] Message was empty");
                    return socket.emit("ai_error", { message: "Message cannot be empty." });
                }

                let chat = null;
                let isNewChat = false;

                if (!chatId) {
                    isNewChat = true;
                    console.log("💡 [Socket Server] New chat thread, generating title...");
                    const title = await generateTitle(message);
                    console.log("💡 [Socket Server] Generated title:", title);
                    chat = await chatModel.create({
                        user: socket.user.id,
                        title,
                    });
                    chatId = chat._id.toString();
                    console.log("💡 [Socket Server] Created new chat with ID:", chatId);
                } else {
                    console.log("🔍 [Socket Server] Existing chat, finding chat by ID:", chatId);
                    chat = await chatModel.findById(chatId);
                    if (!chat) {
                        console.log("⚠️ [Socket Server] Chat session not found");
                        return socket.emit("ai_error", { message: "Chat session not found." });
                    }
                }

                // 1. Save user message to database
                console.log("💾 [Socket Server] Saving user message to MongoDB...");
                const userMessage = await messageModel.create({
                    chat: chatId,
                    content: message,
                    role: "user",
                });
                console.log("💾 [Socket Server] User message saved successfully");

                // 2. Emit stream start event
                socket.emit("ai_stream_start", { chatId, title: chat.title });
                console.log("📢 [Socket Server] Emitted ai_stream_start event");

                const key = getCacheKey(message);
                console.log("⚡ [Socket Server] Querying Redis cache with key:", key);

                // Check Redis Cache
                const cached = await redis.get(key);
                if (cached) {
                    console.log("✅ Cache Hit (Socket)");
                    
                    // Emit cached content
                    socket.emit("ai_chunk", { chatId, content: cached });

                    // Save finished AI response to database
                    const aiMessage = await messageModel.create({
                        chat: chatId,
                        content: cached,
                        role: "ai",
                    });

                    // Emit stream end event
                    socket.emit("ai_stream_end", { chatId, aiMessage });
                    return;
                }

                console.log("❌ Cache Miss (Socket)");

                // 3. Load full message history
                const messages = await messageModel.find({ chat: chatId });
                const langchainMessages = messages.map((msg) => {
                    if (msg.role === "user") {
                        return new HumanMessage(msg.content);
                    } else if (msg.role === "ai") {
                        return new AIMessage(msg.content);
                    } else {
                        return new SystemMessage(msg.content);
                    }
                });

                // 4. Stream tokens using agent.streamEvents
                const eventStream = agent.streamEvents(
                    { messages: langchainMessages },
                    { version: "v2" }
                );

                let fullContent = "";

                for await (const event of eventStream) {
                    if (event.event === "on_chat_model_stream" && event.data.chunk) {
                        const content = event.data.chunk.content;
                        if (content) {
                             console.log("Stream Chunk:", content);
                            fullContent += content;
                            socket.emit("ai_chunk", { chatId, content });
                        }
                    }
                }

                // 5. Save finished AI response to database
                const aiMessage = await messageModel.create({
                    chat: chatId,
                    content: fullContent || "I'm here to help!",
                    role: "ai",
                });

                // Cache response in Redis
                if (fullContent) {
                    await redis.set(key, fullContent, "EX", 3600);
                }

                // 6. Emit stream end event
                socket.emit("ai_stream_end", { chatId, aiMessage });

            } catch (error) {
                console.error("Error in send_message socket handler:", error);
                socket.emit("ai_error", { message: "Internal server error generating response." });
            }
        });

        socket.on("disconnect", () => {
            console.log("user disconnected:", socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}