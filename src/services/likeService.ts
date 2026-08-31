import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_LIKES_PREFIX = 'sarnthai_likes';

export const likeService = {
  // Fetch liked product IDs for a logged-in user
  async fetchUserLikes(userId?: string): Promise<string[]> {
    if (!userId) {
      return [];
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('product_id')
          .eq('user_id', userId);

        if (!error && data) {
          const ids = data.map((d: any) => d.product_id);
          localStorage.setItem(`${LOCAL_LIKES_PREFIX}_${userId}`, JSON.stringify(ids));
          return ids;
        }
      } catch (err) {
        console.warn('Error fetching likes from Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`${LOCAL_LIKES_PREFIX}_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  // Toggle Like on a product (Requires authenticated user)
  async toggleLike(productId: string, userId: string): Promise<{ liked: boolean; newLikedIds: string[] }> {
    if (!userId) {
      return { liked: false, newLikedIds: [] };
    }

    const currentLikes = await this.fetchUserLikes(userId);
    const isAlreadyLiked = currentLikes.includes(productId);
    const newLikedIds = isAlreadyLiked
      ? currentLikes.filter((id) => id !== productId)
      : [...currentLikes, productId];

    // Save to user local cache
    localStorage.setItem(`${LOCAL_LIKES_PREFIX}_${userId}`, JSON.stringify(newLikedIds));

    // Sync to Supabase cloud database
    if (isSupabaseConfigured && supabase) {
      try {
        if (isAlreadyLiked) {
          await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        } else {
          await supabase
            .from('likes')
            .insert([{ user_id: userId, product_id: productId }]);
        }

        // Update total like count on the product in Supabase
        const { data: prod } = await supabase
          .from('products')
          .select('likes')
          .eq('id', productId)
          .single();

        if (prod) {
          const currentCount = Number(prod.likes || 0);
          const updatedCount = isAlreadyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
          await supabase
            .from('products')
            .update({ likes: updatedCount })
            .eq('id', productId);
        }
      } catch (err) {
        console.warn('Error syncing like to Supabase:', err);
      }
    }

    return { liked: !isAlreadyLiked, newLikedIds };
  },
};
