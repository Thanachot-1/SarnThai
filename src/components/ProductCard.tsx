import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onToggleLike: (productId: string) => void;
  onClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isAdmin?: boolean;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLiked,
  onToggleLike,
  onClick,
  onAddToCart,
  isAdmin = false,
  onDeleteProduct,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(product.id);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`🛡️ [สิทธิ์ผู้ดูแลระบบ Admin]\nต้องการลบผ้า "${product.title}" (${product.patternName}) ออกจากตลาดใช่หรือไม่?`)) {
      if (onDeleteProduct) onDeleteProduct(product.id);
    }
  };

  const imageSrc = hasError || !product.images[0] ? '/images/mudmee.jpg' : product.images[0];

  return (
    <div 
      className="product-card"
      onClick={() => onClick(product)}
      id={`product-card-${product.id}`}
    >
      <div className="product-img-wrapper">
        {/* Shimmer skeleton until image loads */}
        {!isImageLoaded && (
          <div className="product-img-skeleton skeleton-shimmer" />
        )}

        <img
          src={imageSrc}
          alt={product.title}
          className="product-img"
          loading="lazy"
          style={{
            opacity: isImageLoaded ? 1 : 0,
            transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsImageLoaded(true);
          }}
        />
        
        <span className="product-province-tag">
          📍 จ.{product.province}
        </span>

        {/* Admin Quick Delete Icon Button on Card */}
        {isAdmin && onDeleteProduct && (
          <button
            className="product-admin-card-delete-btn"
            onClick={handleDeleteClick}
            title="🛡️ ลบสินค้านี้ (สิทธิ์ Admin)"
            aria-label="ลบสินค้า"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(230, 57, 70, 0.9)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.85)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Trash2 size={13} />
          </button>
        )}

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
              className="product-quick-cart-btn"
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
