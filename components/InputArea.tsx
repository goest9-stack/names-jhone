import React, { useRef, useState, KeyboardEvent } from 'react';
import { Attachment } from '../types';
import { fileToBase64 } from '../services/geminiService';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly type files as File[] to avoid 'unknown' type errors
      const files: File[] = Array.from(e.target.files);
      const newAttachments: Attachment[] = [];
      
      for (const file of files) {
        // Simple client-side limit check (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max 5MB.`);
          continue;
        }

        try {
          const base64 = await fileToBase64(file);
          newAttachments.push({
            name: file.name,
            mimeType: file.type,
            data: base64,
          });
        } catch (error) {
          console.error("Error reading file", error);
        }
      }
      
      setAttachments((prev) => [...prev, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark via-brand-dark to-transparent pt-10 pb-6 px-4 md:px-6 z-40">
      <div className="max-w-4xl mx-auto">
        
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group flex-shrink-0 w-16 h-16 rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">
                 {att.mimeType.startsWith('image/') ? (
                    <img src={att.data} alt="preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-[8px] text-center text-gray-400 p-1 break-all">
                      {att.name}
                    </div>
                 )}
                 <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/80 text-red-500 rounded-full w-4 h-4 flex items-center justify-center hover:bg-white hover:text-red-600 transition-colors"
                 >
                   &times;
                 </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl transition-all focus-within:ring-1 focus-within:ring-brand-red/50 focus-within:border-brand-red/50">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI Coporties anything..."
            rows={1}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm px-4 py-4 pr-32 focus:outline-none resize-none max-h-40 scrollbar-hide"
            disabled={isLoading}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-2">
             <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,text/*,application/pdf" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-brand-red transition-colors rounded-lg hover:bg-gray-800"
              title="Upload File"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLoading || (!inputText.trim() && attachments.length === 0)
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-brand-red text-white shadow-[0_0_10px_rgba(220,38,38,0.4)] hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                 <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-600">AI Coporties can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;