import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';
import { X, Lock, Mail, User, Store, Phone, MapPin, CheckCircle2, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('seller');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [lineId, setLineId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const { user, error } = await authService.signIn(email, password);
        if (error) {
          setErrorMessage(error);
        } else if (user) {
          onAuthSuccess(user);
          onClose();
        }
      } else {
        if (!name && !shopName) {
          setErrorMessage('กรุณาระบุชื่อของคุณหรือชื่อร้านค้า');
          setLoading(false);
          return;
        }

        const { user, error } = await authService.signUp({
          email,
          password,
          name: name || shopName,
          shopName: role === 'seller' ? shopName || name : '',
          role,
          phone,
          province: province || 'ไม่ระบุ',
          lineId,
        });

        if (error) {
          setErrorMessage(error);
        } else if (user) {
          onAuthSuccess(user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet auth-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <span className="badge-tag badge-kram" style={{ marginBottom: '2px' }}>
              สานไทย สมาชิก & ร้านค้า
            </span>
            <h3 style={{ fontSize: '16px' }}>
              {tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-subtle)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '13.5px',
                fontWeight: tab === 'login' ? 600 : 400,
                background: tab === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'login' ? 'var(--primary-kram)' : 'var(--text-muted)',
                boxShadow: tab === 'login' ? 'var(--shadow-xs)' : 'none',
                gap: '5px'
              }}
            >
              <LogIn size={15} />
              <span>เข้าสู่ระบบ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '13.5px',
                fontWeight: tab === 'register' ? 600 : 400,
                background: tab === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'register' ? 'var(--primary-kram)' : 'var(--text-muted)',
                boxShadow: tab === 'register' ? 'var(--shadow-xs)' : 'none',
                gap: '5px'
              }}
            >
              <UserPlus size={15} />
              <span>สมัครสมาชิก</span>
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#FDF2F2',
                border: '1px solid #F8B4B4',
                color: '#9B1C1C',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* REGISTER: ROLE PICKER */}
            {tab === 'register' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  ประเภทสมาชิก:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${role === 'seller' ? 'var(--primary-kram)' : 'var(--border-color)'}`,
                      background: role === 'seller' ? 'var(--primary-kram-light)' : 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <Store size={18} color="var(--primary-kram)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-kram)' }}>
                      ช่างทอ / ร้านค้า
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      ลงโพสต์ขายผ้าไทย
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${role === 'buyer' ? 'var(--accent-terracotta)' : 'var(--border-color)'}`,
                      background: role === 'buyer' ? 'var(--accent-terracotta-light)' : 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <User size={18} color="var(--accent-terracotta)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                      ผู้ซื้อ / บุคคลทั่วไป
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      สั่งซื้อ & ติดตามผ้าไทย
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>อีเมล (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>รหัสผ่าน (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                minLength={6}
                required
              />
            </div>

            {/* REGISTRATION EXTRA FIELDS */}
            {tab === 'register' && (
              <>
                {role === 'seller' ? (
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>ชื่อร้านค้า / กลุ่มทอผ้า</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="ระบุชื่อร้านค้าของคุณ"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>ชื่อ-นามสกุล ผู้ซื้อ</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ระบุชื่อ-นามสกุลของคุณ"
                      required
                    />
                  </div>
                )}

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
                    <label style={{ fontSize: '12px' }}>จังหวัด</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="เช่น ขอนแก่น, น่าน"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px' }}>LINE ID (สำหรับติดต่อ)</label>
                  <input
                    type="text"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="ไอดีไลน์ (ถ้ามี)"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                fontSize: '14.5px',
                borderRadius: 'var(--radius-sm)'
              }}
              disabled={loading}
              id="btn-auth-submit"
            >
              {loading
                ? 'กำลังดำเนินการ...'
                : tab === 'login'
                ? 'เข้าสู่ระบบทันที'
                : 'ยืนยันการสมัครสมาชิก'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
