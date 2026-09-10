import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  isDataReady: boolean;
}

// Critical images to preload during splash
const PRELOAD_ASSETS = [
  '/logo.svg',
  '/images/banner.jpg',
  '/images/mudmee.jpg',
  '/images/indigo.jpg',
  '/images/lamphun.jpg',
  '/images/praewa.jpg',
  '/images/tinchok.jpg',
  '/images/batik.jpg',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, isDataReady }) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState('กำลังเชื่อมต่อศูนย์รวมผ้าทอมือ...');

  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;

    // Step 1: Preload core image assets in background
    const totalAssets = PRELOAD_ASSETS.length;
    PRELOAD_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        if (!isMounted) return;
        loadedCount++;
        const percent = Math.min(85, Math.floor((loadedCount / totalAssets) * 70) + 20);
        setProgress((prev) => Math.max(prev, percent));
      };
    });

    // Step 2: Progress step timer for visual smoothness
    const timer1 = setTimeout(() => {
      if (isMounted) {
        setProgress((p) => Math.max(p, 45));
        setStatusText('กำลังจัดเตรียมลายผ้ามงคลและภูมิปัญญา...');
      }
    }, 350);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        setProgress((p) => Math.max(p, 75));
        setStatusText('เกือบเสร็จแล้ว...');
      }
    }, 650);

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // When data is ready (and minimum duration passed), trigger fade out
  useEffect(() => {
    if (isDataReady) {
      setProgress(100);
      setStatusText('พร้อมเปิดประตูสู่ตลาดผ้าไทย');

      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 300);

      const removeTimer = setTimeout(() => {
        onFinish();
      }, 750); // After fade transition completes

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isDataReady, onFinish]);

  return (
    <div
      className={`splash-screen-container ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-label="กำลังโหลดแอปพลิเคชัน สานไทย"
    >
      <div className="splash-ambient-circle splash-ambient-1" />
      <div className="splash-ambient-circle splash-ambient-2" />

      <div className="splash-content">
        {/* Brand Logo with Glow */}
        <div className="splash-logo-wrapper">
          <div className="splash-logo-glow" />
          <img
            src="/logo.svg"
            alt="สานไทย SanThai"
            className="splash-logo-image"
          />
        </div>

        {/* Brand Title */}
        <div className="splash-text-block">
          <h1 className="splash-title">
            สานไทย
            <span className="splash-subtitle-badge">
              <Sparkles size={11} /> SANTHAI
            </span>
          </h1>
          <p className="splash-tagline">
            ตลาดกลางผ้าลายไทย & มรดกผ้าทอมือส่งตรงจากช่างทอ
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="splash-progress-wrapper">
          <div className="splash-progress-track">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="splash-status-text">{statusText}</span>
        </div>
      </div>
    </div>
  );
};
