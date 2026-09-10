-- ==============================================================================
-- SANTHAI MARKETPLACE - SUPABASE DATABASE SCHEMA
-- ตลาดกลางผ้าลายไทย & ผ้าทอมือ (SanThai Database)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: products (ตารางรายการผ้าลายไทย)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT 'prod_' || substr(md5(random()::text), 1, 10),
  title TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  price_unit TEXT NOT NULL DEFAULT 'ผืน',
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  province TEXT NOT NULL,
  material TEXT NOT NULL,
  width_cm INTEGER DEFAULT 100,
  length_cm INTEGER DEFAULT 200,
  images TEXT[] NOT NULL DEFAULT '{}',
  story TEXT,
  meaning TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'sold'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  
  -- Seller Details embedded
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_shop TEXT NOT NULL,
  seller_avatar TEXT,
  seller_province TEXT NOT NULL,
  seller_district TEXT,
  seller_phone TEXT NOT NULL,
  seller_line_id TEXT NOT NULL,
  seller_verified BOOLEAN DEFAULT true,
  seller_rating NUMERIC DEFAULT 5.0,
  seller_review_count INTEGER DEFAULT 1,
  seller_response_rate TEXT DEFAULT 'ตอบกลับเร็วมาก',
  seller_badge_text TEXT
);

-- 3. CREATE TABLE: conversations (ตารางห้องสนทนาแยกตามคู่สนทนาและสินค้า)
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  product_pattern TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_shop_name TEXT NOT NULL,
  seller_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE: messages (ตารางข้อความแชทจริงระหว่างผู้ใช้งาน)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT 'msg_' || substr(md5(random()::text), 1, 10),
  conversation_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE: likes (ตารางบันทึกการกดใจผืนผ้าของผู้ใช้งานแต่ละคน)
CREATE TABLE IF NOT EXISTS public.likes (
  id TEXT PRIMARY KEY DEFAULT 'like_' || substr(md5(random()::text), 1, 10),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 6. CREATE TABLE: orders (ตารางคำสั่งซื้อจากระบบตะกร้าสินค้า)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT 'ord_' || substr(md5(random()::text), 1, 10),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_line_id TEXT,
  payment_method TEXT NOT NULL, -- 'promptpay', 'cod', 'transfer'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'verified'
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  items JSONB NOT NULL, -- Array of ordered items
  status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'shipped', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. PUBLIC ACCESS POLICIES (Allow Read/Write for Marketplace)
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert access for products" ON public.products;
CREATE POLICY "Public insert access for products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access for products" ON public.products;
CREATE POLICY "Public update access for products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access for products" ON public.products;
CREATE POLICY "Public delete access for products" ON public.products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read/write for conversations" ON public.conversations;
CREATE POLICY "Public read/write for conversations" ON public.conversations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read/write for messages" ON public.messages;
CREATE POLICY "Public read/write for messages" ON public.messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read/write for likes" ON public.likes;
CREATE POLICY "Public read/write for likes" ON public.likes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read/write for orders" ON public.orders;
CREATE POLICY "Public read/write for orders" ON public.orders FOR ALL USING (true);

-- 9. ENABLE REALTIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
