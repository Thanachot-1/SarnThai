import React, { useState, useEffect } from 'react';
import { ChatConversation, ChatMessage, UserProfile, Product } from '../types';
import { chatService } from '../services/chatService';
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Store, 
  User, 
  CheckCircle2, 
  Phone, 
  LogIn, 
  PackageOpen, 
  Clock 
} from 'lucide-react';

interface ChatInboxProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  selectedConversationId?: string | null;
  onCloseChatRoom?: () => void;
}

export const ChatInbox: React.FC<ChatInboxProps> = ({
  currentUser,
  onOpenAuth,
  selectedConversationId,
  onCloseChatRoom,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch all conversations for current user
  const loadConversations = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await chatService.fetchConversations(currentUser.id);
      setConversations(list);

      // If a specific conversation ID was requested (e.g. from Product Detail)
      if (selectedConversationId) {
        const found = list.find((c) => c.id === selectedConversationId);
        if (found) setActiveConversation(found);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, selectedConversationId]);

  // 2. Load messages and subscribe to realtime when entering a conversation
  useEffect(() => {
    if (activeConversation) {
      chatService.fetchMessages(activeConversation.id).then((msgs) => {
        setMessages(msgs);
      });

      const unsubscribe = chatService.subscribeToMessages(
        activeConversation.id,
        (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [activeConversation]);

  // If user is not logged in:
  if (!currentUser) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-kram-light)',
            color: 'var(--primary-kram)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <MessageSquare size={32} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-kram)', marginBottom: '8px' }}>
          กล่องข้อความ & การสนทนา
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
          กรุณาเข้าสู่ระบบเพื่อดูข้อความที่ช่างทอหรือผู้ซื้อติดต่อมาหาคุณ และแชทคุยสอบถามรายละเอียดผืนผ้า
        </p>

        <button
          onClick={onOpenAuth}
          className="btn-primary"
          style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '14px', gap: '6px', margin: '0 auto' }}
          id="btn-chat-login"
        >
          <LogIn size={16} />
          <span>เข้าสู่ระบบเพื่อดูแชท</span>
        </button>
      </div>
    );
  }

  // 3. Send real message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const receiverId =
      currentUser.id === activeConversation.buyerId
        ? activeConversation.sellerId
        : activeConversation.buyerId;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: activeConversation.id,
      productId: activeConversation.productId,
      senderId: currentUser.id,
      senderName: currentUser.shopName || currentUser.name,
      receiverId,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setInputText('');
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation state preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: newMsg.text, lastMessageAt: newMsg.createdAt }
          : c
      )
    );

    await chatService.sendMessage(newMsg);
  };

  // ==========================================
  // VIEW B: ACTIVE CHAT ROOM (ห้องสนทนา)
  // ==========================================
  if (activeConversation) {
    const isCurrentUserBuyer = currentUser.id === activeConversation.buyerId;
    const partnerName = isCurrentUserBuyer
      ? activeConversation.sellerShopName || activeConversation.sellerName
      : activeConversation.buyerName;
    const partnerAvatar = isCurrentUserBuyer
      ? activeConversation.sellerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', background: 'var(--bg-main)' }}>
        {/* Chat Room Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: '0',
            zIndex: 10
          }}
        >
          <button
            onClick={() => {
              setActiveConversation(null);
              if (onCloseChatRoom) onCloseChatRoom();
            }}
            style={{ padding: '6px', color: 'var(--text-main)' }}
            aria-label="ย้อนกลับไปรายการแชท"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src={partnerAvatar}
            alt={partnerName}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />

          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {partnerName}
              <CheckCircle2 size={13} color="#06C755" fill="#06C755" stroke="white" />
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--accent-sage)', fontWeight: 500 }}>
              {isCurrentUserBuyer ? 'ช่างทอประจำร้าน' : 'ผู้สนใจผืนผ้า'} • สนทนาแบบเรียลไทม์
            </span>
          </div>
        </div>

        {/* Pinned Product Card in Chat */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--divider)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <img
            src={activeConversation.productImage}
            alt={activeConversation.productTitle}
            style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
              {activeConversation.productPattern}
            </div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {activeConversation.productTitle}
            </div>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-kram)' }}>
            ฿{activeConversation.productPrice.toLocaleString()}
          </div>
        </div>

        {/* Message Feed */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isMe ? 'var(--primary-kram)' : 'var(--bg-surface)',
                      color: isMe ? '#FFFFFF' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-color)',
                      borderRadius: '14px',
                      borderBottomRightRadius: isMe ? '2px' : '14px',
                      borderBottomLeftRadius: isMe ? '14px' : '2px',
                      padding: '9px 13px',
                      fontSize: '13.5px',
                      lineHeight: '1.45',
                      boxShadow: 'var(--shadow-xs)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '3px' }}>
                    {msg.timestamp ||
                      new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px' }}>ยังไม่มีข้อความในการสนทนานี้</p>
              <p style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '4px' }}>
                พิมพ์ข้อความด้านล่างเพื่อเริ่มต้นการพูดคุยกับ {partnerName}
              </p>
            </div>
          )}
        </div>

        {/* Message Input Row */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`พิมพ์ข้อความถึง ${partnerName}...`}
            style={{
              flexGrow: 1,
              borderRadius: 'var(--radius-full)',
              padding: '10px 16px',
              fontSize: '13.5px'
            }}
          />
          <button
            type="submit"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-kram)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="ส่งข้อความ"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW A: INBOX LIST (รายการแชททั้งหมด)
  // ==========================================
  return (
    <div style={{ padding: '16px 14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={20} color="var(--primary-kram)" />
          <span>กล่องข้อความ ({conversations.length})</span>
        </h3>
      </div>

      {conversations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conversations.map((conv) => {
            const isCurrentUserBuyer = currentUser.id === conv.buyerId;
            const partnerName = isCurrentUserBuyer
              ? conv.sellerShopName || conv.sellerName
              : conv.buyerName;
            const partnerAvatar = isCurrentUserBuyer
              ? conv.sellerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <img
                    src={conv.productImage}
                    alt={conv.productTitle}
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '2px solid white',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {partnerName}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} />
                      {new Date(conv.lastMessageAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--accent-terracotta)', fontWeight: 500, marginBottom: '2px' }}>
                    เรื่อง: {conv.productPattern} (฿{conv.productPrice.toLocaleString()})
                  </div>

                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {conv.lastMessage || 'แตะเพื่อเปิดการสนทนา'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="empty-state"
          style={{
            padding: '36px 16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center'
          }}
        >
          <PackageOpen size={42} className="empty-icon" style={{ margin: '0 auto 10px', color: 'var(--text-light)' }} />
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
            ยังไม่มีข้อความการสนทนา
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto 16px' }}>
            เมื่อมีผู้ซื้อทักมาสอบถามผืนผ้า หรือคุณกดแชทคุยกับช่างทอ รายการห้องแชทจะปรากฏที่นี่ครับ
          </p>
        </div>
      )}
    </div>
  );
};
