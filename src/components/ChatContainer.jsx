import React from 'react'
import { useChatStore } from '../store/useChatStore';
import { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageSkeleton from './MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { useRef } from 'react'; 
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const {isMessagesLoading, getMessages, messages, selectedUser}=useChatStore();
const {authUser}=useAuthStore();
const messageEndRef = useRef(null);

  useEffect(()=>{
    getMessages(selectedUser._id);
  }
  ,[selectedUser._id, getMessages])

  if(isMessagesLoading){ return <div className="flex-1 flex flex-col overflow-auto">
    <ChatHeader />
    <MessageSkeleton />
    <ChatInput />
    </div> 
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message._id}
         className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} `}
         ref={messageEndRef}
         >
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={message.senderId===authUser._id? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile Pic" />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time datetime="text-xs opacity-50 ml-1">
              {formatMessageTime (message.createdAt)}
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
      


    </div>
      <ChatInput />
    </div>
  )
}

export default ChatContainer