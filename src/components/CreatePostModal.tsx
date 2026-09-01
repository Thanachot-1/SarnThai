import React, { useState, useEffect } from 'react';
import { Product, Region, Category, UserProfile } from '../types';
import { X, Upload, Check, Sparkles, ChevronRight, ChevronLeft, Store, LogIn } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

const SAMPLE_PRESETS = [
  { label: 'ไหมมัดหมี่', img: '/images/mudmee.jpg', pattern: 'ลายมัดหมี่โบราณ', category: 'ผ้าไหมมัดหมี่', region: 'อีสาน', province: 'ขอนแก่น', material: 'ไหมแท้ 100%' },
  { label: 'ครามสกล', img: '/images/indigo.jpg', pattern: 'ลายเกล็ดเต่าสายน้ำ', category: 'ผ้าคราม', region: 'อีสาน', province: 'สกลนคร', material: 'ฝ้ายเข็นมือ ย้อมครามธรรมชาติ' },
  { label: 'ยกดอกลำพูน', img: '/images/lamphun.jpg', pattern: 'ลายพิกุลแก้วดิ้นทอง', category: 'ผ้ายกดอก', region: 'เหนือ', province: 'ลำพูน', material: 'ไหมแท้ยกดอกดิ้นทอง' },
  { label: 'ตีนจกล้านนา', img: '/images/tinchok.jpg', pattern: 'ลายนาคพันกิ่ง', category: 'ผ้าตีนจก', region: 'เหนือ', province: 'น่าน', material: 'ฝ้ายปั่นมือย้อมสีธรรมชาติ' },
  { label: 'แพรวากาฬสินธุ์', img: '/images/praewa.jpg', pattern: 'ลายเกาะแก้วเพชร', category: 'ผ้าแพรวา', region: 'อีสาน', province: 'กาฬสินธุ์', material: 'ไหมแท้ 100% ลายขิดจก' },
  { label: 'บาติกปัตตานี', img: '/images/batik.jpg', pattern: 'ลายคลื่นสมุทรพฤกษา', category: 'ผ้าบาติก', region: 'ใต้', province: 'ปัตตานี', material: 'ฝ้ายซาตินเขียนเทียนมือ' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  currentUser,
  onOpenAuth,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State (Clean empty defaults, no hardcoded dummy data)
  const [title, setTitle] = useState('');
  const [patternName, setPatternName] = useState('');
  const [category, setCategory] = useState<Category>('ผ้าไหมมัดหมี่');
  const [region, setRegion] = useState<Region>('อีสาน');
  const [province, setProvince] = useState(currentUser?.province || '');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [priceUnit, setPriceUnit] = useState<'ผืน' | 'เมตร' | 'หลา'>('ผืน');
  const [widthCm, setWidthCm] = useState<number | ''>(100);
  const [lengthCm, setLengthCm] = useState<number | ''>(200);
  const [story, setStory] = useState('');
  const [meaning, setMeaning] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Seller Details State (Only from real logged-in user or user input)
  const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.name || '');
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [lineId, setLineId] = useState(currentUser?.lineId || '');

  useEffect(() => {
    if (currentUser) {
      setShopName(currentUser.shopName || currentUser.name || '');
      setSellerName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setLineId(currentUser.lineId || '');
      if (currentUser.province) setProvince(currentUser.province);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // If NOT logged in, prompt user to login first
  if (!currentUser) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div className="modal-drag-handle" />
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-terracotta-light)',
              color: 'var(--accent-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '12px auto 16px'
            }}
          >
            <Store size={32} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            กรุณาเข้าสู่ระบบก่อนโพสต์ขายผ้า
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            การโพสต์ขายผ้าต้องระบุข้อมูลร้านค้าและช่องทางติดต่อจริง เพื่อความน่าเชื่อถือและความปลอดภัยของผู้ซื้อ
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', gap: '6px' }}
            >
              <LogIn size={16} />
              <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedImage(preset.img);
    setPatternName(preset.pattern);
    setCategory(preset.category as Category);
    setRegion(preset.region as Region);
    setProvince(preset.province);
    setMaterial(preset.material);
    setTitle(`ผ้า${preset.category} ${preset.pattern} จ.${preset.province}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      alert('กรุณาเลือกหรืออัปโหลดรูปภาพผ้าก่อนโพสต์');
      setStep(1);
      return;
    }

    const newProduct: Product = {
      id: `prod_${Date.now().toString().slice(-8)}`,
      title: title || `ผ้า${category} ${patternName} จ.${province}`,
      patternName: patternName || 'ลายไทยมงคล',
      price: Number(price) || 0,
      priceUnit,
      category,
      region,
      province: province || currentUser.province || 'ไม่ระบุ',
      material: material || 'ผ้าทอมือ',
      dimensions: {
        widthCm: Number(widthCm) || 100,
        lengthCm: Number(lengthCm) || 200,
      },
      images: [selectedImage],
      story: story || 'ผ้าทอมือทรงคุณค่าจากภูมิปัญญาท้องถิ่น',
      meaning: meaning || '',
      status: 'available',
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      seller: {
        id: currentUser.id,
        name: sellerName || currentUser.name,
        shopName: shopName || currentUser.shopName || currentUser.name,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        province: province || currentUser.province || 'ไม่ระบุ',
        phone: phone || currentUser.phone || '',
        lineId: lineId || currentUser.lineId || '',
        verified: currentUser.verified ?? true,
        rating: 5.0,
        reviewCount: 1,
        responseRate: 'ตอบกลับเร็วมาก',
        badgeText: 'ร้านค้าสมาชิกยืนยันตัวตนแล้ว',
      },
      tags: ['ผ้าทอมือ', category, province, 'พร้อมส่ง'],
      isFeatured: true,
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet create-post-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <span className="badge-tag badge-terracotta" style={{ marginBottom: '2px' }}>
              ร้าน: {currentUser.shopName || currentUser.name}
            </span>
            <h3 style={{ fontSize: '16px' }}>
              ลงโพสต์ขายผืนผ้าใหม่
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* 3-Step Wizard Indicator */}
          <div className="wizard-steps-indicator">
            <div className={`step-node ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 1 ? <Check size={14} /> : '1'}</div>
              <span className="step-label">รูปภาพผ้า</span>
            </div>
            <div className={`step-node ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 2 ? <Check size={14} /> : '2'}</div>
              <span className="step-label">ข้อมูล & ลาย</span>
            </div>
            <div className={`step-node ${step === 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-label">ร้านค้า & โพสต์</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: IMAGES */}
            {step === 1 && (
              <div>
                <div className="form-group">
                  <label>ภาพถ่ายผืนผ้าหลัก</label>
                  
                  {/* Photo Preview & Custom Upload */}
                  <label htmlFor="file-upload-input" className="photo-uploader-box">
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    {selectedImage ? (
                      <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={selectedImage} alt="พรีวิวผ้า" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '11px', padding: '4px 10px', borderRadius: '20px' }}>
                          แตะเพื่อเปลี่ยนรูป
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} color="var(--primary-kram)" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>แตะเพื่อถ่ายภาพหรือเลือกจากมือถือ</div>
                        <div className="form-help">ควรถ่ายในที่มีแสงธรรมชาติเพื่อให้เห็นสีผ้าจริงชัดเจน</div>
                      </>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={14} color="var(--accent-gold)" /> หรือเลือกจากภาพตัวอย่างผ้าไทย:
                  </label>
                  <div className="sample-photo-picker">
                    {SAMPLE_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        className={`sample-photo-chip ${selectedImage === preset.img ? 'selected' : ''}`}
                        onClick={() => handleApplyPreset(preset)}
                      >
                        <img src={preset.img} alt={preset.label} />
                        <span>{preset.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="wizard-nav-btns">
                  <button type="button" className="btn-secondary" onClick={onClose}>
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (!selectedImage) {
                        alert('กรุณาเลือกหรืออัปโหลดรูปภาพผ้าก่อนดำเนินการต่อ');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    <span>ถัดไป: กรอกข้อมูลผ้า</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FABRIC DETAILS */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label>ชื่อประกาศ / หัวข้อ</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น ผ้าไหมมัดหมี่ 6 ตะกอ ย้อมครามธรรมชาติ"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>ชื่อลายผ้า</label>
                    <input
                      type="text"
                      value={patternName}
                      onChange={(e) => setPatternName(e.target.value)}
                      placeholder="เช่น ลายขอเจ้าฟ้าฯ"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>หมวดหมู่ผ้า</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                    >
                      <option value="ผ้าไหมมัดหมี่">ผ้าไหมมัดหมี่</option>
                      <option value="ผ้าคราม">ผ้าคราม</option>
                      <option value="ผ้ายกดอก">ผ้ายกดอก</option>
                      <option value="ผ้าตีนจก">ผ้าตีนจก</option>
                      <option value="ผ้าแพรวา">ผ้าแพรวา</option>
                      <option value="ผ้าบาติก">ผ้าบาติก</option>
                      <option value="ผ้าฝ้ายทอมือ">ผ้าฝ้ายทอมือ</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>ภูมิภาค</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as Region)}
                    >
                      <option value="อีสาน">ภาคอีสาน</option>
                      <option value="เหนือ">ภาคเหนือ</option>
                      <option value="ใต้">ภาคใต้</option>
                      <option value="กลาง">ภาคกลาง</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>จังหวัดต้นกำเนิด</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="เช่น ขอนแก่น, สกลนคร"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>เส้นใยและเทคนิคการทอ</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="เช่น ไหมแท้ 100% เส้นสาวมือ / ฝ้ายเข็นมือ"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>ราคา (บาท)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="3500"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>หน่วย</label>
                    <select
                      value={priceUnit}
                      onChange={(e) => setPriceUnit(e.target.value as any)}
                    >
                      <option value="ผืน">ต่อผืน</option>
                      <option value="เมตร">ต่อเมตร</option>
                      <option value="หลา">ต่อหลา</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>หน้ากว้าง (ซม.)</label>
                    <input
                      type="number"
                      value={widthCm}
                      onChange={(e) => setWidthCm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>ความยาว (ซม.)</label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="200"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>เรื่องเล่า & ความหมายมงคล (ถ้ามี)</label>
                  <textarea
                    rows={2}
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="ความหมายมงคลของลาย หรือโอกาสที่แนะนำให้สวมใส่"
                  />
                </div>

                <div className="wizard-nav-btns">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    <ChevronLeft size={16} />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (!title || !patternName || !price) {
                        alert('กรุณากรอกชื่อประกาศ ลายผ้า และราคาให้ครบถ้วน');
                        return;
                      }
                      setStep(3);
                    }}
                  >
                    <span>ถัดไป: ข้อมูลติดต่อ</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SELLER INFO & PUBLISH */}
            {step === 3 && (
              <div>
                <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-kram)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Store size={15} /> ข้อมูลร้านค้าของคุณ
                  </h4>
                  
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px' }}>ชื่อร้านค้า</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="ชื่อร้านค้าของคุณ"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px' }}>ชื่อผู้ติดต่อ</label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="ชื่อของคุณ"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '12px' }}>เบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="089-xxx-xxxx"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '12px' }}>LINE ID</label>
                      <input
                        type="text"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        placeholder="ไอดีไลน์ (ถ้ามี)"
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Preview Box */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                  <img src={selectedImage || '/images/mudmee.jpg'} alt="พรีวิว" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>{patternName}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{title || `ผ้า${category} จ.${province}`}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-kram)' }}>
                      ฿{Number(price).toLocaleString()} /{priceUnit}
                    </div>
                  </div>
                </div>

                <div className="wizard-nav-btns">
                  <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                    <ChevronLeft size={16} />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button type="submit" className="btn-primary" id="btn-submit-post">
                    <Check size={18} />
                    <span>ยืนยันและโพสต์ขึ้นตลาดทันที</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
