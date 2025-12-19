
import React from 'react';
import { ChatMessage } from '../../types';
import { Check, CheckCheck } from 'lucide-react';
import { FilePreview } from './FilePreview';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showAvatar, avatarUrl }) => {
  return (
    <div className={`flex w-full mb-1 group ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <div className="w-8 flex-shrink-0 mr-2 flex items-end">
          {showAvatar ? (
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200 border border-white/20" />
          ) : <div className="w-8" />}
        </div>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div 
          className={`
            relative px-4 py-2.5 text-sm shadow-sm backdrop-blur-md transition-all
            ${isMe 
              ? 'bg-blue-500 text-white rounded-2xl rounded-tr-md' 
              : 'bg-white/60 text-slate-800 border border-white/40 rounded-2xl rounded-tl-md hover:bg-white/80'
            }
          `}
        >
          {message.attachment && (
            <div className="mb-2">
              <FilePreview attachment={message.attachment} isMe={isMe} />
            </div>
          )}
          
          {message.text && <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>}
          
          {/* Timestamp & Status (Hidden by default, shown on hover or if recent) */}
          <div className={`
            absolute -bottom-5 flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity
            ${isMe ? 'right-1 text-slate-400' : 'left-1 text-slate-400'}
          `}>
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
            </span>
            {isMe && (
              <span className={message.read ? 'text-blue-500' : 'text-slate-300'}>
                {message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
