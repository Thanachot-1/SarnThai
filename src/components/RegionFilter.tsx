import React from 'react';
import { Region, Category, FilterState } from '../types';
import { SlidersHorizontal, X, RotateCcw, Search } from 'lucide-react';

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
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.region !== 'ทั้งหมด' ||
    filters.category !== 'ทั้งหมด'
  );

  const handleClearAll = () => {
    onFilterChange({
      search: '',
      region: 'ทั้งหมด',
      category: 'ทั้งหมด',
    });
  };

  return (
    <div className="filter-tabs-container">
      {/* Active Filter Tags Strip (Shows whenever search or filter is applied) */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            paddingBottom: '8px',
            marginBottom: '4px',
            borderBottom: '1px dashed var(--divider)',
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            ตัวกรองที่เลือก:
          </span>

          {/* Active Search Term Tag */}
          {filters.search && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--primary-kram-light)',
                color: 'var(--primary-kram)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <Search size={10} />
              "{filters.search}"
              <button
                onClick={() => onFilterChange({ search: '' })}
                style={{ display: 'flex', alignItems: 'center', padding: '1px', marginLeft: '2px', color: 'var(--primary-kram)' }}
                title="ล้างคำค้นหา"
                aria-label="ล้างคำค้นหา"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Active Region Tag */}
          {filters.region !== 'ทั้งหมด' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: 500,
              }}
            >
              ภาค{filters.region}
              <button
                onClick={() => onFilterChange({ region: 'ทั้งหมด' })}
                style={{ display: 'flex', alignItems: 'center', padding: '1px', marginLeft: '2px', color: 'var(--text-muted)' }}
                title="ล้างภูมิภาค"
                aria-label="ล้างภูมิภาค"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Active Category Tag */}
          {filters.category !== 'ทั้งหมด' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--accent-terracotta-light)',
                color: 'var(--accent-terracotta)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: 500,
              }}
            >
              {filters.category}
              <button
                onClick={() => onFilterChange({ category: 'ทั้งหมด' })}
                style={{ display: 'flex', alignItems: 'center', padding: '1px', marginLeft: '2px', color: 'var(--accent-terracotta)' }}
                title="ล้างหมวดหมู่"
                aria-label="ล้างหมวดหมู่"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Reset All Filters Button */}
          <button
            onClick={handleClearAll}
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              background: 'none',
              padding: '2px 6px',
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={10} />
            ล้างทั้งหมด
          </button>
        </div>
      )}

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
