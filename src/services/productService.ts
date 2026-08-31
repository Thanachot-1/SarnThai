import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, ProductStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const LOCAL_STORAGE_KEY = 'sarnthai_products_db';

// Helper to map DB row to Product Interface
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    patternName: row.pattern_name,
    price: Number(row.price),
    priceUnit: row.price_unit,
    category: row.category,
    region: row.region,
    province: row.province,
    material: row.material,
    dimensions: {
      widthCm: row.width_cm || 100,
      lengthCm: row.length_cm || 200,
    },
    images: row.images || [],
    story: row.story || '',
    meaning: row.meaning || '',
    status: row.status as ProductStatus,
    createdAt: row.created_at,
    likes: row.likes || 0,
    views: row.views || 0,
    isFeatured: row.is_featured,
    tags: row.tags || [],
    seller: {
      id: row.seller_id,
      name: row.seller_name,
      shopName: row.seller_shop,
      avatar: row.seller_avatar || '',
      province: row.seller_province,
      district: row.seller_district || '',
      phone: row.seller_phone,
      lineId: row.seller_line_id,
      verified: row.seller_verified ?? true,
      rating: Number(row.seller_rating || 5.0),
      reviewCount: row.seller_review_count || 1,
      responseRate: row.seller_response_rate || 'ตอบกลับเร็วมาก',
      badgeText: row.seller_badge_text,
    },
  };
}

// Helper to map Product Interface to DB row
function mapProductToRow(p: Product): any {
  return {
    id: p.id,
    title: p.title,
    pattern_name: p.patternName,
    price: p.price,
    price_unit: p.priceUnit,
    category: p.category,
    region: p.region,
    province: p.province,
    material: p.material,
    width_cm: p.dimensions.widthCm,
    length_cm: p.dimensions.lengthCm,
    images: p.images,
    story: p.story,
    meaning: p.meaning,
    status: p.status,
    created_at: p.createdAt,
    likes: p.likes,
    views: p.views,
    is_featured: p.isFeatured || false,
    tags: p.tags,
    seller_id: p.seller.id,
    seller_name: p.seller.name,
    seller_shop: p.seller.shopName,
    seller_avatar: p.seller.avatar,
    seller_province: p.seller.province,
    seller_district: p.seller.district,
    seller_phone: p.seller.phone,
    seller_line_id: p.seller.lineId,
    seller_verified: p.seller.verified,
    seller_rating: p.seller.rating,
    seller_review_count: p.seller.reviewCount,
    seller_response_rate: p.seller.responseRate,
    seller_badge_text: p.seller.badgeText,
  };
}

export const productService = {
  // Fetch all products from Supabase
  async fetchProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, fallback to local storage:', error.message);
        } else if (data && data.length > 0) {
          return data.map(mapRowToProduct);
        }
      } catch (err) {
        console.warn('Network error reaching Supabase:', err);
      }
    }

    // Local Storage Database Fallback
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // pass
      }
    }
    // Initialize with seed data if first time
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  // Create / Post new fabric product
  async createProduct(product: Product): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      try {
        const row = mapProductToRow(product);
        const { error } = await supabase.from('products').insert([row]);
        if (error) {
          console.warn('Error inserting to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Network error adding product:', err);
      }
    }

    // Save to local storage cache
    const current = await this.fetchProducts();
    const updated = [product, ...current.filter((p) => p.id !== product.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return product;
  },

  // Update Status
  async updateStatus(productId: string, newStatus: ProductStatus): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .update({ status: newStatus })
          .eq('id', productId);
      } catch (err) {
        console.warn('Error updating status in Supabase:', err);
      }
    }

    const current = await this.fetchProducts();
    const updated = current.map((p) => (p.id === productId ? { ...p, status: newStatus } : p));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  // Delete Product
  async deleteProduct(productId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('Error deleting in Supabase:', err);
      }
    }

    const current = await this.fetchProducts();
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },
};
