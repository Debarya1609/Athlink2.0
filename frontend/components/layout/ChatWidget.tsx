"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, PublicUser } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { useSocket } from '@/lib/SocketContext';
import api from '@/lib/api';

export function ChatWidget() {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, messagesMap]);

  // Fetch initial conversations
  useEffect(() => {
    if (!currentUser) return;
    
    api.get<{ conversations: Conversation[] }>('/messages/conversations')
      .then(res => {
        setConversations(res.data.conversations || []);
        if (res.data.conversations?.length > 0 && !activeConversationId) {
          setActiveConversationId(res.data.conversations[0].user.id);
        }
      })
      .catch(console.error);
  }, [currentUser]);

  // Search logic for new conversations
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      api.get<{ users: PublicUser[] }>(`/search?q=${searchQuery}`)
        .then(res => {
          setSearchResults(res.data.users || []);
        })
        .catch(console.error);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Fetch messages when a conversation is activated
  useEffect(() => {
    if (!activeConversationId || !currentUser) return;

    api.get<{ messages: Message[] }>(`/messages/${activeConversationId}`)
      .then(res => {
        setMessagesMap(prev => ({
          ...prev,
          [activeConversationId]: res.data.messages || []
        }));
      })
      .catch(console.error);
  }, [activeConversationId, currentUser]);

  // Listen to socket for new messages
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (msg: Message) => {
      // Determine the ID of the other user in this conversation
      const otherUserId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;

      // Update messages map
      setMessagesMap(prev => {
        const existing = prev[otherUserId] || [];
        // prevent duplicate push if we sent it and optimistic updated
        if (existing.some(m => m.id === msg.id)) return prev;
        return {
          ...prev,
          [otherUserId]: [...existing, msg]
        };
      });

      // Update conversations list (move to top, update last_message)
      setConversations(prev => {
        const idx = prev.findIndex(c => c.user.id === otherUserId);
        const updatedConv = idx !== -1 ? { ...prev[idx] } : null;
        
        if (updatedConv) {
          updatedConv.last_message = msg.content;
          updatedConv.updated_at = msg.created_at;
          if (activeConversationId !== otherUserId) {
            updatedConv.unread_count += 1;
          }
          const filtered = prev.filter(c => c.user.id !== otherUserId);
          return [updatedConv, ...filtered];
        }
        
        // If we don't have this conversation in the list, we might want to refetch conversations
        api.get<{ conversations: Conversation[] }>('/messages/conversations')
          .then(res => setConversations(res.data.conversations || []))
          .catch(console.error);
          
        return prev;
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, currentUser, activeConversationId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversationId || !currentUser) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    
    // Optimistic update
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: activeConversationId,
      content: textToSend,
      read: false,
      created_at: new Date().toISOString()
    };
    
    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), tempMsg]
    }));

    try {
      await api.post(`/messages/${activeConversationId}`, { content: textToSend });
    } catch (err) {
      console.error(err);
      // optionally revert optimistic update
    }
  };

  const startNewConversation = (user: PublicUser) => {
    setSearchQuery('');
    
    // If it doesn't exist in conversations, add a temporary one
    if (!conversations.some(c => c.user.id === user.id)) {
      setConversations(prev => [{
        id: 'new-' + user.id,
        user: user,
        last_message: '',
        unread_count: 0,
        updated_at: new Date().toISOString()
      }, ...prev]);
    }
    setActiveConversationId(user.id);
  };

  if (!currentUser) return null;

  const activeMessages = activeConversationId ? messagesMap[activeConversationId] || [] : [];
  const activeConversation = conversations.find(c => c.user.id === activeConversationId);
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);

  if (isOpen && !isMaximized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72 bg-white rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-[var(--color-gray-15)] flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-[var(--color-paper)] transition-colors" onClick={() => setIsMaximized(true)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-[var(--color-white)] font-display font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <span className="font-display font-bold uppercase tracking-widest text-[14px] text-[var(--color-ink)]">Inbox</span>
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
      {isOpen && isMaximized && (
        <div className="bg-white rounded-t-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--color-gray-15)] w-[700px] max-w-[calc(100vw-48px)] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[var(--color-ink)] p-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-display font-bold text-sm">
                  {currentUser.name.charAt(0)}
               </div>
              <h3 className="font-display font-bold uppercase tracking-widest text-white text-[15px]">Inbox</h3>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Tabs */}
              <div className="flex items-center gap-4 text-[12px] font-mono uppercase tracking-widest text-white font-bold">
                <span className="cursor-pointer border-b-2 border-white pb-0.5">Messages</span>
                <span className="cursor-pointer text-[var(--color-gray-40)] hover:text-white transition-colors pb-0.5">Notifications</span>
              </div>
              
              <div className="flex items-center gap-2 border-l border-[var(--color-gray-60)] pl-4">
                <button onClick={() => setIsMaximized(false)} className="text-[var(--color-gray-40)] hover:text-white transition-colors p-1" title="Minimize">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-[var(--color-gray-40)] hover:text-[var(--color-error)] transition-colors p-1" title="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/3 min-w-[220px] border-r border-theme-border flex flex-col bg-white">
               <div className="p-3 border-b border-theme-border relative">
                  <input 
                    type="text" 
                    placeholder="Search users to message" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F0F2F5] text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-theme-border" 
                  />
                  {searchQuery && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-theme-border mt-1 z-10 max-h-48 overflow-y-auto rounded">
                      {searchResults.map(user => (
                        <div 
                          key={user.id}
                          className="p-2 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => startNewConversation(user)}
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                            {user.photo_url ? <img src={user.photo_url} alt={user.name} /> : user.name.charAt(0)}
                          </div>
                          <div className="text-xs font-bold text-gray-800">{user.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               <div className="flex-1 overflow-y-auto">
                 {conversations.map(conv => (
                   <div 
                     key={conv.id || conv.user.id} 
                     onClick={() => {
                        setActiveConversationId(conv.user.id);
                        if (conv.unread_count > 0) {
                          setConversations(prev => prev.map(c => c.user.id === conv.user.id ? { ...c, unread_count: 0 } : c));
                        }
                     }}
                     className={`flex items-start gap-3 p-3 cursor-pointer border-b border-theme-border/50 hover:bg-[#F8FAFC] transition-colors ${activeConversationId === conv.user.id ? 'bg-[#F0F2F5]' : ''}`}
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
                         <p className="text-[12px] text-theme-slate truncate">{conv.last_message || 'Say hi!'}</p>
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

            <div className="flex-1 flex flex-col bg-[#F8FAFC] relative">
              {activeConversation ? (
                <>
                  <div className="p-3 border-b border-theme-border bg-white flex items-center gap-3">
                    <h4 className="font-bold text-[15px] text-theme-charcoal">{activeConversation.user.name}</h4>
                    <span className="text-[11px] text-theme-slate bg-gray-100 px-2 py-0.5 rounded capitalize">{activeConversation.user.role}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {activeMessages.map((msg, idx) => {
                      const isMe = msg.sender_id === currentUser.id;
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

                  <div className="p-3 bg-white border-t border-theme-border">
                    <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-full px-4 py-2">
                      <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Write a message..." 
                        className="flex-1 bg-transparent text-[14px] outline-none text-theme-charcoal"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                      />
                      <button onClick={handleSendMessage} className="text-theme-cobalt font-bold text-[14px] disabled:opacity-50" disabled={!inputText.trim()}>
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

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="mb-6 bg-[var(--color-ink)] text-[var(--color-white)] px-6 py-3.5 rounded-full font-display font-bold uppercase tracking-widest shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300 flex items-center gap-2 relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="hidden sm:inline">Inbox</span>
          {totalUnread > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-ink)]"></span>
          )}
        </button>
      )}
    </div>
  );
}
