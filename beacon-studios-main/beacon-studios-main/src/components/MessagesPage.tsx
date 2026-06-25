import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Info, Users, Phone, ArrowUpRight, Plus } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Conversation, Message, User } from '../types';
import CreateTeamModal from './CreateTeamModal';

interface MessagesPageProps {
  currentUser: User;
  onMessagesRead: () => void;
}

export default function MessagesPage({ currentUser, onMessagesRead }: MessagesPageProps) {
  const isBI = currentUser.portal === 'bi';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // User mapping for matching avatars & sender names
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Custom dialog state for team builder tool
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load conversations
  useEffect(() => {
    const initMessages = async () => {
      const convs = await dbService.getConversations();
      const usersList = await dbService.getUsers();
      setAllUsers(usersList);

      let allowedConvs = convs;
      
      // Load custom group memberships from localStorage 
      const membersList = localStorage.getItem('beacon_conversation_members')
        ? JSON.parse(localStorage.getItem('beacon_conversation_members')!)
        : [];
      const myCustomConvIds = membersList
        .filter((m: any) => m.user_id === currentUser.id)
        .map((m: any) => m.conversation_id);

      if (!isBI) {
        // filter down to their college conversations, global channels, OR custom team channels they are in
        allowedConvs = convs.filter(c => 
          c.college_id === currentUser.college_id || 
          myCustomConvIds.includes(c.id) ||
          c.type === 'global' ||
          c.type === 'team'
        );
      } else {
        // Admin or BI can see everything they have created / registered or belong to
        allowedConvs = convs;
      }

      setConversations(allowedConvs);
      
      if (allowedConvs.length > 0 && !selectedConv) {
        setSelectedConv(allowedConvs[0]);
      }
    };
    initMessages();
  }, [currentUser, refetchCounter]);

  // Load message list and subscribe to changes
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      const list = await dbService.getMessages(selectedConv.id);
      // Sort oldest to newest for visual chat stream
      const sorted = list.sort((a,b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
      setMessages(sorted);
      
      // Auto scroll to bottom
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);

      onMessagesRead(); // Clear unread counters
    };

    fetchMessages();

    // Subscribe to REALTIME messages emulation
    const unsubscribe = dbService.subscribeMessages(selectedConv.id, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicate additions
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedConv]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;

    const textToSend = inputText;
    setInputText(''); // clear fast for snappy feedback UI

    await dbService.sendMessage(selectedConv.id, currentUser.id, textToSend);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E2E5EC] rounded-[14px] bg-white text-left text-[#1B2240] h-[500px] overflow-hidden">
      
      {/* CONVERSATION INBOX SIDEBAR CHANNELS */}
      <div className="md:col-span-4 border-r border-[#E2E5EC] flex flex-col h-full bg-white">
        <div className="px-4 py-3 border-b border-[#E2E5EC] flex items-center justify-between">
          <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#2DC5A2]" />
            <span>Operational Chats</span>
          </span>
          <span className="text-[10px] font-bold bg-[#2DC5A2]/10 text-[#2DC5A2] px-2 py-0.5 rounded-full">
            {conversations.length} Active
          </span>
        </div>

        {/* Create Teams & Connect other colleges navigation */}
        <div className="p-2 border-b border-[#E2E5EC] bg-[#F4F5F7]/35">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2 bg-[#1B2240] hover:bg-[#2c365d] text-[#2DC5A2] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect & Create Teams</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {conversations.map(conv => {
            const isSelected = selectedConv?.id === conv.id;
            
            return (
              <div 
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' 
                    : 'hover:bg-[#F4F5F7] text-[#4A5270]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10.5px] outline-none shrink-0 ${
                  isSelected ? 'bg-[#2DC5A2] text-[#1B2240]' : 'bg-[#1B2240] text-[#2DC5A2]'
                }`}>
                  {conv.name.substring(0,2).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-bold text-[#1B2240] truncate">{conv.name}</div>
                  <div className="text-[10.5px] text-[#8891B0] mt-0.5 truncate uppercase tracking-widest tracking-wide font-semibold">
                    {conv.type} channel
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE CHAT DIALOG STREAM PAGE */}
      <div className="md:col-span-8 flex flex-col h-full bg-[#F4F5F7]">
        {selectedConv ? (
          <>
            {/* Conversations Header details */}
            <div className="px-4 py-3 bg-white border-b border-[#E2E5EC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B2240] text-[#2DC5A2] flex items-center justify-center font-bold font-['Bricolage_Grotesque'] text-[10.5px] shrink-0">
                  {selectedConv.name.substring(0,2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1B2240] leading-none">{selectedConv.name}</div>
                  <div className="text-[10px] text-[#8891B0] mt-1">Status: Active sync connected</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#4A5270]">
                <button className="p-1.5 hover:bg-[#F4F5F7] transition-all rounded-lg cursor-pointer border-none bg-transparent">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-[#F4F5F7] transition-all rounded-lg cursor-pointer border-none bg-transparent">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGE CONTAINER BUBBLE LIST */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="m-auto text-center text-xs text-[#8891B0] py-12">
                  No messages in this chat. Start typing below to begin.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === currentUser.id;
                  const sender = allUsers.find(u => u.id === msg.sender_id);
                  const isSystem = msg.sender_id === 'bi_system';

                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2.5 text-xs ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black font-['Bricolage_Grotesque'] text-[9.5px] shrink-0 mt-0.5">
                          {sender ? sender.initials : 'BI'}
                        </div>
                      )}

                      <div className={`rounded-xl px-3.5 py-2 max-w-[70%] sm:max-w-[60%] text-left shadow-xs ${
                        isMe 
                          ? 'bg-[#1B2240] text-white rounded-tr-none' 
                          : 'bg-white text-[#1B2240] rounded-tl-none border border-[#E2E5EC]'
                      }`}>
                        {!isMe && sender && (
                          <div className="text-[9.5px] font-bold text-[#2DC5A2] mb-1">
                            {sender.name} ({sender.role})
                          </div>
                        )}
                        <div className="leading-relaxed leading-normal select-text break-words whitespace-pre-wrap">{msg.text}</div>
                        <div className={`text-[9px] mt-1 text-right leading-none ${isMe ? 'text-white/40' : 'text-[#8891B0]'}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {/* SENDING CONTROL PANEL INPUT FIELD */}
            <form 
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-[#E2E5EC] flex gap-2"
            >
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type message to ${selectedConv.name}...`}
                className="flex-1 px-4 py-2 bg-[#F4F5F7] border border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                required
              />
              <button 
                type="submit"
                className="px-4 py-2 border-none bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="m-auto text-center text-[#8891B0]">
            <MessageSquare className="w-10 h-10 mx-auto text-[#CBD0DC] mb-3" />
            <div className="text-xs font-bold">Select a college conversation to begin</div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTeamModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newConv) => {
            setShowCreateModal(false);
            setRefetchCounter(prev => prev + 1);
            setSelectedConv(newConv);
          }}
        />
      )}
    </div>
  );
}
