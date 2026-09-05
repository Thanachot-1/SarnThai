import React from 'react';
import { UserProfile } from '../types';
import { NavTab } from './BottomNav';
import { Search, X, Heart, ShoppingBag, User, LogOut, Store, Sparkles, BookOpen, PlusCircle, MessageCircle, Flame } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  likedCount: number;
  onOpenLiked: () => void;
  onLogoClick: () => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  unreadChatCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  likedCount,
  onOpenLiked,
  onLogoClick,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab = 'explore',
  onTabChange,
  unreadChatCount = 0,
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-top">
          <div className="brand-container" onClick={onLogoClick}>
            <img src="/logo.svg" alt="สานไทย โลโก้" className="brand-logo-img" />
            <div className="brand-text-block">
              <h1>
                สานไทย
                <span className="brand-badge-sub">
                  ตลาดผ้าทอมือ
                </span>
              </h1>
              <span className="brand-tagline">ส่งตรงจากช่างทอชุมชนทั่วประเทศ</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {onTabChange && (
            <nav className="desktop-nav-links">
              <button
                className={`desktop-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => onTabChange('explore')}
              >
                <Sparkles size={16} />
                <span>สำรวจตลาด</span>
              </button>

              <button
                className={`desktop-nav-item ${activeTab === 'swipe' ? 'active' : ''}`}
                onClick={() => onTabChange('swipe')}
                id="header-nav-swipe"
              >
                <Flame size={16} />
                <span>ปัดผ้า</span>
              </button>

              <button
                className={`desktop-nav-item ${activeTab === 'wisdom' ? 'active' : ''}`}
                onClick={() => onTabChange('wisdom')}
              >
                <BookOpen size={16} />
                <span>คู่มือลายผ้า</span>
              </button>

              <button
                className={`desktop-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => onTabChange('chat')}
                style={{ position: 'relative' }}
              >
                <MessageCircle size={16} />
                <span>ข้อความ</span>
                {unreadChatCount > 0 && (
                  <span className="desktop-nav-dot" />
                )}
              </button>

              <button
                className={`desktop-nav-item ${activeTab === 'seller' ? 'active' : ''}`}
                onClick={() => onTabChange('seller')}
              >
                <Store size={16} />
                <span>ร้านของฉัน</span>
              </button>

              <button
                className="desktop-nav-cta"
                onClick={() => onTabChange('create')}
              >
                <PlusCircle size={16} />
                <span>ลงขายผ้า</span>
              </button>
            </nav>
          )}

          {/* Desktop & Mobile Header Actions */}
          <div className="header-actions">
            {/* Liked Items */}
            <button 
              className="header-icon-btn" 
              title="ผ้าที่ถูกใจ" 
              onClick={onOpenLiked}
              aria-label="ผ้าที่ถูกใจ"
            >
              <Heart size={18} color={likedCount > 0 ? '#E63946' : 'var(--text-muted)'} fill={likedCount > 0 ? '#E63946' : 'none'} />
              {likedCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#E63946',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}
                >
                  {likedCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button 
              className="header-icon-btn" 
              title="ตะกร้าสินค้า" 
              onClick={onOpenCart}
              id="btn-header-cart"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag size={18} color="var(--primary-kram)" />
              {cartCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: 'var(--accent-terracotta)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    animation: 'pulseGlow 2s infinite'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth: User Profile / Login Button */}
            {currentUser ? (
              <div className="header-user-profile">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="header-user-avatar"
                />
                <span className="header-user-name">
                  {currentUser.name.split(' ')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="header-logout-btn"
                  aria-label="ออกจากระบบ"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="header-login-btn"
                id="btn-header-login"
              >
                <User size={14} />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาลายผ้า เช่น มัดหมี่, ครามสกล, พิกุลแก้ว, แพรวา..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
              aria-label="ล้างคำค้นหา"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

