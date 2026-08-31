import React from 'react';
import { UserProfile } from '../types';
import { Search, X, Heart, ShoppingBag, User, LogOut, Store } from 'lucide-react';

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
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-container" onClick={onLogoClick}>
          <img src="/logo.svg" alt="สานไทย โลโก้" className="brand-logo-img" />
          <div className="brand-text-block">
            <h1>
              สานไทย
              <span style={{ fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 500 }}>
                ตลาดผ้าทอมือ
              </span>
            </h1>
            <span className="brand-tagline">ส่งตรงจากช่างทอชุมชนทั่วประเทศ</span>
          </div>
        </div>

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '3px 8px 3px 4px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.name}
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '11px', fontWeight: 600, maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                style={{ padding: '2px', color: 'var(--text-light)', marginLeft: '2px' }}
                aria-label="ออกจากระบบ"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--primary-kram-light)',
                color: 'var(--primary-kram)',
                border: '1px solid #C4D7EC',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: 600
              }}
              id="btn-header-login"
            >
              <User size={14} />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>

      <div className="search-wrapper">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาลายผ้า เช่น มัดหมี่, ครามสกล, พิกุลแก้ว..."
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
    </header>
  );
};
