import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageSkeleton from './MessageSkeleton';
import { formatMessageTime } from '../lib/utils';

// Move TypingIndicator inside ChatContainer to access selectedUser
const TypingIndicator = ({ selectedUser }) => (
  <div className="chat chat-start">
    <div className="chat-image avatar">
      <div className="size-10 rounded-full border">
        <img src={selectedUser?.profilePic || "/avatar.png"} alt="profile Pic" />
      </div>
    </div>
    <div className="chat-bubble min-h-8 min-w-12 flex items-center justify-center bg-base-200">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.1s]"></div>
      </div>
    </div>
  </div>
);

const ChatContainer = () => {
  const { isMessagesLoading, getMessages, messages, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser, isUserTyping } = useAuthStore();
  const messageEndRef = useRef(null);
  const isTyping = isUserTyping(selectedUser?._id);

  useEffect(() => {
    
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
   
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <ChatInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile Pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && selectedUser && <TypingIndicator selectedUser={selectedUser} />}

        {/* Scroll anchor */}
        <div ref={messageEndRef} />
      </div>
      <ChatInput />
    </div>
  );
};

export default ChatContainer;