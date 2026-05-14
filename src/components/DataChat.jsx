import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Key, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../api';

const DataChat = ({ sessionId }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Data Analyst. I have reviewed your dataset structure. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('gemini_api_key'));
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setShowKeyInput(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !apiKey.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/chat`, {
        session_id: sessionId,
        message: userMsg,
        api_key: apiKey.trim()
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'An error occurred';
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${errorMsg}` }]);
      if (err.response?.status === 400 && errorMsg.toLowerCase().includes('api key')) {
        setShowKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simple formatter for the AI markdown response (bold and newlines)
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line) return <br key={i} />;
      
      // Handle basic bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: '0 0 8px 0', lineHeight: 1.5 }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (showKeyInput) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: 500, margin: '2rem auto' }}>
        <div style={{ background: 'rgba(59,130,246,0.1)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Key size={32} color="var(--primary)" />
        </div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>Google Gemini API Key Required</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          To chat with your data, you need a free Google Gemini API key. 
          Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Google AI Studio</a>.
        </p>
        <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="Enter your Gemini API Key (AIzaSy...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-h)',
              width: '100%',
              fontFamily: 'var(--mono)'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            Save Key & Start Chatting
          </button>
        </form>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }}/>
          Your key is stored locally in your browser and sent securely to the backend.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--gradient-primary)', padding: '0.5rem', borderRadius: '8px' }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Data Analyst</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● Online (Gemini 1.5)</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowKeyInput(true)} title="Update API Key" style={{ padding: '0.5rem' }}>
          <Key size={16} />
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? 'var(--primary-dark)' : 'var(--bg-elevated)',
              color: msg.role === 'user' ? '#fff' : 'var(--primary)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
            }}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            
            <div style={{
              maxWidth: '80%',
              padding: '1rem',
              borderRadius: '12px',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-h)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              boxShadow: 'var(--shadow)'
            }}>
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)'
            }}>
              <Bot size={18} color="var(--primary)" />
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Loader2 size={18} className="spin" color="var(--primary)" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your data... (e.g. What is the average value?)"
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-h)',
              outline: 'none',
              fontSize: '0.95rem'
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ borderRadius: '24px', padding: '0 1.5rem', height: '46px' }}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataChat;
