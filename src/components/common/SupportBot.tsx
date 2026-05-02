import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Sparkles, Briefcase, Target, Mic, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { id: 'import', text: 'How do I import a job?', icon: Briefcase },
  { id: 'score', text: 'What is an ATS Match Score?', icon: Target },
  { id: 'prep', text: 'How do I prepare for an interview?', icon: Mic },
];

const BOT_RESPONSES: Record<string, string> = {
  import: "To import a job, go to the **Job Pipeline** page and paste any LinkedIn or Indeed URL into the **'Universal Job Importer'** box at the top. I'll automatically scrape the details for you!",
  score: "The **ATS Match Score** compares your resume PDF against a job description. We look for matching skills (Green) and missing gaps (Orange) to give you a compatibility % from 0 to 100.",
  prep: "In the **Job Detail** page, use the **'Interview Prep Mode'** widget. I'll generate a custom strategy including your 'Elevator Pitch' and tips for handling your specific skill gaps.",
  start: "Welcome to Udyog Marg! 🚀 Start by uploading your resume in the **Resumes** tab, then use the **Importer** in the **Job Pipeline** to add your first job. The magic happens when you **Link** them!",
  default: "I'm still learning, but I can help you with: \n• Importing Jobs \n• ATS Match Scoring \n• Interview Preparation \n• Navigating the Pipeline"
};

export const SupportBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Namaste! I'm your Udyog Guide. How can I help you accelerate your career today?", sender: 'bot', timestamp: new Date() }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotResponse = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = { 
        id: Date.now().toString(), 
        text, 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simple keyword logic
    const lowerText = text.toLowerCase();
    if (lowerText.includes('import') || lowerText.includes('linkedin') || lowerText.includes('indeed')) {
      addBotResponse(BOT_RESPONSES.import);
    } else if (lowerText.includes('score') || lowerText.includes('ats') || lowerText.includes('match')) {
      addBotResponse(BOT_RESPONSES.score);
    } else if (lowerText.includes('prep') || lowerText.includes('interview') || lowerText.includes('coach')) {
      addBotResponse(BOT_RESPONSES.prep);
    } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
      addBotResponse(BOT_RESPONSES.start);
    } else {
      addBotResponse(BOT_RESPONSES.default);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#FC6100] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Udyog Guide</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-tight">Career Intelligence Bot</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                  msg.sender === 'user' 
                    ? 'bg-[#FC6100] text-white rounded-tr-none' 
                    : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#FC6100] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#FC6100] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#FC6100] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Footer */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSend(q.text)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold hover:bg-[#FC6100]/10 hover:border-[#FC6100]/30 hover:text-[#FC6100] transition-all whitespace-nowrap"
                >
                  <q.icon className="w-3 h-3" />
                  {q.text}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="mt-3 flex gap-2"
            >
              <input 
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-[#FC6100] transition-all font-bold"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-12 h-12 bg-[#FC6100] text-white rounded-xl flex items-center justify-center hover:bg-[#E35205] transition-all disabled:opacity-50 shadow-lg shadow-[#FC6100]/10"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-black' : 'bg-[#FC6100] text-white pulse-orange'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .pulse-orange {
          box-shadow: 0 0 0 0 rgba(252, 97, 0, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(252, 97, 0, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(252, 97, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(252, 97, 0, 0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};
