import React from 'react';
import { Product } from '../types';
import { Heart, CheckCircle2, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onToggleLike: (productId: string) => void;
  onClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLiked,
  onToggleLike,
  onClick,
  onAddToCart,
}) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(product.id);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <div 
      className="product-card"
      onClick={() => onClick(product)}
      id={`product-card-${product.id}`}
    >
      <div className="product-img-wrapper">
        <img
          src={product.images[0] || '/images/mudmee.jpg'}
          alt={product.title}
          className="product-img"
          loading="lazy"
        />
        
        <span className="product-province-tag">
          📍 จ.{product.province}
        </span>

        <button
          className={`product-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          title={isLiked ? 'ยกเลิกถูกใจ' : 'บันทึกเป็นผืนโปรด'}
          aria-label="ถูกใจผืนผ้า"
        >
          <Heart size={15} fill={isLiked ? '#E63946' : 'none'} color={isLiked ? '#E63946' : '#6E6864'} />
        </button>
      </div>

      <div className="product-content">
        <div className="product-pattern-name">
          {product.patternName}
        </div>
        
        <h4 className="product-title" title={product.title}>
          {product.title}
        </h4>

        <div>
          <span className="product-material-pill">
            {product.material}
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price-block">
            <span className="product-price-label">ราคา</span>
            <div className="product-price-val">
              ฿{product.price.toLocaleString()}
              <span className="product-price-unit">/{product.priceUnit}</span>
            </div>
          </div>

          {/* Quick Add to Cart button */}
          {onAddToCart && (
            <button
              onClick={handleCartClick}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-kram-light)',
                color: 'var(--primary-kram)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="เพิ่มลงตะกร้า"
              aria-label="เพิ่มลงตะกร้า"
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
