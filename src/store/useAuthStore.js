import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingnIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isUserTyping: false,
  onlineUsers: [],
  socket: null,
  messageStatuses: new Map(), // Track message statuses
  typingUsers: new Map(), // Track who's typing

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({
        authUser: null,
        messageStatuses: new Map(),
        typingUsers: new Map(),
      });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  // Message status management
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messageStatuses: new Map(state.messageStatuses).set(messageId, {
        status,
        timestamp: new Date(),
      }),
    }));
  },

  getMessageStatus: (messageId) => {
    return get().messageStatuses.get(messageId)?.status || "sent";
  },

  // Typing status management
  setUserTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: new Map(state.typingUsers).set(userId, isTyping),
    }));
  },

  isUserTyping: (userId) => {
    return get().typingUsers.get(userId) || false;
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const addMessage = useChatStore((state) => state.addMessage);
    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket: socket });

    // Existing socket event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // New socket events for message status
    socket.on("messageStatus", ({ messageId, status }) => {
      get().updateMessageStatus(messageId, status);
    });

    socket.on("newMessage", (message) => {
      // Mark message as delivered when received
      socket.emit("messageRead", {
        messageId: message._id,
        senderId: message.sender,
      });
      addMessage(message);
      get().updateMessageStatus(message._id, "delivered");
    });

    // Typing status events
    socket.on("userTyping", ({ userId }) => {
      get().setUserTyping(userId, true);
    });

    socket.on("userStopTyping", ({ userId }) => {
      get().setUserTyping(userId, false);
    });
  },

  // Mark message as read
  markMessageAsRead: (messageId, senderId) => {
    const socket = get().socket;
    if (!socket?.connected) return;

    socket.emit("messageRead", {
      messageId,
      senderId,
    });
    get().updateMessageStatus(messageId, "seen");
  },

  // Handle typing indicators
  sendTypingStatus: (receiverId, isTyping) => {
    const socket = get().socket;
    if (!socket?.connected) return;

    socket.emit(isTyping ? "typing" : "stopTyping", { receiverId });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));
