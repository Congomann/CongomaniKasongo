
import React, { useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { ChatAttachment } from '../../types';
import { Info } from 'lucide-react';

interface ChatWindowProps {
  activeId: string;
  type: 'user' | 'lead' | 'group';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ activeId, type }) => {
  const { colleagues, leads, chatMessages, sendChatMessage } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resolve Target
  let targetName = 'Unknown';
  let targetAvatar = undefined;
  let targetSub = '';

  if (type === 'user') {
      const user = colleagues.find(c => c.id === activeId);
      targetName = user?.name || 'Unknown';
      targetAvatar = user?.avatar;
      targetSub = user?.status === 'online' ? 'Active Now' : 'Offline';
  } else if (type === 'lead') {
      const lead = leads.find(l => l.id === activeId);
      targetName = lead?.name || 'Lead';
      targetSub = `${lead?.interest} Opportunity`;
  } else {
      targetName = activeId === 'g-1' ? 'Sales Team' : 'Underwriting';
      targetSub = '3 Members';
  }

  // Filter messages logic
  const messages = chatMessages
    .filter(m => 
        (m.senderId === 'me' && m.receiverId === activeId) || 
        (m.senderId === activeId && m.receiverId === 'me') ||
        (type === 'group' && m.receiverId === activeId) // Simplified group logic
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string, attachment?: ChatAttachment) => {
      sendChatMessage(activeId, text, attachment);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/40 backdrop-blur-2xl relative overflow-hidden">
        {/* Glass Header */}
        <div className="h-16 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-white/20 z-10 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="relative">
                    {targetAvatar ? (
                        <img src={targetAvatar} className="w-9 h-9 rounded-full object-cover border border-white shadow-sm" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {targetName[0]}
                        </div>
                    )}
                    {type === 'user' && targetSub === 'Active Now' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{targetName}</h3>
                    <p className="text-[10px] font-medium text-slate-500">{targetSub}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Info className="h-4 w-4" />
                </button>
            </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
            <div className="flex justify-center py-4">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
            </div>
            {messages.map((msg, i) => {
                const isMe = msg.senderId === 'me';
                const showAvatar = !isMe && (messages[i+1]?.senderId !== msg.senderId);
                const sender = type === 'group' && !isMe ? colleagues.find(c => c.id === msg.senderId) : null;

                return (
                    <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        isMe={isMe} 
                        showAvatar={showAvatar}
                        avatarUrl={sender?.avatar || targetAvatar}
                    />
                );
            })}
            <div ref={scrollRef} />
        </div>

        {/* Composer */}
        <ChatInput onSendMessage={handleSend} />
    </div>
  );
};
