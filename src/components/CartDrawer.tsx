import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 0 ? 0 : 0; // โปรโมชั่นจัดส่งฟรี
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary-kram)" />
            <h3 style={{ fontSize: '16px' }}>
              ตะกร้าผ้าทอของคุณ ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {cartItems.length > 0 ? (
            <>
              {/* Shipping Promotion Banner */}
              <div
                style={{
                  background: 'var(--accent-sage-light)',
                  border: '1px solid #D4E8DF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--accent-sage)',
                  fontWeight: 600,
                  marginBottom: '14px'
                }}
              >
                <Truck size={16} />
                <span>สิทธิพิเศษ: จัดส่งฟรีด่วน EMS ทั่วประเทศทุกผืน</span>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {cartItems.map(({ product, quantity }) => (
                  <div
                    key={product.id}
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
                      src={product.images[0] || '/images/mudmee.jpg'}
                      alt={product.title}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                    />

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                        {product.patternName}
                      </div>
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px'
                        }}
                      >
                        {product.title}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        ร้าน {product.seller.shopName} (จ.{product.province})
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                          ฿{(product.price * quantity).toLocaleString()}
                        </div>

                        {/* Quantity Controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 8px'
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            style={{ padding: '2px' }}
                            aria-label="ลดจำนวน"
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            style={{ padding: '2px' }}
                            aria-label="เพิ่มจำนวน"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      style={{ color: 'var(--text-light)', padding: '6px' }}
                      title="ลบออกจากตะกร้า"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Price Summary Box */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>ราคารวมค่าผ้า</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  <span>ค่าจัดส่ง</span>
                  <span style={{ color: 'var(--accent-sage)', fontWeight: 600 }}>ฟรี</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '8px', color: 'var(--text-main)' }}>
                  <span>ยอดสุทธิ</span>
                  <span style={{ color: 'var(--primary-kram)', fontSize: '18px' }}>฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  gap: '8px',
                  borderRadius: 'var(--radius-sm)'
                }}
                onClick={onProceedCheckout}
                id="btn-proceed-checkout"
              >
                <span>สั่งซื้อและชำระเงิน</span>
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                ยังไม่มีผืนผ้าในตะกร้า
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                เลือกชมผ้าทอสวยๆ จากช่างทอชุมชนแล้วกดเพิ่มลงตะกร้าได้เลยครับ
              </p>
              <button
                className="btn-primary"
                style={{ display: 'inline-flex', padding: '10px 20px', margin: '0 auto' }}
                onClick={onClose}
              >
                เลือกชมผ้าทอต่อ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
