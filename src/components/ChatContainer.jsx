import React from 'react'
import { useChatStore } from '../store/useChatStore';
import { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageSkeleton from './MessageSkeleton';


const ChatContainer = () => {
  const {isMessagesLoading, getMessages, messages, selectedUser}=useChatStore();

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
      <p className="text-center text-zinc-500">Messages....</p>
      <ChatInput />
    </div>
  )
}

export default ChatContainer