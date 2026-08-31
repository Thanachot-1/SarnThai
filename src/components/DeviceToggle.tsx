import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface DeviceToggleProps {
  isMobileFrame: boolean;
  onToggle: (mobileFrame: boolean) => void;
}

export const DeviceToggle: React.FC<DeviceToggleProps> = ({
  isMobileFrame,
  onToggle,
}) => {
  return (
    <div className="device-toggle-toolbar">
      <span style={{ fontSize: '11.5px', opacity: 0.85 }}>โหมดแสดงผล:</span>
      <button
        className={`device-toggle-btn ${isMobileFrame ? 'active' : ''}`}
        onClick={() => onToggle(true)}
        title="มุมมองหน้าจอมือถือ"
      >
        <Smartphone size={13} />
        <span>มือถือ (Mobile)</span>
      </button>
      <button
        className={`device-toggle-btn ${!isMobileFrame ? 'active' : ''}`}
        onClick={() => onToggle(false)}
        title="มุมมองเต็มหน้าจอ"
      >
        <Monitor size={13} />
        <span>เต็มจอ (Full)</span>
      </button>
    </div>
  );
};
