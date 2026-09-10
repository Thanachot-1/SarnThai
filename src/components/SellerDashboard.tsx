import React from 'react';
import { Product, ProductStatus, UserProfile } from '../types';
import { Store, Plus, CheckCircle2, Trash2, LogIn, UserPlus, PackageOpen } from 'lucide-react';

interface SellerDashboardProps {
  products: Product[];
  onOpenCreateModal: () => void;
  onUpdateProductStatus: (productId: string, newStatus: ProductStatus) => void;
  onDeleteProduct: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  onOpenCreateModal,
  onUpdateProductStatus,
  onDeleteProduct,
  onSelectProduct,
  currentUser,
  onOpenAuth,
}) => {
  // If NOT logged in: Show clean Login Prompt without any fake/mock store
  if (!currentUser) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-kram-light)',
            color: 'var(--primary-kram)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <Store size={36} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-kram)', marginBottom: '8px' }}>
          ร้านค้าของฉัน (Seller Studio)
        </h3>
        
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
          เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มต้นโพสต์ขายผ้าไทย จัดการรายการผ้า และดูยอดการเข้าชมของร้านคุณ
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', gap: '6px' }}
            id="btn-seller-login-cta"
          >
            <LogIn size={16} />
            <span>เข้าสู่ระบบร้านค้า</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>สมัครสมาชิกร้านค้าใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // If Admin: Show ALL products in marketplace. If Seller: Only show own products
  const displayedProducts = isAdmin
    ? products
    : products.filter(
        (p) => p.seller.id === currentUser.id || (currentUser.phone && p.seller.phone === currentUser.phone)
      );

  const totalViews = displayedProducts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = displayedProducts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const activeCount = displayedProducts.filter((p) => p.status === 'available').length;

  const handleDelete = (productId: string, title: string) => {
    const confirmMsg = isAdmin
      ? `🛡️ [โหมดผู้ดูแลระบบ Admin]\nต้องการลบผ้า "${title}" ออกจากตลาด SanThai ใช่หรือไม่? การลบจะมีผลทันที`
      : `คุณต้องการลบรายการผ้า "${title}" ใช่หรือไม่?`;
    if (window.confirm(confirmMsg)) {
      onDeleteProduct(productId);
    }
  };

  return (
    <div className="seller-dashboard-container">
      {/* Seller / Admin Header Profile Card */}
      <div 
        className="seller-hero-card"
        style={isAdmin ? {
          background: 'linear-gradient(135deg, #2D142C 0%, #4D1745 50%, #1E324F 100%)',
          border: '1px solid rgba(212, 163, 89, 0.4)'
        } : {}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <img
            src={
              currentUser.avatar ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
            }
            alt={currentUser.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #D4A359', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {currentUser.shopName || currentUser.name}
                {currentUser.verified && (
                  <CheckCircle2 size={15} color="#D4A359" fill="#D4A359" stroke="#1E324F" />
                )}
              </h3>
              {isAdmin && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#D4A359',
                    color: '#2A1400',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#D2DEEB' }}>
              {isAdmin ? '🛡️ แผงควบคุมระบบ (สิทธิ์ลบและจัดการสินค้าทุกรายการ)' : `📍 จ.${currentUser.province || 'ไม่ระบุ'} • ${currentUser.email}`}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{displayedProducts.length}</div>
            <div style={{ fontSize: '11px', color: '#B0C4DE' }}>
              {isAdmin ? 'ผ้าทั้งหมดในระบบ' : 'ผ้าของฉัน (ผืน)'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#D4A359' }}>{totalViews}</div>
            <div style={{ fontSize: '11px', color: '#B0C4DE' }}>ยอดเข้าชมรวม</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FF7B72' }}>{totalLikes}</div>
            <div style={{ fontSize: '11px', color: '#B0C4DE' }}>ยอดกดใจรวม</div>
          </div>
        </div>
      </div>

      {/* Add Product Button */}
      <button
        onClick={onOpenCreateModal}
        className="seller-add-btn"
        id="btn-seller-add-product"
      >
        <Plus size={20} strokeWidth={2.5} />
        <span>{isAdmin ? 'ลงขายผ้าใหม่ในนามแอดมิน (+ เพิ่มสินค้า)' : 'ลงขายผ้าผืนใหม่ (+ เพิ่มสินค้า)'}</span>
      </button>

      {/* Product List Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600 }}>
          {isAdmin ? `รายการผ้าทั้งหมดในระบบ (${displayedProducts.length} รายการ)` : `รายการผ้าของฉัน (${activeCount} พร้อมส่ง)`}
        </h4>
        {isAdmin && (
          <span style={{ fontSize: '11.5px', color: '#C53030', fontWeight: 600 }}>
            🛡️ สามารถกดปุ่มถังขยะเพื่อลบผ้าใดๆ ได้ทันที
          </span>
        )}
      </div>

      {/* Products List */}
      {displayedProducts.length > 0 ? (
        <div className="seller-products-grid">
          {displayedProducts.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <img
                src={p.images[0] || '/images/mudmee.jpg'}
                alt={p.title}
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => onSelectProduct(p)}
              />

              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                    {p.patternName}
                  </span>
                  {isAdmin && (
                    <span style={{ fontSize: '10.5px', color: 'var(--primary-kram)', background: 'var(--primary-kram-light)', padding: '1px 5px', borderRadius: '3px' }}>
                      🏪 {p.seller.shopName || p.seller.name}
                    </span>
                  )}
                </div>
                <h5
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectProduct(p)}
                >
                  {p.title}
                </h5>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                    ฿{p.price.toLocaleString()}
                  </span>
                  
                  {/* Status Toggle Dropdown */}
                  <select
                    value={p.status}
                    onChange={(e) => onUpdateProductStatus(p.id, e.target.value as ProductStatus)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-xs)',
                      background:
                        p.status === 'available'
                          ? 'var(--accent-sage-light)'
                          : p.status === 'reserved'
                          ? 'var(--accent-gold-light)'
                          : '#F0ECE6',
                      color:
                        p.status === 'available'
                          ? 'var(--accent-sage)'
                          : p.status === 'reserved'
                          ? 'var(--accent-gold)'
                          : 'var(--text-muted)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="available">🟢 พร้อมส่ง</option>
                    <option value="reserved">🟡 ติดจอง</option>
                    <option value="sold">⚪ ขายแล้ว</option>
                  </select>
                </div>
              </div>

              {/* Delete action */}
              <button
                onClick={() => handleDelete(p.id, p.title)}
                title={isAdmin ? "🛡️ ลบสินค้านี้ (สิทธิ์ Admin)" : "ลบรายการนี้"}
                style={{ 
                  color: '#E63946', 
                  padding: '8px', 
                  background: 'rgba(230, 57, 70, 0.08)',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="ลบสินค้า"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '32px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
          <PackageOpen size={40} className="empty-icon" />
          <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            {isAdmin ? 'ยังไม่มีรายการผ้าในระบบ' : 'คุณยังไม่มีรายการผ้าที่ลงขาย'}
          </h5>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {isAdmin ? 'สามารถเพิ่มผ้าตัวอย่างได้ที่ปุ่มลงขายด้านบน' : 'กดปุ่ม "ลงขายผ้าผืนใหม่" ด้านบนเพื่อโพสต์ผ้าลายไทยของคุณขึ้นสู่ตลาด'}
          </p>
        </div>
      )}
    </div>
  );
};

