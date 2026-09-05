import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Product, Region, Category, UserProfile } from '../types';
import { 
  Heart, 
  X, 
  RotateCcw, 
  Sparkles, 
  ShoppingBag, 
  MapPin, 
  Info, 
  Layers, 
  Flame,
  Filter,
  RefreshCw
} from 'lucide-react';

interface FabricSwiperProps {
  products: Product[];
  likedIds: string[];
  onToggleLike: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onExploreAll: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

interface SwipeHistoryItem {
  product: Product;
  action: 'like' | 'pass';
  wasLikedBefore: boolean;
}

const REGIONS: Region[] = ['ทั้งหมด', 'อีสาน', 'เหนือ', 'ใต้', 'กลาง'];
const CATEGORIES: Category[] = [
  'ทั้งหมด',
  'ผ้าไหมมัดหมี่',
  'ผ้าคราม',
  'ผ้ายกดอก',
  'ผ้าตีนจก',
  'ผ้าแพรวา',
  'ผ้าบาติก',
  'ผ้าฝ้ายทอมือ'
];

export const FabricSwiper: React.FC<FabricSwiperProps> = ({
  products,
  likedIds,
  onToggleLike,
  onSelectProduct,
  onAddToCart: _onAddToCart,
  onBuyNow,
  onExploreAll,
  currentUser: _currentUser,
  onOpenAuth: _onOpenAuth,
}) => {
  // Filters for swiper deck
  const [selectedRegion, setSelectedRegion] = useState<Region>('ทั้งหมด');
  const [selectedCategory, setSelectedCategory] = useState<Category>('ทั้งหมด');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Deck filter computation
  const deckProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedRegion !== 'ทั้งหมด' && p.region !== selectedRegion) return false;
      if (selectedCategory !== 'ทั้งหมด' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [products, selectedRegion, selectedCategory]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [history, setHistory] = useState<SwipeHistoryItem[]>([]);
  const [animatingOut, setAnimatingOut] = useState<'left' | 'right' | null>(null);

  // Drag state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setHistory([]);
    setDragOffset({ x: 0, y: 0 });
    setAnimatingOut(null);
  }, [selectedRegion, selectedCategory]);

  const currentProduct = deckProducts[currentIndex];
  const nextProduct = deckProducts[currentIndex + 1];
  const thirdProduct = deckProducts[currentIndex + 2];

  // Perform Swipe Action
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentProduct || animatingOut) return;

    const isLike = direction === 'right';
    const wasLiked = likedIds.includes(currentProduct.id);

    setAnimatingOut(direction);

    // Save to history for undo
    setHistory((prev) => [
      ...prev,
      {
        product: currentProduct,
        action: isLike ? 'like' : 'pass',
        wasLikedBefore: wasLiked,
      },
    ]);

    // Handle like trigger
    if (isLike && !wasLiked) {
      onToggleLike(currentProduct.id);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setAnimatingOut(null);
    }, 280);
  }, [currentProduct, animatingOut, likedIds, onToggleLike]);

  // Undo Last Swipe
  const handleUndo = useCallback(() => {
    if (history.length === 0 || currentIndex === 0) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));

    // If it was a like and wasn't liked before, toggle it back
    if (lastAction.action === 'like' && !lastAction.wasLikedBefore && likedIds.includes(lastAction.product.id)) {
      onToggleLike(lastAction.product.id);
    }

    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setDragOffset({ x: 0, y: 0 });
    setAnimatingOut(null);
  }, [history, currentIndex, likedIds, onToggleLike]);

  // Reset Deck
  const handleResetDeck = () => {
    setCurrentIndex(0);
    setHistory([]);
    setDragOffset({ x: 0, y: 0 });
    setAnimatingOut(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or modal
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        if (currentProduct) onSelectProduct(currentProduct);
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handleUndo, currentProduct, onSelectProduct]);

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (animatingOut || !currentProduct) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setDragOffset({ x: dx, y: dy });
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      const SWIPE_THRESHOLD = 95;
      if (dragOffset.x > SWIPE_THRESHOLD) {
        handleSwipe('right');
      } else if (dragOffset.x < -SWIPE_THRESHOLD) {
        handleSwipe('left');
      } else {
        // Return to center spring
        setDragOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragOffset.x, handleSwipe]);

  // Touch Drag Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (animatingOut || !currentProduct || e.touches.length === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const SWIPE_THRESHOLD = 85;
    if (dragOffset.x > SWIPE_THRESHOLD) {
      handleSwipe('right');
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      handleSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Drag physics calculations
  const rotationAngle = (dragOffset.x / 250) * 14;
  const likeOpacity = Math.min(1, Math.max(0, dragOffset.x / 65));
  const passOpacity = Math.min(1, Math.max(0, -dragOffset.x / 65));

  // Current Card Transform Style
  const getCardStyle = () => {
    if (animatingOut === 'right') {
      return {
        transform: 'translate3d(120%, 20px, 0) rotate(22deg)',
        opacity: 0,
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }
    if (animatingOut === 'left') {
      return {
        transform: 'translate3d(-120%, 20px, 0) rotate(-22deg)',
        opacity: 0,
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }
    if (isDragging) {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.35}px, 0) rotate(${rotationAngle}deg)`,
        transition: 'none',
        cursor: 'grabbing',
      };
    }
    return {
      transform: 'translate3d(0, 0, 0) rotate(0deg)',
      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  // Liked items in this swipe session
  const sessionLikedProducts = useMemo(() => {
    return history.filter((h) => h.action === 'like').map((h) => h.product);
  }, [history]);

  return (
    <div className="fabric-swiper-container">
      {/* Top Controls & Category Filter Bar */}
      <div className="swiper-header-bar">
        <div className="swiper-title-group">
          <div className="swiper-title-badge">
            <Flame size={14} className="text-terracotta" />
            <span>ปัดค้นหาผ้าทอ</span>
          </div>
          <span className="swiper-counter-text">
            {deckProducts.length > 0 ? (
              <>
                ผืนที่ <strong>{Math.min(currentIndex + 1, deckProducts.length)}</strong> / {deckProducts.length}
              </>
            ) : (
              'ไม่พบผืนผ้า'
            )}
          </span>
        </div>

        <button 
          className={`swiper-filter-toggle-btn ${selectedRegion !== 'ทั้งหมด' || selectedCategory !== 'ทั้งหมด' ? 'active' : ''}`}
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          title="ตัวกรองลายผ้า"
        >
          <Filter size={15} />
          <span>
            {selectedRegion !== 'ทั้งหมด' || selectedCategory !== 'ทั้งหมด' 
              ? `${selectedRegion !== 'ทั้งหมด' ? selectedRegion : ''} ${selectedCategory !== 'ทั้งหมด' ? selectedCategory : ''}`.trim()
              : 'กรองผ้า'}
          </span>
        </button>
      </div>

      {/* Filter Dropdown Tray */}
      {showFilterDropdown && (
        <div className="swiper-filter-tray">
          <div className="swiper-filter-section">
            <span className="swiper-filter-label">ภูมิภาค:</span>
            <div className="swiper-filter-chips">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  className={`swiper-filter-chip ${selectedRegion === r ? 'active' : ''}`}
                  onClick={() => setSelectedRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="swiper-filter-section" style={{ marginTop: '8px' }}>
            <span className="swiper-filter-label">หมวดหมู่:</span>
            <div className="swiper-filter-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`swiper-filter-chip ${selectedCategory === c ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar Indicator */}
      {deckProducts.length > 0 && (
        <div className="swiper-progress-track">
          <div 
            className="swiper-progress-fill" 
            style={{ 
              width: `${Math.min(100, (currentIndex / deckProducts.length) * 100)}%` 
            }} 
          />
        </div>
      )}

      {/* Card Deck Area */}
      <div className="swiper-deck-stage">
        {currentProduct ? (
          <div className="swiper-card-stack">
            {/* 3rd Card in background */}
            {thirdProduct && (
              <div className="swiper-card-under third">
                <img 
                  src={thirdProduct.images[0] || '/images/mudmee.jpg'} 
                  alt={thirdProduct.title} 
                  className="swiper-card-bg-img" 
                />
              </div>
            )}

            {/* 2nd Card in background */}
            {nextProduct && (
              <div className="swiper-card-under second">
                <img 
                  src={nextProduct.images[0] || '/images/mudmee.jpg'} 
                  alt={nextProduct.title} 
                  className="swiper-card-bg-img" 
                />
                <div className="swiper-card-under-overlay" />
                <div className="swiper-card-under-info">
                  <span className="swiper-under-pattern">{nextProduct.patternName}</span>
                </div>
              </div>
            )}

            {/* Current Top Card (Interactive Drag) */}
            <div
              className={`swiper-active-card ${isDragging ? 'is-dragging' : ''}`}
              style={getCardStyle()}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image & Main Visual */}
              <div className="swiper-card-media">
                <img
                  src={currentProduct.images[0] || '/images/mudmee.jpg'}
                  alt={currentProduct.title}
                  className="swiper-card-img"
                  draggable={false}
                />
                <div className="swiper-card-gradient" />

                {/* Stamped Badges on Drag */}
                <div 
                  className="swiper-stamp stamp-like"
                  style={{ opacity: likeOpacity, transform: `scale(${0.85 + likeOpacity * 0.25}) rotate(-12deg)` }}
                >
                  <Heart size={20} fill="#B85D43" />
                  <span>ถูกใจ ❤️</span>
                </div>

                <div 
                  className="swiper-stamp stamp-pass"
                  style={{ opacity: passOpacity, transform: `scale(${0.85 + passOpacity * 0.25}) rotate(12deg)` }}
                >
                  <X size={20} strokeWidth={3} />
                  <span>ข้าม ✕</span>
                </div>

                {/* Top Overlay Meta Tags */}
                <div className="swiper-media-top-tags">
                  <span className="swiper-origin-pill">
                    <MapPin size={12} />
                    จ.{currentProduct.province} • {currentProduct.region}
                  </span>
                  <span className="swiper-category-pill">
                    {currentProduct.category}
                  </span>
                </div>
              </div>

              {/* Card Story & Content Section */}
              <div className="swiper-card-body">
                <div className="swiper-body-head">
                  <div>
                    <span className="swiper-pattern-eyebrow">{currentProduct.patternName}</span>
                    <h3 className="swiper-card-title">{currentProduct.title}</h3>
                  </div>
                  <div className="swiper-price-badge">
                    <span className="swiper-price-num">฿{currentProduct.price.toLocaleString()}</span>
                    <span className="swiper-price-unit">/{currentProduct.priceUnit}</span>
                  </div>
                </div>

                {/* Meaning & Story Snippet */}
                {currentProduct.meaning && (
                  <p className="swiper-story-snippet">
                    ✨ <strong>ความหมายมงคล:</strong> {currentProduct.meaning}
                  </p>
                )}

                {/* Weaver & Specs Bar */}
                <div className="swiper-weaver-bar">
                  <div className="swiper-weaver-info">
                    <img 
                      src={currentProduct.seller.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'} 
                      alt={currentProduct.seller.name} 
                      className="swiper-weaver-avatar"
                    />
                    <div>
                      <span className="swiper-weaver-shop">{currentProduct.seller.shopName}</span>
                      <span className="swiper-weaver-name">ช่างทอ: {currentProduct.seller.name}</span>
                    </div>
                  </div>

                  <button 
                    className="swiper-detail-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(currentProduct);
                    }}
                    title="ดูเรื่องราวและข้อมูลเต็ม"
                  >
                    <Info size={15} />
                    <span>ดูลายละเอียด</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Completed Deck State */
          <div className="swiper-completed-card">
            <div className="swiper-completed-icon-circle">
              <Sparkles size={38} className="text-gold" />
            </div>

            <h3>คุณดูผ้าชุดนี้ครบหมดแล้ว!</h3>
            <p>
              {sessionLikedProducts.length > 0
                ? `ในการปัดรอบนี้ คุณบันทึกผืนผ้าที่ถูกใจไว้ทั้งหมด ${sessionLikedProducts.length} ผืน`
                : 'ลองเลือกหมวดหมู่ผ้าใหม่ หรือเริ่มปัดใหม่อีกรอบเพื่อค้นหาผืนที่ใช่'}
            </p>

            {/* Showcase of liked items during this session */}
            {sessionLikedProducts.length > 0 && (
              <div className="swiper-session-liked-grid">
                {sessionLikedProducts.slice(0, 4).map((item) => (
                  <div 
                    key={item.id} 
                    className="swiper-session-liked-item"
                    onClick={() => onSelectProduct(item)}
                  >
                    <img src={item.images[0] || '/images/mudmee.jpg'} alt={item.title} />
                    <div className="swiper-session-liked-info">
                      <span className="liked-pattern">{item.patternName}</span>
                      <span className="liked-price">฿{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="swiper-completed-actions">
              <button className="btn-primary" onClick={handleResetDeck}>
                <RefreshCw size={16} />
                <span>เริ่มปัดใหม่อีกครั้ง</span>
              </button>
              
              <button className="btn-secondary" onClick={onExploreAll}>
                <Layers size={16} />
                <span>ดูผ้าทั้งหมดในตลาด</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Swipe Controls */}
      {currentProduct && (
        <div className="swiper-action-buttons">
          {/* 1. Undo Button */}
          <button
            className="swiper-action-btn btn-undo"
            onClick={handleUndo}
            disabled={history.length === 0}
            title="ย้อนกลับ (Z / Backspace)"
            aria-label="ย้อนกลับ"
          >
            <RotateCcw size={20} />
          </button>

          {/* 2. Pass Button */}
          <button
            className="swiper-action-btn btn-pass"
            onClick={() => handleSwipe('left')}
            title="ข้าม (ลูกศรซ้าย ←)"
            aria-label="ข้ามผืนนี้"
          >
            <X size={26} strokeWidth={2.6} />
          </button>

          {/* 3. Detail / Inspect Modal */}
          <button
            className="swiper-action-btn btn-info"
            onClick={() => onSelectProduct(currentProduct)}
            title="ดูรายละเอียด (ลูกศรขึ้น ↑)"
            aria-label="ดูรายละเอียดผืนผ้า"
          >
            <Info size={22} />
          </button>

          {/* 4. Like / Wishlist Button */}
          <button
            className={`swiper-action-btn btn-like ${likedIds.includes(currentProduct.id) ? 'active-liked' : ''}`}
            onClick={() => handleSwipe('right')}
            title="ถูกใจ (ลูกศรขวา →)"
            aria-label="ถูกใจผืนผ้า"
          >
            <Heart 
              size={26} 
              fill={likedIds.includes(currentProduct.id) ? '#B85D43' : 'none'} 
              color={likedIds.includes(currentProduct.id) ? '#B85D43' : 'currentColor'}
            />
          </button>

          {/* 5. Instant Buy / Cart Button */}
          <button
            className="swiper-action-btn btn-buy"
            onClick={() => onBuyNow(currentProduct)}
            title="สั่งซื้อผืนนี้ทันที"
            aria-label="สั่งซื้อผืนนี้ทันที"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Hint Bar on Desktop */}
      <div className="swiper-desktop-hints show-on-desktop">
        <span>💡 ปุ่มลัดคีย์บอร์ด:</span>
        <kbd>←</kbd> ข้าม
        <kbd>→</kbd> ถูกใจ
        <kbd>↑</kbd> ดูรายละเอียด
        <kbd>Z</kbd> ย้อนกลับ
      </div>
    </div>
  );
};
