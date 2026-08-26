"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, PublicUser } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { useSocket } from '@/lib/SocketContext';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function ChatWidget() {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  
  // Mock Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'like', message: 'User 1 liked your post.', created_at: new Date().toISOString(), read: false },
    { id: '2', type: 'follow', message: 'User 2 started following you.', created_at: new Date().toISOString(), read: false },
    { id: '3', type: 'comment', message: 'User 3 commented on your story.', created_at: new Date(Date.now() - 86400000).toISOString(), read: true }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversationId, messagesMap, activeTab]);

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
      const otherUserId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;

      setMessagesMap(prev => {
        const existing = prev[otherUserId] || [];
        if (existing.some(m => m.id === msg.id)) return prev;
        return {
          ...prev,
          [otherUserId]: [...existing, msg]
        };
      });

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
    }
  };

  const startNewConversation = (user: PublicUser) => {
    setSearchQuery('');
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

  const markNotificationDone = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!currentUser) return null;

  const activeMessages = activeConversationId ? messagesMap[activeConversationId] || [] : [];
  const activeConversation = conversations.find(c => c.user.id === activeConversationId);
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

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
              <div className="flex items-center gap-4 text-[12px] font-mono uppercase tracking-widest text-white font-bold mt-1">
                <span onClick={() => setActiveTab('messages')} className={`cursor-pointer pb-0.5 transition-colors border-b-2 ${activeTab === 'messages' ? 'border-white' : 'border-transparent text-[var(--color-gray-40)] hover:text-white'}`}>Messages</span>
                <span onClick={() => setActiveTab('notifications')} className={`cursor-pointer pb-0.5 transition-colors border-b-2 relative ${activeTab === 'notifications' ? 'border-white' : 'border-transparent text-[var(--color-gray-40)] hover:text-white'}`}>
                  Notifications
                  {unreadNotifications > 0 && <span className="absolute -top-1 -right-2 bg-[var(--color-error)] w-2 h-2 rounded-full"></span>}
                </span>
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
            {activeTab === 'messages' ? (
              <>
                <div className="w-1/3 min-w-[220px] border-r border-[var(--color-gray-15)] flex flex-col bg-white">
                   <div className="p-3 border-b border-[var(--color-gray-15)] relative">
                      <input 
                        type="text" 
                        placeholder="Search users to message" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-paper)] text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[var(--color-gray-15)] text-[var(--color-ink)]" 
                      />
                      {searchQuery && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-[var(--color-gray-15)] mt-1 z-10 max-h-48 overflow-y-auto rounded">
                          {searchResults.map(user => (
                            <div 
                              key={user.id}
                              className="p-2 border-b border-[var(--color-gray-15)] cursor-pointer hover:bg-[var(--color-paper)] flex items-center gap-2"
                              onClick={() => startNewConversation(user)}
                            >
                              <div className="w-6 h-6 rounded-full bg-[var(--color-gray-15)] flex items-center justify-center text-xs overflow-hidden text-[var(--color-ink)]">
                                {user.photo_url ? <img src={user.photo_url} alt={user.name} /> : user.name.charAt(0)}
                              </div>
                              <div className="text-xs font-bold text-[var(--color-ink)]">{user.name}</div>
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
                         className={`flex items-start gap-3 p-3 cursor-pointer border-b border-[var(--color-gray-15)] hover:bg-[var(--color-paper)] transition-colors ${activeConversationId === conv.user.id ? 'bg-[var(--color-paper)]' : ''}`}
                       >
                          <div className="w-10 h-10 rounded-full bg-[var(--color-gray-15)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-ink)] overflow-hidden">
                            {conv.user.photo_url ? (
                              <img src={conv.user.photo_url} alt={conv.user.name} className="w-full h-full object-cover" />
                            ) : (
                              conv.user.name.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-baseline mb-0.5">
                                <h4 className="font-bold text-[14px] text-[var(--color-ink)] truncate">{conv.user.name}</h4>
                             </div>
                             <p className="text-[12px] text-[var(--color-gray-60)] truncate">{conv.last_message || 'Say hi!'}</p>
                          </div>
                          {conv.unread_count > 0 && (
                            <div className="w-4 h-4 rounded-full bg-[var(--color-error)] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                              {conv.unread_count}
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                </div>
    
                <div className="flex-1 flex flex-col bg-[var(--color-white)] relative">
                  {activeConversation ? (
                    <>
                      <div className="p-3 border-b border-[var(--color-gray-15)] bg-[var(--color-white)] flex items-center gap-3">
                        <h4 className="font-bold text-[15px] text-[var(--color-ink)]">{activeConversation.user.name}</h4>
                        <span className="text-[11px] text-[var(--color-gray-60)] bg-[var(--color-paper)] px-2 py-0.5 rounded capitalize font-mono tracking-widest">{activeConversation.user.role}</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {activeMessages.map((msg, idx) => {
                          const isMe = msg.sender_id === currentUser.id;
                          return (
                            <div key={msg.id} className={`flex max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-[14px] ${
                                isMe 
                                  ? 'bg-[var(--color-ink)] text-white rounded-br-sm' 
                                  : 'bg-[var(--color-paper)] border border-[var(--color-gray-15)] text-[var(--color-ink)] rounded-bl-sm'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
    
                      <div className="p-3 bg-[var(--color-white)] border-t border-[var(--color-gray-15)]">
                        <div className="flex items-center gap-2 bg-[var(--color-paper)] border border-[var(--color-gray-15)] rounded-full px-4 py-2">
                          <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Write a message..." 
                            className="flex-1 bg-transparent text-[14px] outline-none text-[var(--color-ink)]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendMessage();
                            }}
                          />
                          <button onClick={handleSendMessage} className="text-[var(--color-ink)] font-bold text-[14px] disabled:opacity-50 uppercase tracking-widest font-display text-[12px]" disabled={!inputText.trim()}>
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-gray-40)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-40">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <p className="text-[14px] font-medium font-display uppercase tracking-widest">Select a conversation</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Notifications View */
              <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-gray-40)]">
                    <p className="text-[14px] font-medium font-display uppercase tracking-widest">No notifications</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`flex items-start justify-between p-4 border-b border-[var(--color-gray-15)] ${!notification.read ? 'bg-[var(--color-paper)]' : 'bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notification.read ? 'bg-[var(--color-error)]' : 'bg-transparent'}`}></div>
                          <div className="flex flex-col">
                            <span className="text-[14px] text-[var(--color-ink)]">{notification.message}</span>
                            <span className="text-[10px] text-[var(--color-gray-40)] font-mono uppercase tracking-widest mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button onClick={() => markNotificationDone(notification.id)} className="text-[10px] font-bold font-display uppercase tracking-widest text-[var(--color-ink)] border border-[var(--color-ink)] px-2 py-1 rounded hover:bg-[var(--color-ink)] hover:text-white transition-colors">
                              Mark Done
                            </button>
                          )}
                          <button onClick={() => deleteNotification(notification.id)} className="text-[10px] font-bold font-display uppercase tracking-widest text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white border border-[var(--color-error)] px-2 py-1 rounded transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
          {(totalUnread > 0 || unreadNotifications > 0) && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-ink)]"></span>
          )}
        </button>
      )}
    </div>
  );
}
