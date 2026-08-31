import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChatMessage, ChatConversation, Product, UserProfile } from '../types';

const LOCAL_CONVERSATIONS_KEY = 'sarnthai_conversations_db';
const LOCAL_MESSAGES_KEY = 'sarnthai_messages_db';

export const chatService = {
  // Get or Create a real conversation between buyer and seller for a product
  async getOrCreateConversation(
    product: Product,
    buyer: UserProfile
  ): Promise<ChatConversation> {
    const convId = `conv_${product.id}_${buyer.id}_${product.seller.id}`;

    const convData: ChatConversation = {
      id: convId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '/images/mudmee.jpg',
      productPrice: product.price,
      productPattern: product.patternName,
      buyerId: buyer.id,
      buyerName: buyer.name || buyer.shopName || 'ผู้ซื้อ',
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      sellerShopName: product.seller.shopName,
      sellerAvatar: product.seller.avatar,
      lastMessage: 'เริ่มการสนทนาเกี่ยวกับผืนผ้านี้',
      lastMessageAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', convId)
          .single();

        if (data) {
          return {
            id: data.id,
            productId: data.product_id,
            productTitle: data.product_title,
            productImage: data.product_image,
            productPrice: Number(data.product_price),
            productPattern: data.product_pattern,
            buyerId: data.buyer_id,
            buyerName: data.buyer_name,
            sellerId: data.seller_id,
            sellerName: data.seller_name,
            sellerShopName: data.seller_shop_name,
            sellerAvatar: data.seller_avatar,
            lastMessage: data.last_message || '',
            lastMessageAt: data.last_message_at || data.created_at,
          };
        }

        // Insert new conversation
        await supabase.from('conversations').insert([
          {
            id: convId,
            product_id: product.id,
            product_title: product.title,
            product_image: product.images[0] || '/images/mudmee.jpg',
            product_price: product.price,
            product_pattern: product.patternName,
            buyer_id: buyer.id,
            buyer_name: buyer.name || buyer.shopName || 'ผู้ซื้อ',
            seller_id: product.seller.id,
            seller_name: product.seller.name,
            seller_shop_name: product.seller.shopName,
            seller_avatar: product.seller.avatar,
            last_message: 'เริ่มการสนทนา',
            last_message_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn('Error with Supabase conversation:', err);
      }
    }

    // Local Storage cache
    const stored = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
    const list: ChatConversation[] = stored ? JSON.parse(stored) : [];
    const exists = list.find((c) => c.id === convId);
    if (!exists) {
      const updated = [convData, ...list];
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(updated));
    }
    return convData;
  },

  // Fetch all conversations for the current user (either as buyer or seller)
  async fetchConversations(userId: string): Promise<ChatConversation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('last_message_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            productTitle: d.product_title,
            productImage: d.product_image,
            productPrice: Number(d.product_price),
            productPattern: d.product_pattern,
            buyerId: d.buyer_id,
            buyerName: d.buyer_name,
            sellerId: d.seller_id,
            sellerName: d.seller_name,
            sellerShopName: d.seller_shop_name,
            sellerAvatar: d.seller_avatar,
            lastMessage: d.last_message || '',
            lastMessageAt: d.last_message_at,
          }));
        }
      } catch (err) {
        console.warn('Error fetching conversations from Supabase:', err);
      }
    }

    const stored = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
    if (stored) {
      const list: ChatConversation[] = JSON.parse(stored);
      return list.filter((c) => c.buyerId === userId || c.sellerId === userId);
    }
    return [];
  },

  // Fetch real messages for a specific conversation
  async fetchMessages(conversationId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            conversationId: row.conversation_id,
            productId: row.product_id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            receiverId: row.receiver_id,
            text: row.text,
            createdAt: row.created_at,
            timestamp: new Date(row.created_at).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch messages from Supabase:', err);
      }
    }

    const stored = localStorage.getItem(`${LOCAL_MESSAGES_KEY}_${conversationId}`);
    return stored ? JSON.parse(stored) : [];
  },

  // Send a real message
  async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    if (isSupabaseConfigured && supabase) {
      try {
        await Promise.all([
          supabase.from('messages').insert([
            {
              id: message.id,
              conversation_id: message.conversationId,
              product_id: message.productId,
              sender_id: message.senderId,
              sender_name: message.senderName,
              receiver_id: message.receiverId,
              text: message.text,
              created_at: message.createdAt,
            },
          ]),
          supabase
            .from('conversations')
            .update({
              last_message: message.text,
              last_message_at: message.createdAt,
            })
            .eq('id', message.conversationId),
        ]);
      } catch (err) {
        console.warn('Failed to insert message to Supabase:', err);
      }
    }

    // Save to local storage
    const history = await this.fetchMessages(message.conversationId);
    const updated = [...history, message];
    localStorage.setItem(`${LOCAL_MESSAGES_KEY}_${message.conversationId}`, JSON.stringify(updated));

    // Update conversation last message in local storage
    const storedConv = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
    if (storedConv) {
      const convList: ChatConversation[] = JSON.parse(storedConv);
      const updatedConvList = convList.map((c) =>
        c.id === message.conversationId
          ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
          : c
      );
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(updatedConvList));
    }

    return message;
  },

  // Subscribe to real-time incoming messages for an active conversation
  subscribeToMessages(
    conversationId: string,
    onNewMessage: (msg: ChatMessage) => void
  ): () => void {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new;
          const msg: ChatMessage = {
            id: row.id,
            conversationId: row.conversation_id,
            productId: row.product_id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            receiverId: row.receiver_id,
            text: row.text,
            createdAt: row.created_at,
            timestamp: new Date(row.created_at).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          onNewMessage(msg);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  },
};
