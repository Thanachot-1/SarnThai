import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart,
  ShieldCheck,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: (productId: string) => void;
  onOpenChat: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isLiked,
  onToggleLike,
  onOpenChat,
  onAddToCart,
  onBuyNow,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalImgLoaded, setIsModalImgLoaded] = useState(false);

  // Reset image loaded state when product changes
  React.useEffect(() => {
    setIsModalImgLoaded(false);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLine = () => {
    navigator.clipboard.writeText(product.seller.lineId);
    showToast(`คัดลอก LINE ID: ${product.seller.lineId} เรียบร้อยแล้ว`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `ชมผ้าลายไทยสวยๆ "${product.title}" บน สานไทย`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('คัดลอกลิงก์ผืนผ้านี้เรียบร้อยแล้ว');
    }
  };

  const handleAddCartClick = () => {
    onAddToCart(product);
    showToast(`เพิ่ม "${product.patternName}" ลงตะกร้าแล้ว`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet product-detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />
        
        <div className="modal-header">
          <div>
            <span className="badge-tag badge-kram" style={{ marginBottom: '2px' }}>
              📍 ภาค{product.region} • จ.{product.province}
            </span>
            <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>
              รายละเอียดผืนผ้า
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="modal-close-btn" 
              onClick={handleShare}
              title="แชร์ผืนผ้านี้"
              aria-label="แชร์"
            >
              <Share2 size={16} />
            </button>
            <button 
              className="modal-close-btn" 
              onClick={onClose}
              title="ปิด"
              aria-label="ปิด"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body product-detail-body">
          {/* Left Column on Desktop: Media & Gallery */}
          <div className="detail-col-media">
            {/* Zoomable Fabric Texture View */}
            <div className="detail-img-container" onClick={() => setIsZoomed(!isZoomed)}>
              {!isModalImgLoaded && (
                <div
                  className="skeleton-shimmer"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    borderRadius: '16px',
                  }}
                />
              )}
              <img
                src={product.images[0] || '/images/mudmee.jpg'}
                alt={product.title}
                className={`detail-img ${isZoomed ? 'zoomed' : ''}`}
                style={{
                  opacity: isModalImgLoaded ? 1 : 0,
                  transition: 'opacity 0.35s ease',
                }}
                onLoad={() => setIsModalImgLoaded(true)}
              />
              <div className="zoom-guide-tag">
                {isZoomed ? (
                  <>
                    <ZoomOut size={13} /> แตะเพื่อย่อกลับ
                  </>
                ) : (
                  <>
                    <ZoomIn size={13} /> แตะเพื่อซูมดูลายทอละเอียด
                  </>
                )}
              </div>
            </div>

            {/* Trust Badge */}
            <div 
              className="detail-trust-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={18} color="var(--primary-kram)" />
              <span>ติดต่อซื้อ-ขายโดยตรงกับช่างทอชุมชน ไม่ผ่านคนกลาง การันตีผ้าแท้ 100%</span>
            </div>
          </div>

          {/* Right Column on Desktop: Info, Specs & Actions */}
          <div className="detail-col-info">
            {/* Title & Price Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                  {product.patternName}
                </span>
                
                <button 
                  onClick={() => onToggleLike(product.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}
                >
                  <Heart size={16} fill={isLiked ? '#E63946' : 'none'} color={isLiked ? '#E63946' : 'var(--text-muted)'} />
                  <span>{product.likes + (isLiked ? 1 : 0)} คนถูกใจ</span>
                </button>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px', lineHeight: 1.35 }}>
                {product.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-kram)', fontFamily: 'var(--font-heading)' }}>
                  ฿{product.price.toLocaleString()}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  / {product.priceUnit} (จัดส่งฟรีด่วน EMS)
                </span>
              </div>
            </div>

            {/* Quick Buy & Add to Cart Primary Actions */}
            <div className="detail-primary-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={handleAddCartClick}
                style={{
                  backgroundColor: 'var(--primary-kram-light)',
                  color: 'var(--primary-kram)',
                  border: '1px solid #C4D7EC',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                id="btn-detail-add-cart"
              >
                <ShoppingBag size={18} />
                <span>เพิ่มลงตะกร้า</span>
              </button>

              <button
                onClick={() => onBuyNow(product)}
                style={{
                  backgroundColor: 'var(--accent-terracotta)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(184, 93, 67, 0.25)'
                }}
                id="btn-detail-buy-now"
              >
                <CreditCard size={18} />
                <span>สั่งซื้อทันที</span>
              </button>
            </div>

            {/* Auspicious Meaning Box */}
            {product.meaning && (
              <div className="story-box">
                <div className="story-box-title">
                  <Sparkles size={16} /> ความหมายมงคลของลายผ้า
                </div>
                <p style={{ fontSize: '13px', color: '#6A4D1A', lineHeight: 1.5 }}>
                  {product.meaning}
                </p>
              </div>
            )}

            {/* Specs Grid */}
            <div className="detail-spec-grid">
              <div className="spec-box">
                <span className="spec-box-label">เส้นใยและวัสดุ</span>
                <div className="spec-box-value">{product.material}</div>
              </div>
              
              <div className="spec-box">
                <span className="spec-box-label">ขนาดชิ้นผ้า</span>
                <div className="spec-box-value">
                  {product.dimensions.widthCm} × {product.dimensions.lengthCm} ซม.
                </div>
              </div>

              <div className="spec-box">
                <span className="spec-box-label">หมวดหมู่ผ้า</span>
                <div className="spec-box-value">{product.category}</div>
              </div>

              <div className="spec-box">
                <span className="spec-box-label">แหล่งกำเนิด</span>
                <div className="spec-box-value">จ.{product.province}</div>
              </div>
            </div>

            {/* Story of the Weave */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                เรื่องเล่าและที่มาของผืนผ้า
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {product.story}
              </p>
            </div>

            {/* Seller Profile Card */}
            <div className="seller-profile-card">
              <img
                src={product.seller.avatar}
                alt={product.seller.shopName}
                className="seller-card-avatar"
              />
              <div className="seller-card-info" style={{ flexGrow: 1 }}>
                <h4>
                  {product.seller.shopName}
                  {product.seller.verified && (
                    <CheckCircle2 size={14} color="#06C755" fill="#06C755" stroke="white" />
                  )}
                </h4>
                <p>{product.seller.name} • {product.seller.province}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11.5px' }}>
                  <span className="badge-tag badge-gold">
                    ⭐ {product.seller.rating} ({product.seller.reviewCount} รีวิว)
                  </span>
                  <span style={{ color: 'var(--accent-sage)', fontWeight: 500 }}>
                    {product.seller.responseRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Direct Actions Bar */}
            <div className="detail-actions-bar">
              <button 
                className="btn-contact-phone"
                onClick={() => window.open(`tel:${product.seller.phone}`)}
                title="โทรหาช่างทอ"
              >
                <Phone size={16} />
                <span>โทร</span>
              </button>

              <button 
                className="btn-contact-line"
                onClick={handleCopyLine}
                title="ทัก LINE ผู้ขาย"
              >
                <span>LINE ID</span>
              </button>

              <button 
                className="btn-contact-chat"
                onClick={() => onOpenChat(product)}
                title="ส่งข้อความในแอป"
              >
                <MessageSquare size={16} />
                <span>แชทด่วน</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div 
            style={{
              position: 'fixed',
              bottom: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(38, 35, 34, 0.92)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              zIndex: 2000,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
