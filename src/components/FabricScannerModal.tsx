import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  RotateCw, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  RefreshCw, 
  Layers,
  MapPin,
  Flame,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  analyzeFabricWithGemini, 
  FabricAnalysisResult 
} from '../services/geminiVisionService';

interface FabricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindInMarket: (categoryKey: string, searchTerm: string) => void;
  onAskChatBot: (question: string) => void;
}

// ตัวอย่างรูปผ้าไทยสำหรับทดสอบด่วน (Quick Presets)
const PRESET_FABRICS = [
  {
    id: 'mudmee',
    title: 'ผ้าไหมมัดหมี่',
    subtitle: 'ลายเรขาคณิตมงคล',
    src: '/images/mudmee.jpg',
  },
  {
    id: 'praewa',
    title: 'ผ้าไหมแพรวา',
    subtitle: 'ราชินีแห่งไหม กาฬสินธุ์',
    src: '/images/praewa.jpg',
  },
  {
    id: 'tinchok',
    title: 'ผ้าตีนจก',
    subtitle: 'จกขนเม่น สุโขทัย',
    src: '/images/tinchok.jpg',
  },
  {
    id: 'indigo',
    title: 'ผ้าย้อมคราม',
    subtitle: 'ครามธรรมชาติ สกลนคร',
    src: '/images/indigo.jpg',
  },
  {
    id: 'batik',
    title: 'ผ้าบาติกแดนใต้',
    subtitle: 'เขียนเทียนลายริ้วคลื่น',
    src: '/images/batik.jpg',
  },
  {
    id: 'lamphun',
    title: 'ผ้ายกลำพูน',
    subtitle: 'ยกดอกดิ้นทองหลวง',
    src: '/images/lamphun.jpg',
  },
];

export const FabricScannerModal: React.FC<FabricScannerModalProps> = ({
  isOpen,
  onClose,
  onFindInMarket,
  onAskChatBot,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<FabricAnalysisResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // เริ่มต้นกล้องเมื่อเปิดแท็บ camera
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !selectedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, selectedImage]);

  // ปิดกล้องเมื่อปิด Modal
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับการเปิดกล้อง');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง หรือใช้วิธีอัปโหลดภาพแทน');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // ถ่ายภาพจาก Video Stream
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    stopCamera();
    setSelectedImage(dataUrl);
    processImageWithAI(dataUrl);
  };

  // จัดการอัปโหลดไฟล์จากเครื่อง
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      processImageWithAI(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // เลือกภาพตัวอย่าง (Preset)
  const handleSelectPreset = async (presetSrc: string) => {
    try {
      setIsScanning(true);
      setScanStatus('กำลังโหลดภาพผืนผ้าตัวอย่าง...');
      
      const response = await fetch(presetSrc);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        processImageWithAI(dataUrl);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading preset:', err);
      setIsScanning(false);
    }
  };

  // ประมวลผลภาพด้วย Gemini Vision
  const processImageWithAI = async (imageDataUrl: string) => {
    setIsScanning(true);
    setAnalysisResult(null);

    // ลำดับข้อความระหว่างสแกน
    setScanStatus('กำลังตรวจจับโครงสร้างลายผ้าและเส้นใย...');
    const t1 = setTimeout(() => {
      setScanStatus('กำลังเปรียบเทียบลักษณะเทคนิคการทอ (มัดหมี่/จก/ขิด/ยกดอก)...');
    }, 1200);

    const t2 = setTimeout(() => {
      setScanStatus('กำลังประมวลผลภูมิปัญญาพื้นบ้านและความหมายมงคล...');
    }, 2400);

    try {
      // ดึงเฉพาะ base64 string
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = imageDataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

      const result = await analyzeFabricWithGemini(base64Data, mimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error during AI analysis:', err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsScanning(false);
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    setIsScanning(false);
    setAnalysisResult(null);
    setScanStatus('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-backdrop" onClick={onClose}>
      <div 
        className="scanner-modal-card" 
        onClick={(e) => e.stopPropagation()}
        id="fabric-scanner-modal"
      >
        {/* Header Bar */}
        <div className="scanner-header">
          <div className="scanner-header-left">
            <div className="scanner-header-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>สแกนผ้าไทยด้วย AI</h3>
              <p className="scanner-subtitle">
                วิเคราะห์ชนิดผ้า ลวดลาย เทคนิคการทอ และความหมายมงคล
              </p>
            </div>
          </div>
          <button 
            className="scanner-close-btn" 
            onClick={onClose}
            aria-label="ปิดหน้าต่างสแกน"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Mode Tabs (เมื่อยังไม่ได้เลือกรูป) */}
        {!selectedImage && (
          <div className="scanner-tab-bar">
            <button
              className={`scanner-tab-item ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              <Camera size={15} />
              <span>เปิดกล้องถ่าย</span>
            </button>
            <button
              className={`scanner-tab-item ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={15} />
              <span>อัปโหลดรูป</span>
            </button>
            <button
              className={`scanner-tab-item ${activeTab === 'preset' ? 'active' : ''}`}
              onClick={() => setActiveTab('preset')}
            >
              <Sparkles size={15} />
              <span>ทดสอบตัวอย่างผ้า</span>
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="scanner-body">
          {/* STATE 1: กำลังเลือกรูปภาพ (กล้อง / อัปโหลด / ตัวอย่าง) */}
          {!selectedImage && (
            <>
              {/* TAB 1: Live Camera */}
              {activeTab === 'camera' && (
                <div className="scanner-camera-view">
                  <div className="scanner-viewfinder">
                    <video 
                      ref={videoRef} 
                      playsInline 
                      muted 
                      className="scanner-video-feed" 
                    />
                    
                    {/* Viewfinder Reticle / Corner Brackets */}
                    <div className="scanner-reticle">
                      <div className="corner-bracket top-left" />
                      <div className="corner-bracket top-right" />
                      <div className="corner-bracket bottom-left" />
                      <div className="corner-bracket bottom-right" />
                      <div className="scanner-reticle-center" />
                    </div>

                    <div className="scanner-guide-badge">
                      <span>✦ วางผืนผ้าให้อยู่ในกรอบเพื่อความคมชัด</span>
                    </div>

                    {/* Camera Control Buttons */}
                    <div className="scanner-camera-controls">
                      <button 
                        className="scanner-flip-btn"
                        onClick={toggleCameraFacing}
                        title="สลับกล้องหน้า/หลัง"
                      >
                        <RotateCw size={18} />
                      </button>

                      <button 
                        className="scanner-shutter-btn"
                        onClick={capturePhoto}
                        title="กดเพื่อถ่ายรูปวิเคราะห์"
                        id="btn-scanner-capture"
                      >
                        <div className="shutter-inner" />
                      </button>

                      <button 
                        className="scanner-upload-alt-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="เลือกรูปจากคลังภาพ"
                      >
                        <Upload size={18} />
                      </button>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="scanner-camera-alert">
                      <Info size={16} />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: File Upload */}
              {activeTab === 'upload' && (
                <div 
                  className="scanner-upload-view"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-dropzone">
                    <div className="upload-icon-circle">
                      <Upload size={32} />
                    </div>
                    <h4>คลิกหรือลากรูปถ่ายผืนผ้ามาวางที่นี่</h4>
                    <p>รองรับไฟล์ JPG, PNG, WebP (แนะนำภาพซูมระยะใกล้ให้เห็นลายชัดเจน)</p>
                    <button className="upload-select-btn">
                      เลือกไฟล์จากอุปกรณ์
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Preset Thai Fabrics Gallery */}
              {activeTab === 'preset' && (
                <div className="scanner-preset-view">
                  <div className="preset-intro">
                    <Sparkles size={16} className="preset-sparkle" />
                    <span>คลิกเพื่อทดสอบความแม่นยำของ AI ด้วยภาพผ้าไทยของจริง:</span>
                  </div>
                  <div className="preset-grid">
                    {PRESET_FABRICS.map((preset) => (
                      <div 
                        key={preset.id}
                        className="preset-item-card"
                        onClick={() => handleSelectPreset(preset.src)}
                      >
                        <img src={preset.src} alt={preset.title} />
                        <div className="preset-item-info">
                          <h5>{preset.title}</h5>
                          <span>{preset.subtitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </>
          )}

          {/* STATE 2: แสดงภาพที่เลือก + กำลังสแกน (Scanning Animation) */}
          {selectedImage && isScanning && (
            <div className="scanner-processing-view">
              <div className="scanner-laser-viewport">
                <img src={selectedImage} alt="ผืนผ้าที่สแกน" className="scanned-image-preview" />
                
                {/* Laser Scanning Bar */}
                <div className="scanner-laser-beam" />
                
                {/* Scanning Radar Grid */}
                <div className="scanner-grid-overlay" />
                
                {/* Corner Accents */}
                <div className="corner-bracket top-left active" />
                <div className="corner-bracket top-right active" />
                <div className="corner-bracket bottom-left active" />
                <div className="corner-bracket bottom-right active" />
              </div>

              <div className="scanner-status-card">
                <div className="scanner-spin-icon">
                  <RefreshCw size={24} className="spin-anim" />
                </div>
                <div className="scanner-status-text">
                  <h4>Gemini Vision กำลังวิเคราะห์...</h4>
                  <p>{scanStatus}</p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: แสดงผลลัพธ์การวิเคราะห์ (Result View) */}
          {selectedImage && !isScanning && analysisResult && (
            <div className="scanner-result-view">
              {/* Left Column: Image Snapshot */}
              <div className="scanner-result-image-col">
                <div className="result-image-box">
                  <img src={selectedImage} alt={analysisResult.fabricType} />
                  <div className="result-badge-verified">
                    <CheckCircle2 size={13} />
                    <span>วิเคราะห์สำเร็จ</span>
                  </div>
                </div>

                <button 
                  className="scanner-rescan-btn"
                  onClick={resetState}
                >
                  <RefreshCw size={14} />
                  <span>สแกนผ้าผืนใหม่</span>
                </button>
              </div>

              {/* Right Column: AI Insights */}
              <div className="scanner-result-info-col">
                {/* Header Tag & Confidence */}
                <div className="result-top-meta">
                  <span className="result-ai-tag">
                    <Sparkles size={12} />
                    <span>GEMINI 2.5 FLASH VISION</span>
                  </span>
                  <div className="result-confidence-pill">
                    <span>ความแม่นยำ {Math.round(analysisResult.confidenceScore * 100)}%</span>
                  </div>
                </div>

                {/* Fabric Type & Pattern Name */}
                <h2 className="result-fabric-title">{analysisResult.fabricType}</h2>
                <h4 className="result-pattern-name">
                  <Flame size={16} className="text-terracotta" />
                  <span>{analysisResult.patternName}</span>
                </h4>

                {/* Characteristics Badges */}
                <div className="result-features-pills">
                  <div className="feature-pill">
                    <MapPin size={13} />
                    <span>{analysisResult.originRegion}</span>
                  </div>
                  <div className="feature-pill">
                    <Layers size={13} />
                    <span>{analysisResult.material}</span>
                  </div>
                </div>

                {/* Visual Description */}
                <div className="result-section-box">
                  <div className="section-title">
                    <Info size={14} />
                    <h5>เอกลักษณ์การทอที่ตรวจพบ:</h5>
                  </div>
                  <p>{analysisResult.visualFeatures}</p>
                </div>

                {/* Cultural Story */}
                <div className="result-section-box auspicious">
                  <div className="section-title">
                    <Sparkles size={14} />
                    <h5>คุณค่าและความหมายมงคล:</h5>
                  </div>
                  <p>{analysisResult.culturalMeaning}</p>
                </div>

                {/* Action Buttons */}
                <div className="result-actions-row">
                  <button
                    className="result-btn-market"
                    onClick={() => {
                      onFindInMarket(
                        analysisResult.matchingCategoryKey || '',
                        analysisResult.fabricType
                      );
                      onClose();
                    }}
                    id="btn-result-find-market"
                  >
                    <Search size={16} />
                    <span>ค้นหาผ้าลายนี้ในตลาดกลาง</span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    className="result-btn-chat"
                    onClick={() => {
                      onAskChatBot(
                        `ช่วยอธิบายประวัติและความหมายมงคลของ "${analysisResult.fabricType} ${analysisResult.patternName}" เพิ่มเติมหน่อยครับ`
                      );
                      onClose();
                    }}
                    id="btn-result-ask-chatbot"
                  >
                    <MessageCircle size={16} />
                    <span>สอบถาม SanThai ChatBot</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
