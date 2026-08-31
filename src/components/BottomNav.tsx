import React from 'react';
import { Sparkles, BookOpen, Plus, MessageCircle, Store } from 'lucide-react';

export type NavTab = 'explore' | 'wisdom' | 'create' | 'chat' | 'seller';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadChatCount = 1,
}) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => onTabChange('explore')}
        id="nav-explore"
      >
        <Sparkles size={22} />
        <span>สำรวจตลาด</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'wisdom' ? 'active' : ''}`}
        onClick={() => onTabChange('wisdom')}
        id="nav-wisdom"
      >
        <BookOpen size={22} />
        <span>คู่มือลายผ้า</span>
      </button>

      {/* Floating Center Button for Sellers */}
      <div className="nav-item-center">
        <button 
          className="nav-fab-btn"
          onClick={() => onTabChange('create')}
          title="โพสต์ขายผ้า"
          id="nav-create-post"
          aria-label="โพสต์ขายผ้า"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
        <div className="nav-fab-label text-center">โพสต์ขาย</div>
      </div>

      <button 
        className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => onTabChange('chat')}
        id="nav-chat"
        style={{ position: 'relative' }}
      >
        <MessageCircle size={22} />
        <span>ข้อความ</span>
        {unreadChatCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '2px',
              right: '12px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--accent-terracotta)',
              borderRadius: '50%'
            }}
          />
        )}
      </button>

      <button 
        className={`nav-item ${activeTab === 'seller' ? 'active' : ''}`}
        onClick={() => onTabChange('seller')}
        id="nav-seller"
      >
        <Store size={22} />
        <span>ร้านของฉัน</span>
      </button>
    </nav>
  );
};
