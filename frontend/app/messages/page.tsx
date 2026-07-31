'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useSocket } from '@/lib/SocketContext';

interface Conversation {
  user: {
    id: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
}

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages');
      setConversations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setActiveMessages(data.data || []);
      setConversations(prev => prev.map(c =>
        c.user.id === userId ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchConversations();
    });
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      queueMicrotask(() => {
        void fetchMessages(activeConversationId);
      });
    }
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      // If it belongs to the active conversation, append it
      if (
        (newMessage.sender_id === activeConversationId && newMessage.receiver_id === currentUser?.id) ||
        (newMessage.sender_id === currentUser?.id && newMessage.receiver_id === activeConversationId)
      ) {
        setActiveMessages(prev => [...prev, newMessage]);
      }
      // Re-fetch conversations to update last message and unread count
      void fetchConversations();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeConversationId, currentUser, fetchConversations]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConversationId) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const { data } = await api.post(`/messages/${activeConversationId}`, {
        content: textToSend
      });
      
      // The server will also broadcast this back to us via socket, but we can optimistically add it if we want
      // For now, let's just let the socket handle our own sent messages if we broadcast it, 
      // Wait, our backend ONLY emits to the receiver! Let's check backend.
      // In messageController, we only `emitToUser(userId, 'new_message', result.rows[0])` (the receiver).
      // So the sender must append the message manually here.
      
      const sentMessage: Message = {
        ...data.data,
        sender: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          role: currentUser?.role || 'athlete',
          photo_url: currentUser?.photo_url || null
        }
      };
      
      setActiveMessages(prev => [...prev, sentMessage]);
      void fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const activeConversation = conversations.find(c => c.user.id === activeConversationId);

  return (
    <div className="flex h-full bg-white">
      {/* Left Pane: Conversations */}
      <div className="w-1/3 min-w-[300px] border-r border-theme-border flex flex-col bg-[#F8FAFC]">
        <div className="p-4 border-b border-theme-border flex items-center justify-between bg-white">
          <h2 className="font-bold text-[18px] text-theme-charcoal">Messages</h2>
          <button className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-theme-charcoal transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </button>
        </div>
        <div className="p-3 border-b border-theme-border bg-white">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-slate">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search messages..." className="w-full bg-[#F0F2F5] text-[14px] pl-9 pr-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-theme-border" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No conversations yet. Connect with other users to start chatting!
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.user.id} 
                onClick={() => setActiveConversationId(conv.user.id)}
                className={`flex items-start gap-3 p-4 cursor-pointer border-b border-theme-border/50 hover:bg-[#F0F2F5] transition-colors ${activeConversationId === conv.user.id ? 'bg-[#F0F2F5]' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden shadow-sm">
                  {conv.user.photo_url ? (
                    <img src={conv.user.photo_url} alt={conv.user.name} className="w-full h-full object-cover" />
                  ) : (
                    conv.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[15px] text-theme-charcoal truncate">{conv.user.name}</h4>
                      <span className="text-[11px] font-semibold text-theme-slate">
                        {new Date(conv.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-[13px] truncate ${conv.unread_count > 0 ? 'text-theme-charcoal font-semibold' : 'text-theme-slate'}`}>{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-theme-coral flex items-center justify-center text-[11px] text-white font-bold flex-shrink-0 mt-1">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-theme-border bg-white flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden shadow-sm">
                  {activeConversation.user.photo_url ? (
                    <img src={activeConversation.user.photo_url} alt={activeConversation.user.name} className="w-full h-full object-cover" />
                  ) : (
                    activeConversation.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-theme-charcoal leading-tight">{activeConversation.user.name}</h4>
                  <span className="text-[12px] font-semibold text-theme-slate capitalize">{activeConversation.user.role}</span>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#F8FAFC]">
              {activeMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 text-xs overflow-hidden mr-3 mt-auto mb-1">
                        {activeConversation.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed ${
                        isMe 
                          ? 'bg-black text-white rounded-br-sm shadow-sm' 
                          : 'bg-white text-theme-charcoal border border-theme-border rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[11px] font-semibold text-theme-slate mt-1.5 mx-1">
                        {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-theme-border">
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-theme-border rounded-full pl-5 pr-2 py-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent text-[15px] outline-none text-theme-charcoal placeholder-theme-slate"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <button 
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-full bg-theme-cobalt flex items-center justify-center text-white font-bold disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm"
                  disabled={!inputText.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-theme-slate bg-[#F8FAFC]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-theme-slate opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-theme-charcoal mb-1">Your Messages</h3>
            <p className="text-[14px] font-medium text-theme-slate max-w-[250px] text-center">Select an existing conversation or start a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
