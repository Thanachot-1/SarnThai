import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order } from '../types';

const ORDERS_STORAGE_KEY = 'sarnthai_orders_db';

export const orderService = {
  // Create an order
  async createOrder(order: Order): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('orders').insert([
          {
            id: order.id,
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            customer_address: order.customerAddress,
            customer_line_id: order.customerLineId,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus,
            subtotal: order.subtotal,
            shipping_fee: order.shippingFee,
            discount: order.discount,
            total_amount: order.totalAmount,
            items: order.items,
            status: order.status,
            created_at: order.createdAt,
          },
        ]);
        if (error) {
          console.warn('Error saving order to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Failed to insert order to Supabase:', err);
      }
    }

    // Save to local storage
    const current = await this.getOrders();
    const updated = [order, ...current];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return order;
  },

  // Fetch orders
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerAddress: row.customer_address,
            customerLineId: row.customer_line_id,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            subtotal: Number(row.subtotal),
            shippingFee: Number(row.shipping_fee),
            discount: Number(row.discount),
            totalAmount: Number(row.total_amount),
            items: row.items,
            status: row.status,
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch orders from Supabase:', err);
      }
    }

    const local = localStorage.getItem(ORDERS_STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  },
};
