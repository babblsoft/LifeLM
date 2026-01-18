import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendMessageToGemini, generateProactiveMessage } from '../services/gemini';
import { Send, Sparkles, Clock, MoreHorizontal, Trash2, Volume2, VolumeX, Plus, X, PenTool, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export const BasePulseChatPage = () => {
  const { chatHistory, userProfile, addChatMessage, addDiaryEntry, addMission, addToDo, addDocument, addLog, clearChat, speak } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Manual Entry State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryType, setEntryType] = useState<'FACT' | 'LIFE'>('FACT');
  const [entryContent, setEntryContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg = text;
    setInput('');
    addChatMessage({ role: 'user', text: userMsg, timestamp: new Date().toISOString() });
    setIsTyping(true);

    const userContext = `User: ${userProfile.name}, Career: ${userProfile.career}. Today is ${new Date().toDateString()}.`;

    try {
      const response = await sendMessageToGemini(chatHistory, userMsg, userContext);
      
      setIsTyping(false);

      if (response.toolCall) {
          const { name, args } = response.toolCall;
          let confirmationText = '';
          
          if (name === 'addDiaryEntry') {
              addDiaryEntry({ date: args.date as string, type: args.type as 'FACT'|'LIFE', content: args.content as string });
              confirmationText = `I've logged that in your ${args.type} stream for ${args.date}.`;
          } else if (name === 'createMission') {
              addMission({ title: args.title as string, category: args.category as 'EVERYDAY'|'FINITE', description: args.description as string, deadline: args.deadline as string });
              confirmationText = `Mission "${args.title}" added to your queue.`;
          } else if (name === 'addToToDo') {
              addToDo(args.task as string);
              confirmationText = `Added "${args.task}" to your To-Do list.`;
          } else if (name === 'createDocument') {
              addDocument({ title: args.title as string, type: 'OTHER', content: args.content as string });
              confirmationText = `I've created the document "${args.title}" in NoteBM.`;
          }

          addChatMessage({ role: 'model', text: confirmationText, timestamp: new Date().toISOString() });
          addLog(`BasePulse Action: ${name}`);
          
          if (soundEnabled) speak(confirmationText);

      } else if (response.text) {
          addChatMessage({ role: 'model', text: response.text, timestamp: new Date().toISOString() });
          if (soundEnabled && response.text) speak(response.text);
      }

    } catch (error) {
      setIsTyping(false);
      const errorMsg = "I seem to be having trouble processing that request right now.";
      addChatMessage({ role: 'model', text: errorMsg, timestamp: new Date().toISOString() });
      if (soundEnabled) speak(errorMsg);
    }
  };

  const handleProactiveTrigger = async () => {
      setIsTyping(true);
      const userContext = `User: ${userProfile.name}, Career: ${userProfile.career}.`;
      const proactiveMsg = await generateProactiveMessage(userContext);
      setIsTyping(false);
      
      const msg = proactiveMsg || "Hello! How can I help you organize your day?";
      addChatMessage({ role: 'model', text: msg, timestamp: new Date().toISOString() });
      if (soundEnabled) speak(msg);
  };
  
  const handleManualEntrySubmit = () => {
      if (!entryContent.trim()) return;
      
      // Execute the action (simulating the tool)
      addDiaryEntry({ 
          date: entryDate, 
          type: entryType, 
          content: entryContent 
      });

      // Add visual feedback in chat
      const confirmationText = `I've manually logged that entry in your ${entryType === 'FACT' ? 'Fact' : 'Life'} stream for ${entryDate}.`;
      addChatMessage({ role: 'model', text: confirmationText, timestamp: new Date().toISOString() });
      addLog(`Manual Entry: ${entryType}`);
      
      if (soundEnabled) speak(confirmationText);
      
      // Reset and close
      setEntryContent('');
      setEntryType('FACT');
      setShowEntryModal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-cream pt-10 pb-20 relative">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-cream/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <div>
                <h2 className="font-serif font-bold text-lg text-charcoal">BasePulse AI</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Always Listening</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-terra bg-terra/10' : 'text-gray-300'}`}
            >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-charcoal transition-colors">
                    <MoreHorizontal size={24} />
                </button>
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1 animate-in fade-in slide-in-from-top-2">
                        <button 
                            onClick={() => { clearChat(); setShowMenu(false); }}
                            className="flex items-center space-x-2 w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold"
                        >
                            <Trash2 size={16} />
                            <span>Clear Chat History</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {msg.role === 'model' && (
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-bold text-terra uppercase">BasePulse</span>
                        <span className="text-[10px] text-gray-300">{format(new Date(msg.timestamp), 'h:mm a')}</span>
                    </div>
                )}
                <div 
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-charcoal text-white rounded-tr-sm' 
                        : 'bg-white text-charcoal border border-gray-100 rounded-tl-sm'
                    }`}
                >
                    {msg.text}
                </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold text-terra uppercase">BasePulse</span>
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-terra rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-terra rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-terra rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-[72px]">
        <div className="relative flex items-end bg-softGray rounded-2xl p-2">
            <button 
                onClick={() => setShowEntryModal(true)}
                className="p-2 text-gray-400 hover:text-terra transition-colors"
                title="Add Entry"
            >
                <Plus size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 mb-2"></div>
            <button 
                onClick={handleProactiveTrigger}
                className="p-2 text-gray-400 hover:text-terra transition-colors"
                title="Ask BasePulse something"
            >
                <Sparkles size={20} />
            </button>
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message BasePulse..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-sm text-charcoal placeholder-gray-400"
                rows={1}
                style={{ minHeight: '40px' }}
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`p-2 rounded-xl transition-all ${
                    input.trim() ? 'bg-terra text-white shadow-md' : 'bg-gray-200 text-gray-400'
                }`}
            >
                <Send size={20} />
            </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-2xl text-charcoal">Log Stream</h3>
                    <button onClick={() => setShowEntryModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                        <input 
                            type="date" 
                            value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                            className="w-full bg-softGray rounded-xl p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-terra/20"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stream Type</label>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setEntryType('FACT')}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${entryType === 'FACT' ? 'bg-charcoal text-white' : 'bg-softGray text-gray-400'}`}
                            >
                                <PenTool size={14} />
                                <span>Fact</span>
                            </button>
                            <button 
                                onClick={() => setEntryType('LIFE')}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${entryType === 'LIFE' ? 'bg-charcoal text-white' : 'bg-softGray text-gray-400'}`}
                            >
                                <BookOpen size={14} />
                                <span>Life</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content</label>
                        <textarea
                            value={entryContent}
                            onChange={(e) => setEntryContent(e.target.value)}
                            placeholder="What happened? / How did you feel?"
                            className="w-full bg-softGray rounded-xl p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-terra/20 min-h-[120px]"
                        />
                    </div>
                    <button 
                        onClick={handleManualEntrySubmit}
                        className="w-full bg-terra text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex justify-center items-center space-x-2 mt-2"
                    >
                        <span>Save to Stream</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};