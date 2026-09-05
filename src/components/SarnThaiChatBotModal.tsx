import React, { useState, useEffect, useRef } from 'react';
import { aiChatService, AIChatMessage } from '../services/aiChatService';
import { 
  Sparkles, 
  Send, 
  X, 
  Trash2, 
  Bot, 
  User, 
} from 'lucide-react';

interface SarnThaiChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPatternGuide?: () => void;
  onOpenSwipe?: () => void;
}

const QUICK_PROMPTS = [
  { label: '🌸 ผ้าใส่ไปงานแต่ง', prompt: 'ช่วยแนะนำผ้าไทยที่เหมาะสำหรับใส่ไปร่วมงานแต่งงานหน่อยครับ ต้องเลือกสีและลายแบบไหนดี?' },
  { label: '🌿 วิธีซักผ้าคราม', prompt: 'ผ้าครามธรรมชาติมีขั้นตอนการซักและดูแลรักษาอย่างไรไม่ให้สีตกและคงความเงางาม?' },
  { label: '👑 ความหมายลายพิกุล', prompt: 'ลายพิกุลแก้วและลายนาคในผ้าไทยมีความหมายมงคลและประวัติความเป็นมาอย่างไร?' },
  { label: '🧵 มัดหมี่ vs แพรวา', prompt: 'ผ้าไหมมัดหมี่ กับ ผ้าแพรวา ต่างกันอย่างไร ทั้งในแง่เทคนิคการทอและเอกลักษณ์?' },
  { label: '✨ แนะนำการปัดผ้า', prompt: 'ฟีเจอร์ "ปัดผ้า" ในระบบสานไทยใช้งานอย่างไร และช่วยเลือกผ้าได้อย่างไร?' },
];

/**
 * Format message text into clean, beautiful typography without raw markdown artifacts
 */
function renderFormattedMessage(rawText: string) {
  if (!rawText) return null;

  // Split into lines
  const lines = rawText.split('\n');

  return lines.map((line, idx) => {
    let cleanLine = line.trim();

    // Skip horizontal divider lines
    if (cleanLine === '---' || cleanLine === '***' || cleanLine === '___') {
      return <div key={idx} className="aichat-divider" />;
    }

    if (!cleanLine) {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    // Check for header level 1-3
    const isHeader = /^#{1,4}\s+/.test(cleanLine);
    if (isHeader) {
      cleanLine = cleanLine.replace(/^#{1,4}\s+/, '');
    }

    // Check for bullet list item
    const isBullet = /^[-*•]\s+/.test(cleanLine);
    if (isBullet) {
      cleanLine = cleanLine.replace(/^[-*•]\s+/, '');
    }

    // Helper to render bold text
    const parseBoldParts = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return <strong key={pIdx} className="aichat-strong">{inner}</strong>;
        }
        return part;
      });
    };

    if (isHeader) {
      return (
        <h5 key={idx} className="aichat-heading-line">
          {parseBoldParts(cleanLine)}
        </h5>
      );
    }

    if (isBullet) {
      return (
        <div key={idx} className="aichat-bullet-line">
          <span className="aichat-bullet-dot">•</span>
          <span className="aichat-bullet-text">{parseBoldParts(cleanLine)}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="aichat-paragraph-line">
        {parseBoldParts(cleanLine)}
      </p>
    );
  });
}

export const SarnThaiChatBotModal: React.FC<SarnThaiChatBotModalProps> = ({
  isOpen,
  onClose,
  onOpenPatternGuide: _onOpenPatternGuide,
  onOpenSwipe: _onOpenSwipe,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingDelta, setStreamingDelta] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    setMessages(aiChatService.getHistory());
  }, []);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingDelta, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isStreaming) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsStreaming(true);
    setStreamingDelta('');

    try {
      const abortFn = await aiChatService.streamCompletion(
        newHistory,
        (chunk) => {
          setStreamingDelta((prev) => prev + chunk);
        },
        (fullText) => {
          const assistantMessage: AIChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: fullText || 'ขออภัยครับ ไม่สามารถประมวลผลข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้งนะครับ',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          };
          const finalMessages = [...newHistory, assistantMessage];
          setMessages(finalMessages);
          aiChatService.saveHistory(finalMessages);
          setIsStreaming(false);
          setStreamingDelta('');
          abortStreamRef.current = null;
        },
        (error) => {
          console.error('Chat stream error:', error);
          const errorMessage: AIChatMessage = {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ OpenTyphoon AI กรุณาลองใหม่อีกครั้งนะครับ 🙇‍♂️',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          };
          const finalMessages = [...newHistory, errorMessage];
          setMessages(finalMessages);
          aiChatService.saveHistory(finalMessages);
          setIsStreaming(false);
          setStreamingDelta('');
          abortStreamRef.current = null;
        }
      );
      abortStreamRef.current = abortFn;
    } catch (e) {
      console.error('Failed to initiate stream:', e);
      setIsStreaming(false);
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm('คุณต้องการล้างประวัติการสนทนาทั้งหมดใช่หรือไม่?')) {
      if (abortStreamRef.current) {
        abortStreamRef.current();
      }
      aiChatService.clearHistory();
      setMessages(aiChatService.getHistory());
      setStreamingDelta('');
      setIsStreaming(false);
    }
  };

  // Stop current stream
  const handleStopStream = () => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="aichat-backdrop" onClick={onClose}>
      <div 
        className="aichat-window"
        onClick={(e) => e.stopPropagation()}
        id="sarnthai-chatbot-window"
      >
        {/* Chat Window Header */}
        <div className="aichat-header">
          <div className="aichat-header-profile">
            <div className="aichat-avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
                alt="SarnThai ChatBot" 
                className="aichat-avatar-img"
              />
              <span className="aichat-online-dot" />
            </div>

            <div className="aichat-header-text">
              <div className="aichat-name-row">
                <h4>SarnThai ChatBot</h4>
                <span className="aichat-badge-ai">
                  <Sparkles size={11} /> ผู้ช่วยผ้าไทย AI
                </span>
              </div>
              <span className="aichat-model-tag">
                OpenTyphoon 2.5 30B • SCB 10X
              </span>
            </div>
          </div>

          <div className="aichat-header-actions">
            <button
              className="aichat-hdr-btn"
              onClick={handleClearChat}
              title="ล้างประวัติการคุย"
              aria-label="ล้างประวัติการคุย"
            >
              <Trash2 size={16} />
            </button>
            <button
              className="aichat-hdr-btn"
              onClick={onClose}
              title="ปิดหน้าต่างแชท"
              aria-label="ปิดหน้าต่างแชท"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="aichat-quick-prompts-bar no-scrollbar">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              className="aichat-prompt-chip"
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isStreaming}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="aichat-messages-body no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`aichat-message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="aichat-msg-avatar assistant">
                  <Bot size={15} />
                </div>
              )}

              <div className="aichat-msg-content-block">
                <div className={`aichat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                  {renderFormattedMessage(msg.content)}
                </div>
                <span className="aichat-msg-time">{msg.timestamp}</span>
              </div>

              {msg.role === 'user' && (
                <div className="aichat-msg-avatar user">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {/* Real-time Streaming Message Bubble */}
          {isStreaming && (
            <div className="aichat-message-row assistant-row">
              <div className="aichat-msg-avatar assistant">
                <Bot size={15} />
              </div>
              <div className="aichat-msg-content-block">
                <div className="aichat-bubble bubble-assistant streaming">
                  {streamingDelta ? (
                    renderFormattedMessage(streamingDelta)
                  ) : (
                    <div className="aichat-typing-indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  )}
                  <span className="aichat-stream-cursor">▍</span>
                </div>
                <button
                  className="aichat-stop-btn"
                  onClick={handleStopStream}
                  title="หยุดพิมพ์"
                >
                  หยุดพิมพ์
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="aichat-input-bar">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="aichat-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              className="aichat-input-field"
              placeholder="ถามเรื่องลายผ้า ความหมาย การดูแลรักษา..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="aichat-send-btn"
              disabled={!inputText.trim() || isStreaming}
              aria-label="ส่งข้อความ"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* Floating Trigger Button for SarnThai ChatBot */
interface SarnThaiChatBotTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export const SarnThaiChatBotTrigger: React.FC<SarnThaiChatBotTriggerProps> = ({
  onClick,
  isOpen,
}) => {
  if (isOpen) return null;

  return (
    <div className="sarnthai-bot-trigger-wrapper" id="btn-open-sarnthai-ai">
      <button 
        className="sarnthai-bot-floating-btn"
        onClick={onClick}
        title="SarnThai ChatBot (OpenTyphoon AI)"
        aria-label="SarnThai ChatBot"
      >
        <div className="sarnthai-bot-icon-glow">
          <Sparkles size={20} className="sparkle-icon" />
        </div>
        <span className="sarnthai-bot-label">
          SarnThai ChatBot
        </span>
      </button>
    </div>
  );
};
