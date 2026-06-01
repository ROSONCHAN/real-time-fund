'use client';

// Supabase 配置（可选功能，不配置也不影响本地使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

// 延迟加载 Supabase（只在客户端且配置有效时）
let _client = null;

function getClient() {
  if (_client !== null) return _client;
  if (!isConfigured) {
    _client = undefined;
    return undefined;
  }
  try {
    if (typeof window === 'undefined') {
      _client = undefined;
      return undefined;
    }
    // eslint-disable-next-line global-require
    const { createClient } = require('@supabase/supabase-js');
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (e) {
    console.warn('Supabase client creation failed:', e.message);
    _client = undefined;
  }
  return _client;
}

function noop() {
  return Promise.resolve({ data: null, error: null });
}

const noOpClient = {
  auth: {
    getUser: noop,
    getSession: noop,
    signInWithPassword: noop,
    signUp: noop,
    signOut: noop,
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: () => ({
    select: () => ({ eq: noop, single: noop }),
    insert: noop,
    upsert: noop,
    update: () => ({ eq: noop }),
    delete: () => ({ eq: noop }),
  }),
};

export const supabase = isConfigured
  ? getClient() || noOpClient
  : noOpClient;

export const TABLES = { USER_DATA: 'user_data' };

export const DATA_KEYS = {
  FUNDS: 'funds',
  POSITIONS: 'positions',
  FAVORITES: 'favorites',
  GROUPS: 'groups',
  COLLAPSED_CODES: 'collapsedCodes',
  REFRESH_MS: 'refreshMs',
  VIEW_MODE: 'viewMode',
};
