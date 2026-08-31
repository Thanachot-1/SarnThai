import React from 'react';
import { PATTERN_GUIDES } from '../data/patternGuide';
import { PatternGuide } from '../types';
import { X, Sparkles, BookOpen, Search, ArrowRight } from 'lucide-react';

interface PatternGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatternSearch: (patternName: string) => void;
}

export const PatternGuideModal: React.FC<PatternGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectPatternSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <span className="badge-tag badge-gold" style={{ marginBottom: '2px' }}>
              ภูมิปัญญามรดกไทย
            </span>
            <h3 style={{ fontSize: '16px' }}>
              คู่มือลายผ้าไทย & ความหมายมงคล
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            เรียนรู้เรื่องราว ความหมายมงคล และโอกาสที่เหมาะสมในการสวมใส่ลวดลายผ้าไทยโบราณและร่วมสมัย
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {PATTERN_GUIDES.map((guide: PatternGuide) => (
              <div
                key={guide.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  boxShadow: 'var(--shadow-xs)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Colored Left Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: guide.symbolColor
                  }}
                />

                <div style={{ paddingLeft: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {guide.name}
                    </h4>
                    <span className="badge-tag badge-kram" style={{ fontSize: '10.5px' }}>
                      {guide.origin.split('(')[0]}
                    </span>
                  </div>

                  {/* Auspicious meaning */}
                  <div
                    style={{
                      background: 'var(--accent-gold-light)',
                      border: '1px solid var(--accent-gold-border)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      color: '#6A4D1A',
                      margin: '8px 0',
                      lineHeight: 1.4
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>✨ ความหมายมงคล: </span>
                    {guide.meaning}
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.45 }}>
                    {guide.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-terracotta)' }}>👗 โอกาสที่แนะนำ:</span>
                    <span>{guide.recommendedOccasion}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectPatternSearch(guide.name.replace(/ \(.*?\)/g, ''));
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary-kram)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      gap: '6px'
                    }}
                  >
                    <Search size={14} />
                    <span>ค้นหาผ้า "{guide.name.split(' ')[0]}" ในตลาด</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
