import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Mic, MicOff } from 'lucide-react';

export const Toast = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 bg-[#1e202e] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 border border-indigo-500/30">
    <Bell className="text-indigo-400" size={20} />
    <div>
      <h4 className="font-bold text-sm">Notification</h4>
      <p className="text-sm opacity-90">{message}</p>
    </div>
    <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white"><X size={16}/></button>
  </div>
);

export const InputWithVoice = ({ value, onChange, placeholder, className, onEnter }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        const latestResult = e.results[e.results.length - 1];
        if (latestResult.isFinal) {
          const transcript = latestResult[0].transcript.trim();
          const newValue = valueRef.current ? `${valueRef.current} ${transcript}` : transcript;
          onChange(newValue);
        }
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Browser not supported");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch (err) { setIsListening(false); }
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter && onEnter()}
        placeholder={placeholder}
        className={`w-full pr-10 pl-3 py-3 rounded-lg bg-[#0B0C15] border border-slate-700 text-slate-200 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${className}`}
      />
      <button
        onClick={toggleListening}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-800 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
    </div>
  );
};