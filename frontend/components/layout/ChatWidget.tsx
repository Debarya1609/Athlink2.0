"use client";

import React, { useState, useEffect, useRef } from 'react';
import { mockConversations, mockMessages, mockUser } from '@/lib/mockData';
import { Conversation, Message } from '@/types';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true); // Default to maximized per user request
  const [activeConversationId, setActiveConversationId] = useState<string | null>(mockConversations[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId]);

  const activeMessages = activeConversationId ? mockMessages[activeConversationId] || [] : [];
  const activeConversation = mockConversations.find(c => c.id === activeConversationId);

  // If minimized, it just shows a small header that can be clicked to open again
  if (isOpen && !isMaximized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72 bg-white rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-theme-border flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsMaximized(true)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-theme-cobalt flex items-center justify-center text-white font-bold text-sm">
            {mockUser.name.charAt(0)}
          </div>
          <span className="font-bold text-[14px] text-theme-charcoal">Messages</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-theme-slate hover:text-theme-coral p-1 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 flex flex-col items-end">
      {/* Expanded Menu */}
      {isOpen && isMaximized && (
        <div className="bg-white rounded-t-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-theme-border w-[700px] max-w-[calc(100vw-48px)] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-black p-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm">
                  {mockUser.name.charAt(0)}
               </div>
              <h3 className="font-bold text-white text-[15px]">Messages</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Minimize Button */}
              <button onClick={() => setIsMaximized(false)} className="text-gray-400 hover:text-white transition-colors p-1" title="Minimize">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              {/* Close Button */}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-theme-coral transition-colors p-1" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Split Pane Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Pane: Conversations */}
            <div className="w-1/3 min-w-[220px] border-r border-theme-border flex flex-col bg-white">
               <div className="p-3 border-b border-theme-border">
                  <input type="text" placeholder="Search messages" className="w-full bg-[#F0F2F5] text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-theme-border" />
               </div>
               <div className="flex-1 overflow-y-auto">
                 {mockConversations.map(conv => (
                   <div 
                     key={conv.id} 
                     onClick={() => setActiveConversationId(conv.id)}
                     className={`flex items-start gap-3 p-3 cursor-pointer border-b border-theme-border/50 hover:bg-[#F8FAFC] transition-colors ${activeConversationId === conv.id ? 'bg-[#F0F2F5]' : ''}`}
                   >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                        {conv.user.photo_url ? (
                          <img src={conv.user.photo_url} alt={conv.user.name} className="w-full h-full object-cover" />
                        ) : (
                          conv.user.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="font-bold text-[14px] text-theme-charcoal truncate">{conv.user.name}</h4>
                         </div>
                         <p className="text-[12px] text-theme-slate truncate">{conv.last_message}</p>
                      </div>
                      {conv.unread_count > 0 && (
                        <div className="w-4 h-4 rounded-full bg-theme-coral flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                          {conv.unread_count}
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            </div>

            {/* Right Pane: Active Chat */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC] relative">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-theme-border bg-white flex items-center gap-3">
                    <h4 className="font-bold text-[15px] text-theme-charcoal">{activeConversation.user.name}</h4>
                    <span className="text-[11px] text-theme-slate bg-gray-100 px-2 py-0.5 rounded capitalize">{activeConversation.user.role}</span>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {activeMessages.map((msg, idx) => {
                      const isMe = msg.sender_id === mockUser.id;
                      return (
                        <div key={msg.id} className={`flex max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-[14px] ${
                            isMe 
                              ? 'bg-black text-white rounded-br-sm' 
                              : 'bg-[#E4E6EB] text-theme-charcoal rounded-bl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 bg-white border-t border-theme-border">
                    <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-full px-4 py-2">
                      <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Write a message..." 
                        className="flex-1 bg-transparent text-[14px] outline-none text-theme-charcoal"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputText.trim()) {
                            setInputText('');
                            // Logic to send message would go here
                          }
                        }}
                      />
                      <button className="text-theme-cobalt font-bold text-[14px] disabled:opacity-50" disabled={!inputText.trim()}>
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-theme-slate">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <p className="text-[14px] font-medium">Select a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (only visible if completely closed) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="mb-6 bg-black text-theme-gold px-6 py-3.5 rounded-full font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300 flex items-center gap-2 relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="hidden sm:inline">Messages</span>
          {/* Unread badge indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-theme-coral rounded-full border-2 border-black"></span>
        </button>
      )}
    </div>
  );
}
