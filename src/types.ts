export type Region = 'ทั้งหมด' | 'อีสาน' | 'เหนือ' | 'ใต้' | 'กลาง';

export type Category = 
  | 'ทั้งหมด'
  | 'ผ้าไหมมัดหมี่' 
  | 'ผ้าคราม' 
  | 'ผ้ายกดอก' 
  | 'ผ้าตีนจก' 
  | 'ผ้าแพรวา' 
  | 'ผ้าบาติก' 
  | 'ผ้าฝ้ายทอมือ';

export type NavTab = 'explore' | 'swipe' | 'wisdom' | 'create' | 'chat' | 'seller';

export type ProductStatus = 'available' | 'reserved' | 'sold';

export type UserRole = 'seller' | 'buyer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  shopName?: string;
  phone: string;
  province: string;
  lineId?: string;
  avatar?: string;
  verified?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  shopName: string;
  avatar: string;
  province: string;
  district?: string;
  phone: string;
  lineId: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseRate: string;
  badgeText?: string;
}

export interface Product {
  id: string;
  title: string;
  patternName: string;
  price: number;
  priceUnit: 'ผืน' | 'เมตร' | 'หลา';
  category: Category;
  region: Region;
  province: string;
  material: string;
  dimensions: {
    widthCm: number;
    lengthCm: number;
  };
  images: string[];
  story: string;
  meaning: string;
  status: ProductStatus;
  createdAt: string;
  likes: number;
  views: number;
  seller: Seller;
  tags: string[];
  isFeatured?: boolean;
}

export interface PatternGuide {
  id: string;
  name: string;
  origin: string;
  meaning: string;
  description: string;
  recommendedOccasion: string;
  popularFabric: string;
  symbolColor: string;
}

/* Multi-user Real Chat Types */
export interface ChatMessage {
  id: string;
  conversationId: string;
  productId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: string;
  timestamp?: string;
}

export interface ChatConversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productPattern: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerShopName: string;
  sellerAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
}

export interface FilterState {
  search: string;
  region: Region;
  category: Category;
  minPrice: number | null;
  maxPrice: number | null;
  material: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

/* Online Shopping Cart Types */
export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

export type PaymentMethod = 'promptpay' | 'cod' | 'transfer';

export interface CustomerAddress {
  name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  lineId?: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLineId?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'verified';
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  items: Array<{
    productId: string;
    productTitle: string;
    patternName: string;
    price: number;
    quantity: number;
    image: string;
    sellerShop: string;
  }>;
  status: 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}
