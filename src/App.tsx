import React, { useState, useEffect, useMemo } from 'react';
import { Product, FilterState, ProductStatus, CartItem, Order, UserProfile } from './types';
import { productService } from './services/productService';
import { orderService } from './services/orderService';
import { authService } from './services/authService';
import { chatService } from './services/chatService';
import { likeService } from './services/likeService';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { RegionFilter } from './components/RegionFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { ChatInbox } from './components/ChatInbox';
import { PatternGuideModal } from './components/PatternGuideModal';
import { SellerDashboard } from './components/SellerDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { ProductSkeleton } from './components/ProductSkeleton';
import { BookOpen, PlusCircle, Sparkles, Heart, Search, RefreshCw } from 'lucide-react';
import './styles/index.css';
import './styles/components.css';

export const App: React.FC = () => {
  // Auth User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Products State from Supabase Service
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Liked products (100% Dynamic, 0 hardcoded defaults)
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Shopping Cart State (Per User)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: 'ทั้งหมด',
    category: 'ทั้งหมด',
    minPrice: null,
    maxPrice: null,
    material: '',
    sortBy: 'newest',
  });

  // View & Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);

  // Modals & Drawers State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPatternGuideOpen, setIsPatternGuideOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastNotification(text);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // 1. Initial Data & Auth Fetch
  const loadData = async () => {
    setLoading(true);
    try {
      const [items, user] = await Promise.all([
        productService.fetchProducts(),
        authService.getCurrentUser(),
      ]);
      setProducts(items);
      setCurrentUser(user);
      if (user) {
        const likes = await likeService.fetchUserLikes(user.id);
        setLikedIds(likes);
        const savedCart = localStorage.getItem(`sarnthai_cart_${user.id}`);
        if (savedCart) setCartItems(JSON.parse(savedCart));
      } else {
        setLikedIds([]);
        setCartItems([]);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync likes when user logs in or out
  useEffect(() => {
    likeService.fetchUserLikes(currentUser?.id).then(setLikedIds);
  }, [currentUser]);

  // Persist Cart per logged-in user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`sarnthai_cart_${currentUser.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  // Auth Handlers
  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    const userLikes = await likeService.fetchUserLikes(user.id);
    setLikedIds(userLikes);
    const savedCart = localStorage.getItem(`sarnthai_cart_${user.id}`);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    showToast(`ยินดีต้อนรับคุณ ${user.name}`);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setLikedIds([]);
    setCartItems([]);
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Cart operations (Require Authentication)
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มผ้าลงในตะกร้าสินค้า 🛍️');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selected: true }];
    });
    showToast(`เพิ่ม "${product.patternName}" ลงตะกร้าแล้ว`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product) => {
    if (!currentUser) {
      setIsDetailOpen(false);
      setIsAuthOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งซื้อผ้า 🛍️');
      return;
    }

    handleAddToCart(product, 1);
    setIsDetailOpen(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = async (order: Order) => {
    await orderService.createOrder(order);
    setCartItems([]);
    showToast(`สั่งซื้อคำสั่งซื้อ ${order.id} เรียบร้อยแล้ว`);
  };

  // 100% Dynamic Toggle Likes connected to Supabase Database (Require Authentication)
  const handleToggleLike = async (productId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนกดถูกใจผืนผ้า ❤️');
      return;
    }

    const { liked, newLikedIds } = await likeService.toggleLike(productId, currentUser.id);
    setLikedIds(newLikedIds);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, likes: liked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 0) - 1) }
          : p
      )
    );
    showToast(liked ? 'บันทึกผืนผ้าในรายการโปรดแล้ว ❤️' : 'ยกเลิกการบันทึกรายการโปรด');
  };

  // Add New Product from Seller (Saves to Supabase Database)
  const handleAddProduct = async (newProduct: Product) => {
    await productService.createProduct(newProduct);
    setProducts((prev) => [newProduct, ...prev]);
    setActiveTab('explore');
    setSelectedProduct(newProduct);
    setIsDetailOpen(true);
    showToast(`โพสต์ผ้าลาย "${newProduct.patternName}" สำเร็จแล้ว`);
  };

  // Update Product Status in Supabase
  const handleUpdateProductStatus = async (productId: string, newStatus: ProductStatus) => {
    await productService.updateStatus(productId, newStatus);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );
    showToast('อัปเดตสถานะผืนผ้าเรียบร้อยแล้ว');
  };

  // Delete Product in Supabase
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('คุณต้องการลบรายการผืนผ้านี้ใช่หรือไม่?')) {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('ลบรายการผืนผ้าแล้ว');
    }
  };

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'create') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('กรุณาเข้าสู่ระบบก่อนลงขายผืนผ้า 🧵');
        return;
      }
      setIsCreateOpen(true);
      return;
    }
    if (tab === 'seller') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('กรุณาเข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ 🏪');
        return;
      }
    }
    if (tab === 'chat') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('กรุณาเข้าสู่ระบบเพื่อดูข้อความแชท 💬');
        return;
      }
      setSelectedConversationId(null);
    }
    if (tab === 'wisdom') {
      setIsPatternGuideOpen(true);
      return;
    }
    setShowOnlyLiked(false);
    setActiveTab(tab);
  };

  // Open Real Chat Room from Product Detail Modal
  const handleOpenChatFromDetail = async (product: Product) => {
    if (!currentUser) {
      setIsDetailOpen(false);
      setIsAuthOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนเริ่มการสนทนา');
      return;
    }

    if (currentUser.id === product.seller.id) {
      showToast('นี่คือผืนผ้าในร้านของคุณเอง');
      return;
    }

    // Create or find conversation thread
    const conv = await chatService.getOrCreateConversation(product, currentUser);
    setSelectedConversationId(conv.id);
    setIsDetailOpen(false);
    setActiveTab('chat');
  };

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Show liked only
      if (showOnlyLiked && !likedIds.includes(item.id)) return false;

      // Region Filter
      if (filters.region !== 'ทั้งหมด' && item.region !== filters.region) {
        return false;
      }

      // Category Filter
      if (filters.category !== 'ทั้งหมด' && item.category !== filters.category) {
        return false;
      }

      // Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchPattern = item.patternName.toLowerCase().includes(query);
        const matchProvince = item.province.toLowerCase().includes(query);
        const matchMaterial = item.material.toLowerCase().includes(query);
        const matchShop = item.seller.shopName.toLowerCase().includes(query);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchTitle && !matchPattern && !matchProvince && !matchMaterial && !matchShop && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'popular') return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, filters, likedIds, showOnlyLiked]);

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="app-viewport-wrapper">
      {/* App Splash Screen with Asset Preloader */}
      {showSplash && (
        <SplashScreen
          isDataReady={!loading}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Main Mobile App Container */}
      <main className="app-container" id="sarnthai-app">
        {/* Sticky Header with Auth Profile Trigger */}
        <Header
          searchTerm={filters.search}
          onSearchChange={(search) => {
            setFilters((prev) => ({ ...prev, search }));
            setShowOnlyLiked(false);
            if (activeTab !== 'explore') setActiveTab('explore');
          }}
          likedCount={likedIds.length}
          onOpenLiked={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              showToast('กรุณาเข้าสู่ระบบเพื่อดูรายการโปรดของคุณ ❤️');
              return;
            }
            setShowOnlyLiked(!showOnlyLiked);
            setActiveTab('explore');
          }}
          onLogoClick={() => {
            setFilters({
              search: '',
              region: 'ทั้งหมด',
              category: 'ทั้งหมด',
              minPrice: null,
              maxPrice: null,
              material: '',
              sortBy: 'newest',
            });
            setShowOnlyLiked(false);
            setActiveTab('explore');
          }}
          cartCount={totalCartCount}
          onOpenCart={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              showToast('กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ 🛍️');
              return;
            }
            setIsCartOpen(true);
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* VIEW 1: EXPLORE MARKETPLACE */}
        {activeTab === 'explore' && (
          <div>
            {/* If Liked Banner is active */}
            {showOnlyLiked && (
              <div
                style={{
                  background: 'var(--accent-terracotta-light)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: 'var(--accent-terracotta)',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={16} fill="var(--accent-terracotta)" />
                  <span>ผืนผ้าที่คุณบันทึกถูกใจไว้ ({likedIds.length})</span>
                </div>
                <button
                  onClick={() => setShowOnlyLiked(false)}
                  style={{ fontSize: '11.5px', textDecoration: 'underline', color: 'var(--text-main)' }}
                >
                  ดูทั้งหมด
                </button>
              </div>
            )}

            {/* Story Banner for Explore Mode */}
            {!showOnlyLiked && !filters.search && (
              <>
                <div className="hero-story-card">
                  {!isBannerLoaded && (
                    <div className="skeleton-shimmer" style={{ position: 'absolute', inset: 0 }} />
                  )}
                  <img
                    src="/images/banner.jpg"
                    alt="ช่างทอผ้าไทย สานไทย"
                    className="hero-banner-img"
                    style={{
                      opacity: isBannerLoaded ? 0.85 : 0,
                      transition: 'opacity 0.4s ease'
                    }}
                    onLoad={() => setIsBannerLoaded(true)}
                  />
                  <div className="hero-gradient-overlay" />
                  <div className="hero-story-content">
                    <span className="hero-badge">
                      <Sparkles size={12} /> สานต่อลมหายใจผ้าทอมือ
                    </span>
                    <h2>ส่งตรงจากกี่ทอผ้าสู่มือคุณ</h2>
                    <p>สนับสนุนช่างทอพื้นบ้าน ชุมชนหัตถกรรมไทยแท้ 100%</p>
                  </div>
                </div>

                {/* Quick Action Cards: Pattern Guide & Seller Shortcut */}
                <div className="quick-action-strip">
                  <div
                    className="quick-action-card guide"
                    onClick={() => setIsPatternGuideOpen(true)}
                  >
                    <div className="quick-action-icon">
                      <BookOpen size={18} />
                    </div>
                    <div className="quick-action-info">
                      <h4>คู่มือลายผ้า</h4>
                      <p>ความหมายมงคล</p>
                    </div>
                  </div>

                  <div
                    className="quick-action-card seller"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <div className="quick-action-icon">
                      <PlusCircle size={18} />
                    </div>
                    <div className="quick-action-info">
                      <h4>ช่างทอโพสต์ขาย</h4>
                      <p>ลงขายฟรี 3 ขั้นตอน</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Region & Category Filter */}
            <RegionFilter
              filters={filters}
              onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              availableCount={filteredProducts.length}
            />

            {/* Products Feed Grid (with Skeleton Shimmer State) */}
            {loading ? (
              <ProductSkeleton count={6} />
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid" style={{ marginTop: '12px' }}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isLiked={likedIds.includes(product.id)}
                    onToggleLike={handleToggleLike}
                    onClick={(p) => {
                      setSelectedProduct(p);
                      setIsDetailOpen(true);
                    }}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={44} className="empty-icon" />
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  ไม่พบผ้าที่ตรงกับเงื่อนไข
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  ลองเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่ผ้าประเภทอื่น
                </p>
                <button
                  className="btn-secondary"
                  style={{ display: 'inline-flex', padding: '8px 16px', gap: '6px', margin: '0 auto' }}
                  onClick={() => {
                    setFilters({
                      search: '',
                      region: 'ทั้งหมด',
                      category: 'ทั้งหมด',
                      minPrice: null,
                      maxPrice: null,
                      material: '',
                      sortBy: 'newest',
                    });
                    setShowOnlyLiked(false);
                  }}
                >
                  <RefreshCw size={14} />
                  <span>ล้างตัวกรองทั้งหมด</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: REAL CHAT INBOX & CONVERSATIONS */}
        {activeTab === 'chat' && (
          <ChatInbox
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            selectedConversationId={selectedConversationId}
            onCloseChatRoom={() => setSelectedConversationId(null)}
          />
        )}

        {/* VIEW 3: SELLER DASHBOARD */}
        {activeTab === 'seller' && (
          <SellerDashboard
            products={products}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onUpdateProductStatus={handleUpdateProductStatus}
            onDeleteProduct={handleDeleteProduct}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setIsDetailOpen(true);
            }}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* Bottom Mobile Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadChatCount={0}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          isLiked={selectedProduct ? likedIds.includes(selectedProduct.id) : false}
          onToggleLike={handleToggleLike}
          onOpenChat={handleOpenChatFromDetail}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onBuyNow={handleBuyNow}
        />

        {/* Create Post Wizard Modal (+ โพสต์ขายผ้า) */}
        <CreatePostModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onAddProduct={handleAddProduct}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Thai Pattern Guide Wisdom Modal */}
        <PatternGuideModal
          isOpen={isPatternGuideOpen}
          onClose={() => setIsPatternGuideOpen(false)}
          onSelectPatternSearch={(pattern) => {
            setFilters((prev) => ({ ...prev, search: pattern }));
            setActiveTab('explore');
          }}
        />

        {/* Shopping Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Checkout & PromptPay Payment Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onOrderSuccess={handleOrderSuccess}
          currentUser={currentUser}
        />

        {/* Register / Login Authentication Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Floating Toast Notification */}
        {toastNotification && (
          <div
            style={{
              position: 'fixed',
              bottom: '84px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30, 50, 79, 0.95)',
              color: 'white',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: 'var(--shadow-md)',
              zIndex: 2000,
              animation: 'fadeIn 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            ✨ {toastNotification}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
