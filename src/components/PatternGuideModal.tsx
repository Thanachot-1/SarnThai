import React from 'react';
import { PATTERN_GUIDES } from '../data/patternGuide';
import { PatternGuide } from '../types';
import { X, Sparkles, BookOpen, Search, ArrowRight, Tag, Calendar } from 'lucide-react';

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
      <div className="modal-sheet pattern-guide-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '88vh' }}>
        <div className="modal-drag-handle" />

        {/* Modal Header */}
        <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-gold-light)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <span className="badge-tag badge-gold" style={{ fontSize: '10.5px', marginBottom: '2px' }}>
                <Sparkles size={10} /> ภูมิปัญญามรดกไทย
              </span>
              <h3 style={{ fontSize: '16.5px', fontWeight: 600, color: 'var(--primary-kram-dark)' }}>
                คู่มือลายผ้าไทย & ความหมายมงคล
              </h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '16px 20px 30px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            เรียนรู้ความหมายอันเป็นมงคล เทคนิคการทอ และโอกาสที่เหมาะสมในการสวมใส่ผืนผ้าแต่ละลวดลาย
          </p>

          <div className="pattern-guide-grid">
            {PATTERN_GUIDES.map((guide: PatternGuide) => {
              const cleanKeyword = guide.name.split(' (')[0];

              return (
                <div
                  key={guide.id}
                  className="pattern-guide-card"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {/* Card Title & Origin */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <h4
                        style={{
                          fontSize: '15.5px',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          fontFamily: 'var(--font-heading)',
                          lineHeight: 1.3,
                        }}
                      >
                        {guide.name}
                      </h4>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '2px', display: 'block' }}>
                        📍 {guide.origin}
                      </span>
                    </div>
                  </div>

                  {/* Auspicious Meaning Block - Thai Minimal Wisdom Callout */}
                  <div
                    style={{
                      background: 'rgba(197, 139, 56, 0.07)',
                      borderLeft: '3px solid var(--accent-gold)',
                      borderRadius: '0 8px 8px 0',
                      padding: '10px 12px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#4A3B2C',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--accent-gold)', fontSize: '11.5px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> ความหมายมงคล
                    </div>
                    {guide.meaning}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {guide.description}
                  </p>

                  {/* Metadata Chips: Occasion & Fabric Types */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                      <Calendar size={13} color="var(--accent-terracotta)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, color: 'var(--accent-terracotta)' }}>โอกาสสวมใส่:</span>
                      <span style={{ color: 'var(--text-muted)' }}>{guide.recommendedOccasion}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                      <Tag size={13} color="var(--primary-kram)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, color: 'var(--primary-kram)' }}>ผ้าที่นิยมทอ:</span>
                      <span style={{ color: 'var(--text-muted)' }}>{guide.popularFabric}</span>
                    </div>
                  </div>

                  {/* Action Button: Search this pattern */}
                  <button
                    onClick={() => {
                      onSelectPatternSearch(cleanKeyword);
                      onClose();
                    }}
                    style={{
                      marginTop: '4px',
                      width: '100%',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary-kram)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-kram-light)';
                      e.currentTarget.style.borderColor = 'var(--primary-kram)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <Search size={14} />
                    <span>เลือกดูผ้าลายนี้ในตลาด</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
