
import React, { useRef, useState } from 'react';
import { Paperclip, Mic, Send, Image as ImageIcon, File } from 'lucide-react';
import { ChatAttachment } from '../../types';
import { AudioRecorder } from './AudioRecorder';

interface ChatInputProps {
  onSendMessage: (text: string, attachment?: ChatAttachment) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAudioSend = (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
        const base64 = reader.result as string;
        onSendMessage('', { type: 'audio', url: base64, name: 'audio.webm' });
        setIsRecording(false);
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        onSendMessage('', { type, url: result, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  if (isRecording) {
      return (
          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-white/20">
              <AudioRecorder onSend={handleAudioSend} onCancel={() => setIsRecording(false)} />
          </div>
      )
  }

  return (
    <div 
        className="p-4 bg-white/80 backdrop-blur-xl border-t border-white/20 relative"
        onDragEnter={handleDrag}
    >
      {dragActive && (
          <div 
            className="absolute inset-0 z-50 bg-blue-50/90 backdrop-blur-sm border-2 border-dashed border-blue-400 rounded-none flex items-center justify-center"
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onDragOver={handleDrag}
          >
              <p className="text-blue-600 font-bold text-lg animate-bounce">Drop file to send</p>
          </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex items-end gap-2 bg-slate-100/50 p-2 rounded-[1.5rem] border border-transparent focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-md transition-all duration-300"
      >
        <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
        >
            <Paperclip className="h-5 w-5 transform -rotate-45" />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

        <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="iMessage..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm text-slate-800 placeholder:text-slate-400 max-h-32 scrollbar-hide"
            style={{ minHeight: '44px' }}
        />

        {text.trim() ? (
            <button type="submit" className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md transition-all active:scale-95">
                <Send className="h-4 w-4 ml-0.5" />
            </button>
        ) : (
            <button 
                type="button" 
                onClick={() => setIsRecording(true)}
                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            >
                <Mic className="h-5 w-5" />
            </button>
        )}
      </form>
    </div>
  );
};
