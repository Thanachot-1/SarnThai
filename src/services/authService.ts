import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

const AUTH_USER_KEY = 'sarnthai_auth_user';

export const authService = {
  // Get current logged-in user
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          return {
            id: u.id,
            email: u.email || '',
            role: (meta.role as UserRole) || 'seller',
            name: meta.name || meta.shop_name || u.email?.split('@')[0] || 'สมาชิก',
            shopName: meta.shop_name || meta.name || '',
            phone: meta.phone || '',
            province: meta.province || 'ไม่ระบุ',
            lineId: meta.line_id || '',
            avatar: meta.avatar || '',
            verified: meta.verified ?? true,
          };
        }
      } catch (err) {
        console.warn('Supabase auth getSession error:', err);
      }
    }

    const local = localStorage.getItem(AUTH_USER_KEY);
    return local ? JSON.parse(local) : null;
  },

  // Register / Sign Up
  async signUp(params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    shopName?: string;
    phone: string;
    province: string;
    lineId?: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    const metadata = {
      name: params.name,
      role: params.role,
      shop_name: params.shopName || params.name,
      phone: params.phone,
      province: params.province,
      line_id: params.lineId || '',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      verified: true,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: metadata,
          },
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: params.email,
            role: params.role,
            name: params.name,
            shopName: params.shopName || params.name,
            phone: params.phone,
            province: params.province,
            lineId: params.lineId || '',
            avatar: metadata.avatar,
            verified: true,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
          return { user: profile, error: null };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' };
      }
    }

    // Local user account creation (if running without cloud database)
    const localProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      email: params.email,
      role: params.role,
      name: params.name,
      shopName: params.shopName || params.name,
      phone: params.phone,
      province: params.province,
      lineId: params.lineId || '',
      avatar: metadata.avatar,
      verified: true,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(localProfile));
    return { user: localProfile, error: null };
  },

  // Login / Sign In
  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const trimmedInput = email.trim().toLowerCase();

    // 1. Admin Pre-configured Account (admin / admin1234)
    if (
      trimmedInput === 'admin' || 
      trimmedInput === 'admin@santhai.com' || 
      trimmedInput === 'admin@admin.com'
    ) {
      if (password === 'admin1234') {
        const adminProfile: UserProfile = {
          id: 'admin_master_001',
          email: 'admin@santhai.com',
          role: 'admin',
          name: 'ผู้ดูแลระบบ (Admin)',
          shopName: 'ศูนย์ดูแลระบบ SanThai',
          phone: '089-999-9999',
          province: 'กรุงเทพมหานคร',
          lineId: 'admin_santhai',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          verified: true,
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminProfile));
        return { user: adminProfile, error: null };
      } else {
        return { user: null, error: 'รหัสผ่านแอดมินไม่ถูกต้อง' };
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            role: (meta.role as UserRole) || 'seller',
            name: meta.name || meta.shop_name || email.split('@')[0],
            shopName: meta.shop_name || meta.name || '',
            phone: meta.phone || '',
            province: meta.province || 'ไม่ระบุ',
            lineId: meta.line_id || '',
            avatar: meta.avatar || '',
            verified: meta.verified ?? true,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
          return { user: profile, error: null };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
      }
    }

    // Local verification
    const local = localStorage.getItem(AUTH_USER_KEY);
    if (local) {
      const user: UserProfile = JSON.parse(local);
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { user, error: null };
      }
    }

    return { user: null, error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกใหม่' };
  },

  // Logout / Sign Out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
