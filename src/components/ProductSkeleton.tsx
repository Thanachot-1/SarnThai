import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="product-grid" style={{ marginTop: '12px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className="product-card skeleton-card">
          {/* Image skeleton */}
          <div className="product-img-wrapper skeleton-shimmer" style={{ minHeight: '160px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '65px',
                height: '20px',
                borderRadius: '9999px',
                zIndex: 2,
              }}
            />
          </div>

          {/* Body Content skeleton */}
          <div className="product-content">
            {/* Pattern name shimmer */}
            <div
              className="skeleton-shimmer"
              style={{ width: '45%', height: '13px', marginBottom: '6px' }}
            />

            {/* Title shimmer (2 lines) */}
            <div
              className="skeleton-shimmer"
              style={{ width: '90%', height: '14px', marginBottom: '4px' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '65%', height: '14px', marginBottom: '10px' }}
            />

            {/* Material pill shimmer */}
            <div
              className="skeleton-shimmer"
              style={{ width: '55%', height: '18px', borderRadius: '9999px', marginBottom: '12px' }}
            />

            {/* Footer: Price & Cart Button shimmer */}
            <div className="product-footer" style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '50%' }}>
                <div
                  className="skeleton-shimmer"
                  style={{ width: '30px', height: '10px' }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ width: '70px', height: '18px' }}
                />
              </div>

              <div
                className="skeleton-shimmer"
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
