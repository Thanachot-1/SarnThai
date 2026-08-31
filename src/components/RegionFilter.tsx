import React from 'react';
import { Region, Category, FilterState } from '../types';
import { SlidersHorizontal } from 'lucide-react';

interface RegionFilterProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  availableCount: number;
}

const REGIONS: Region[] = ['ทั้งหมด', 'อีสาน', 'เหนือ', 'ใต้', 'กลาง'];

const CATEGORIES: Category[] = [
  'ทั้งหมด',
  'ผ้าไหมมัดหมี่',
  'ผ้าคราม',
  'ผ้ายกดอก',
  'ผ้าตีนจก',
  'ผ้าแพรวา',
  'ผ้าบาติก',
  'ผ้าฝ้ายทอมือ'
];

export const RegionFilter: React.FC<RegionFilterProps> = ({
  filters,
  onFilterChange,
  availableCount,
}) => {
  return (
    <div className="filter-tabs-container">
      {/* Regions Horizontal Swipeable Pills */}
      <div className="region-pills-row no-scrollbar">
        {REGIONS.map((region) => {
          const isActive = filters.region === region;
          return (
            <button
              key={region}
              className={`region-pill ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange({ region })}
              id={`filter-region-${region}`}
            >
              {region === 'ทั้งหมด' ? '🌐 ทุกภูมิภาค' : `ภาค${region}`}
            </button>
          );
        })}
      </div>

      {/* Category Tags */}
      <div className="category-tags-row no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              className={`category-tag ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange({ category: cat })}
              id={`filter-cat-${cat}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sorting & Filter Summary Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          พบผ้าลายไทย <strong style={{ color: 'var(--primary-kram)' }}>{availableCount}</strong> ผืน
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={13} />
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            style={{
              padding: '3px 8px',
              fontSize: '11.5px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              cursor: 'pointer'
            }}
            id="sort-select"
          >
            <option value="newest">ลงขายล่าสุด</option>
            <option value="popular">ยอดนิยม/ถูกใจ</option>
            <option value="price-asc">ราคา: น้อย ➔ มาก</option>
            <option value="price-desc">ราคา: มาก ➔ น้อย</option>
          </select>
        </div>
      </div>
    </div>
  );
};
