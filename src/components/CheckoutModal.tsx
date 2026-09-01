import React, { useState, useEffect } from 'react';
import { CartItem, Order, PaymentMethod, UserProfile } from '../types';
import { X, CheckCircle2, QrCode, Truck, CreditCard, ShieldCheck, Copy, ArrowLeft } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  currentUser: UserProfile | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  currentUser,
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Address State (Clean empty or real user values)
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState(currentUser?.province || '');
  const [postalCode, setPostalCode] = useState('');
  const [lineId, setLineId] = useState(currentUser?.lineId || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!phone) setPhone(currentUser.phone);
      if (!province) setProvince(currentUser.province);
      if (!lineId && currentUser.lineId) setLineId(currentUser.lineId);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = subtotal;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !address || !province || !postalCode) {
      alert('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    const order: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: name,
      customerPhone: phone,
      customerAddress: `${address} จ.${province} ${postalCode}`,
      customerLineId: lineId,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      subtotal,
      shippingFee: 0,
      discount: 0,
      totalAmount,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        patternName: item.product.patternName,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '/images/mudmee.jpg',
        sellerShop: item.product.seller.shopName,
      })),
      status: 'processing',
      createdAt: new Date().toISOString(),
    };

    setCreatedOrder(order);
    setStep('success');
    onOrderSuccess(order);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet checkout-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <span className="badge-tag badge-kram" style={{ marginBottom: '2px' }}>
              สั่งซื้อตรงจากช่างทอ
            </span>
            <h3 style={{ fontSize: '16px' }}>
              {step === 'success' ? 'สั่งซื้อสำเร็จเรียบร้อย' : 'ขั้นตอนการชำระเงิน'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* STEP 1 & 2: ADDRESS & PAYMENT FORM */}
          {step === 'form' && (
            <form onSubmit={handlePlaceOrder}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '8px' }}>
                  📦 ที่อยู่จัดส่งสินค้า
                </h4>

                <div className="form-group">
                  <label style={{ fontSize: '12px' }}>ชื่อ-นามสกุล ผู้รับ</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อ-นามสกุล ผู้รับพัสดุ"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>LINE ID (สำหรับแจ้งสถานะ)</label>
                    <input
                      type="text"
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      placeholder="ไอดีไลน์ (ถ้ามี)"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px' }}>ที่อยู่ (บ้านเลขที่, ถนน, ซอย, แขวง/ตำบล)</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ระบุบ้านเลขที่ หมู่ อาคาร ถนน ซอย และตำบล/แขวง"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>จังหวัด</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="เช่น ขอนแก่น, กรุงเทพฯ"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="เช่น 10110"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '8px' }}>
                  💳 วิธีการชำระเงิน
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* PromptPay */}
                  <label
                    style={{
                      border: `1.5px solid ${paymentMethod === 'promptpay' ? 'var(--primary-kram)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: paymentMethod === 'promptpay' ? 'var(--primary-kram-light)' : 'var(--bg-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'promptpay'}
                      onChange={() => setPaymentMethod('promptpay')}
                      style={{ width: 'auto' }}
                    />
                    <QrCode size={20} color="var(--primary-kram)" />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>พร้อมเพย์ (PromptPay QR)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สแกนจ่ายผ่าน Mobile Banking ทุกธนาคาร</div>
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label
                    style={{
                      border: `1.5px solid ${paymentMethod === 'cod' ? 'var(--primary-kram)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: paymentMethod === 'cod' ? 'var(--primary-kram-light)' : 'var(--bg-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ width: 'auto' }}
                    />
                    <Truck size={20} color="var(--accent-terracotta)" />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>เก็บเงินปลายทาง (COD)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ชำระเงินสดเมื่อได้รับผืนผ้าที่บ้าน</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* PromptPay QR Preview if selected */}
              {paymentMethod === 'promptpay' && (
                <div
                  style={{
                    background: '#F0F4F8',
                    border: '1px solid #C4D7EC',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-kram)', marginBottom: '6px' }}>
                    สแกน QR เพื่อชำระเงิน
                  </div>
                  
                  <div
                    style={{
                      width: '160px',
                      height: '160px',
                      background: 'white',
                      borderRadius: '12px',
                      margin: '0 auto 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ background: '#113566', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', marginBottom: '6px' }}>
                      PromptPay
                    </div>
                    <QrCode size={90} color="#113566" />
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>สานไทย สื่อกลางผ้าทอ</div>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                    ยอดชำระ: ฿{totalAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    (ฟรีค่าจัดส่งด่วน EMS ทุกคำสั่งซื้อ)
                  </div>
                </div>
              )}

              {/* Summary Bottom Bar */}
              <div
                style={{
                  borderTop: '1px solid var(--divider)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ยอดรวมทั้งสิ้น</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                    ฿{totalAmount.toLocaleString()}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '15px' }}
                  id="btn-confirm-payment"
                >
                  ยืนยันการสั่งซื้อ
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS RECEIPT */}
          {step === 'success' && createdOrder && (
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-sage-light)',
                  color: 'var(--accent-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                สั่งซื้อผ้าทอสำเร็จแล้ว!
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                หมายเลขคำสั่งซื้อ: <strong>{createdOrder.id}</strong>
              </p>

              {/* Receipt Box */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  textAlign: 'left',
                  margin: '16px 0',
                  fontSize: '12.5px'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                  สรุปรายการสั่งซื้อ:
                </div>
                {createdOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>• {it.productTitle} x {it.quantity}</span>
                    <span style={{ fontWeight: 600 }}>฿{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '8px 0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
                  <span>ยอดสุทธิ</span>
                  <span style={{ color: 'var(--primary-kram)' }}>฿{createdOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  📍 จัดส่งไปยัง: {createdOrder.customerName} ({createdOrder.customerPhone})<br />
                  {createdOrder.customerAddress}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={onClose}
                >
                  เสร็จสิ้น / กลับสู่หน้าหลัก
                </button>
              </div>
            </div>
          )}
        </div>

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
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
