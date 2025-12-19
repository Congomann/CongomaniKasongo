
import React from 'react';
import { ChatAttachment } from '../../types';
import { FileText, Play, Download, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
  attachment: ChatAttachment;
  isMe: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ attachment, isMe }) => {
  const isImage = attachment.type === 'image';
  const isAudio = attachment.type === 'audio';

  if (isImage) {
    return (
      <div className="group relative overflow-hidden rounded-lg mt-1 mb-1 border border-black/5 shadow-sm max-w-[200px]">
        <img src={attachment.url} alt="Attachment" className="w-full h-auto object-cover" />
        <a 
            href={attachment.url} 
            download 
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
        >
            <Download className="h-6 w-6" />
        </a>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className={`flex items-center gap-3 p-2 rounded-xl min-w-[200px] ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
        <div className={`p-2 rounded-full ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
            <Play className={`h-3 w-3 ${isMe ? 'text-white fill-current' : 'text-slate-800 fill-current'}`} />
        </div>
        <div className="flex-1 h-8 flex flex-col justify-center">
             <div className={`h-1 rounded-full w-full overflow-hidden ${isMe ? 'bg-white/30' : 'bg-slate-300'}`}>
                 <div className={`h-full w-1/3 ${isMe ? 'bg-white' : 'bg-blue-500'}`}></div>
             </div>
             <div className={`flex justify-between text-[9px] mt-1 font-medium ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                 <span>Voice Note</span>
                 <span>0:12</span>
             </div>
        </div>
        <audio src={attachment.url} className="hidden" />
      </div>
    );
  }

  // Generic File
  return (
    <a href={attachment.url} download className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:brightness-95 ${isMe ? 'bg-blue-600 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
            <FileText className={`h-5 w-5 ${isMe ? 'text-white' : 'text-blue-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-slate-700'}`}>{attachment.name}</p>
            <p className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>1.2 MB</p>
        </div>
        <Download className={`h-4 w-4 ${isMe ? 'text-white/70' : 'text-slate-400'}`} />
    </a>
  );
};
