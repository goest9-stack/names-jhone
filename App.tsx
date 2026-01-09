import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { Message, Attachment } from './types';
import { generateContentStream } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      text,
      attachments,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAiMessage]);

    try {
      await generateContentStream(text, attachments, (chunkedText) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === aiMessageId 
              ? { ...msg, text: chunkedText } 
              : msg
          )
        );
      });
      
      // Finalize streaming state
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: "I apologize, but I encountered an error processing your request. Please check your connection or try again.",
        timestamp: Date.now(),
        isStreaming: false
      };
       setMessages((prev) => 
        prev.map((msg) => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false, text: "Connection interrupted." } 
            : msg
        ).concat(errorMessage)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand-dark overflow-hidden font-sans text-white selection:bg-brand-red selection:text-white">
      <Header />
      
      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full pt-20 pb-40 px-4 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center opacity-0 animate-fade-in space-y-8">
               <div className="relative">
                 <div className="absolute -inset-4 bg-brand-red/20 blur-xl rounded-full"></div>
                 <div className="relative w-20 h-20 bg-gradient-to-br from-brand-red to-black rounded-2xl flex items-center justify-center border border-brand-border shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
               </div>
               
               <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-4">
                    AI Coporties
                  </h1>
                  <p className="text-gray-400 max-w-md mx-auto text-lg font-light">
                    The next evolution in professional AI assistance. <br/> 
                    Upload files, images, or simply start typing.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
                  {[
                    "Analyze this financial report PDF", 
                    "Generate a React component for a dashboard", 
                    "Write an elegant executive summary"
                  ].map((suggestion, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSendMessage(suggestion, [])}
                      className="p-4 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-red/50 hover:bg-gray-900 transition-all text-sm text-gray-300 hover:text-white text-left shadow-lg hover:shadow-brand-red/10"
                    >
                      "{suggestion}"
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;