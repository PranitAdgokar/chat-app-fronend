import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageSkeleton from './MessageSkeleton';
import { formatMessageTime } from '../lib/utils';
import { Check, CheckCheck } from 'lucide-react';

const MessageStatus = ({ messageId }) => {
  const { getMessageStatus } = useAuthStore();
  const status = getMessageStatus(messageId);

  return (
    <span className="inline-flex items-center ml-2">
      {status === 'sent' && (
        <Check className="h-4 w-4 text-gray-400" />
      )}
      {status === 'delivered' && (
        <CheckCheck className="h-4 w-4 text-gray-400" />
      )}
      {status === 'seen' && (
        <CheckCheck className="h-4 w-4 text-blue-500" />
      )}
    </span>
  );
};

const TypingIndicator = () => (
  <div className="flex space-x-2 p-2">
    <div className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
    <div className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
  </div>
);

const ChatContainer = () => {
  const { isMessagesLoading, getMessages, messages, selectedUser } = useChatStore();
  const { authUser, isUserTyping, markMessageAsRead } = useAuthStore();
  const messageEndRef = useRef(null);
  const isTyping = isUserTyping(selectedUser._id);

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  // Mark messages as read when they appear in view
  useEffect(() => {
    const markVisibleMessagesAsRead = () => {
      messages.forEach(message => {
        if (message.senderId === selectedUser._id) {
          markMessageAsRead(message._id, message.senderId);
        }
      });
    };

    markVisibleMessagesAsRead();
  }, [messages, markMessageAsRead, selectedUser._id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            <div className="chat-header mb-1 flex items-center">
            {message.senderId === authUser._id && (
                <MessageStatus messageId={message._id} />
              )}

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
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-gray-200">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messageEndRef} />
      </div>
      <ChatInput />
    </div>
  );
};

export default ChatContainer;