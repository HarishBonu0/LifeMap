import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// ---------------------------------------------------------------------------------
// In-Memory Supabase & PostgreSQL Engine with Strict Row Level Security (RLS)
// Enforces the exact security policies defined in 02_user_scoped_tables_and_rls.sql
// Used for comprehensive local development, demo sandboxing, and automated testing.
// ---------------------------------------------------------------------------------

export interface MockAuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  created_at: string;
}

export interface MockSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: MockAuthUser;
}

export const hashPassword = (password: string): string => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  const salted = 'lifemap_sec_salt_v2:' + password;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
};

export class LocalSupabaseEngine {
  private users: Map<string, { user: MockAuthUser; passwordHash: string }> = new Map();
  private currentSession: MockSession | null = null;
  private authListeners: ((event: string, session: MockSession | null) => void)[] = [];

  // User-scoped database tables
  private tables: Record<string, Map<string, any>> = {
    profiles: new Map(),
    assessment_sessions: new Map(),
    assessment_answers: new Map(),
    game_progress: new Map(),
    chat_conversations: new Map(),
    chat_messages: new Map(),
    growth_scenarios: new Map(),
    life_goals: new Map()
  };

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUsers = localStorage.getItem('lifemap_mock_users');
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          for (const item of parsed) {
            const email = (item.email || item.user?.email || '').trim().toLowerCase();
            if (email && item.user) {
              this.users.set(email, { user: item.user, passwordHash: item.passwordHash });
            }
          }
        }
        const savedSession = localStorage.getItem('lifemap_mock_session');
        if (savedSession) {
          this.currentSession = JSON.parse(savedSession);
        }
        const savedTables = localStorage.getItem('lifemap_mock_tables');
        if (savedTables) {
          const parsed = JSON.parse(savedTables);
          for (const [tName, records] of Object.entries(parsed)) {
            if (this.tables[tName]) {
              this.tables[tName] = new Map(Object.entries(records as Record<string, any>));
            }
          }
        }
      }
    } catch {
      // Storage access may fail in private mode or test environments
    }
  }

  private persistToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const usersArr = Array.from(this.users.entries()).map(([email, record]) => ({
          email,
          user: record.user,
          passwordHash: record.passwordHash
        }));
        localStorage.setItem('lifemap_mock_users', JSON.stringify(usersArr));
        if (this.currentSession) {
          localStorage.setItem('lifemap_mock_session', JSON.stringify(this.currentSession));
        } else {
          localStorage.removeItem('lifemap_mock_session');
        }
        const tablesObj: Record<string, any> = {};
        for (const [tName, map] of Object.entries(this.tables)) {
          tablesObj[tName] = Object.fromEntries(map.entries());
        }
        localStorage.setItem('lifemap_mock_tables', JSON.stringify(tablesObj));
      }
    } catch {}
  }

  // --- Auth APIs ---
  get auth() {
    return {
      signUp: async ({ email, password, options }: { email: string; password?: string; options?: any }) => {
        const normEmail = (email || '').trim().toLowerCase();
        if (!normEmail || !password) {
          return { data: { user: null, session: null }, error: new Error('Email and password are required.') };
        }
        if (!normEmail.includes('@') || !normEmail.includes('.')) {
          return { data: { user: null, session: null }, error: new Error('Please enter a valid email address.') };
        }
        if (this.users.has(normEmail)) {
          return { data: { user: null, session: null }, error: new Error('User already registered.') };
        }
        const id = 'usr_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        const user: MockAuthUser = {
          id,
          email: normEmail,
          user_metadata: options?.data || {},
          created_at: new Date().toISOString()
        };
        const passwordHash = hashPassword(password);
        this.users.set(normEmail, { user, passwordHash });

        // Auto trigger profile insert as defined by handle_new_user() in SQL migration
        this.tables.profiles.set(id, {
          id,
          email: normEmail,
          name: options?.data?.name || normEmail.split('@')[0],
          preferred_language: options?.data?.preferred_language || 'en',
          created_at: user.created_at,
          updated_at: user.created_at
        });

        const session: MockSession = {
          access_token: 'tok_' + id,
          token_type: 'bearer',
          expires_in: 86400,
          user
        };
        this.currentSession = session;
        this.persistToStorage();
        this.notifyAuthListeners('SIGNED_IN', session);
        return { data: { user, session }, error: null };
      },

      signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
        const normEmail = (email || '').trim().toLowerCase();
        if (!normEmail || !password) {
          return { data: { user: null, session: null }, error: new Error('Email and password are required.') };
        }
        const record = this.users.get(normEmail);
        const passwordHash = hashPassword(password);
        const isMatch = record && (record.passwordHash === passwordHash || record.passwordHash === password);

        if (!record || !isMatch) {
          return { data: { user: null, session: null }, error: new Error('Invalid login credentials.') };
        }

        // Upgrade legacy hash if necessary
        if (record.passwordHash === password) {
          record.passwordHash = passwordHash;
          this.users.set(normEmail, record);
        }

        const session: MockSession = {
          access_token: 'tok_' + record.user.id,
          token_type: 'bearer',
          expires_in: 86400,
          user: record.user
        };
        this.currentSession = session;
        this.persistToStorage();
        this.notifyAuthListeners('SIGNED_IN', session);
        return { data: { user: record.user, session }, error: null };
      },

      signOut: async () => {
        this.currentSession = null;
        this.persistToStorage();
        this.notifyAuthListeners('SIGNED_OUT', null);
        return { error: null };
      },

      getSession: async () => {
        return { data: { session: this.currentSession }, error: null };
      },

      getUser: async () => {
        return { data: { user: this.currentSession?.user || null }, error: null };
      },

      onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
        this.authListeners.push(callback);
        // Initial callback invocation
        callback(this.currentSession ? 'SIGNED_IN' : 'INITIAL_SESSION', this.currentSession);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.authListeners = this.authListeners.filter(l => l !== callback);
              }
            }
          }
        };
      }
    };
  }

  private notifyAuthListeners(event: string, session: MockSession | null) {
    for (const listener of this.authListeners) {
      try {
        listener(event, session);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // --- Database Table Query Builder with Strict RLS ---
  from(tableName: string) {
    const table = this.tables[tableName];
    if (!table) {
      this.tables[tableName] = new Map();
    }
    const currentUserId = this.currentSession?.user?.id || null;
    const persist = () => this.persistToStorage();

    return new QueryBuilder(this.tables[tableName], tableName, currentUserId, persist);
  }

  // Helper for test cleanup
  clearAll() {
    this.users.clear();
    this.currentSession = null;
    for (const t of Object.values(this.tables)) {
      t.clear();
    }
    this.persistToStorage();
  }
}

// ---------------------------------------------------------------------------------
// QueryBuilder: Emulates PostgREST with strict Row Level Security (RLS) enforcement
// ---------------------------------------------------------------------------------
class QueryBuilder {
  private filters: ((row: any) => boolean)[] = [];
  private orderField?: string;
  private orderAscending: boolean = true;
  private limitCount?: number;

  constructor(
    private tableMap: Map<string, any>,
    private tableName: string,
    private currentUserId: string | null,
    private onMutate: () => void
  ) {}

  // RLS Security Check: Verify user owns the row
  private isRowAccessible(row: any): boolean {
    if (!this.currentUserId) return false; // Anon denied on user-scoped tables
    if (this.tableName === 'profiles') {
      return row.id === this.currentUserId;
    }
    return row.user_id === this.currentUserId;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single() {
    const { data, error } = await this.executeSelect();
    if (error) return { data: null, error };
    if (!data || data.length === 0) {
      return { data: null, error: new Error('JSON object requested, multiple (or no) rows returned') };
    }
    return { data: data[0], error: null };
  }

  async then(resolve: (res: { data: any; error: any }) => void) {
    const res = await this.executeSelect();
    resolve(res);
  }

  private async executeSelect() {
    // 1. Gather all rows
    const allRows = Array.from(this.tableMap.values());

    // 2. Enforce Row Level Security (RLS)
    const secureRows = allRows.filter(row => this.isRowAccessible(row));

    // 3. Apply user filters
    let filtered = secureRows.filter(row => {
      for (const filter of this.filters) {
        if (!filter(row)) return false;
      }
      return true;
    });

    // 4. Order if specified
    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      filtered.sort((a, b) => {
        if (a[field] < b[field]) return asc ? -1 : 1;
        if (a[field] > b[field]) return asc ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== undefined) {
      filtered = filtered.slice(0, this.limitCount);
    }

    // Return deep cloned rows
    return { data: JSON.parse(JSON.stringify(filtered)), error: null };
  }

  async insert(recordOrRecords: any | any[]) {
    if (!this.currentUserId) {
      return { data: null, error: new Error('RLS: User not authenticated. Operation denied.') };
    }

    const items = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
    const inserted: any[] = [];

    for (const item of items) {
      const row = { ...item };
      if (!row.id) {
        row.id = 'rec_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      }
      if (!row.created_at) {
        row.created_at = new Date().toISOString();
      }
      if (this.tableName !== 'profiles' && !row.user_id) {
        row.user_id = this.currentUserId;
      }

      // Check RLS WITH CHECK policy: user must insert as themselves
      if (!this.isRowAccessible(row)) {
        return { data: null, error: new Error('RLS: Access violation. Cannot insert record for another user.') };
      }

      this.tableMap.set(row.id, JSON.parse(JSON.stringify(row)));
      inserted.push(row);
    }

    this.onMutate();
    return { data: inserted.length === 1 ? inserted[0] : inserted, error: null };
  }

  async update(updates: any) {
    if (!this.currentUserId) {
      return { data: null, error: new Error('RLS: User not authenticated. Operation denied.') };
    }

    const { data: matchingRows } = await this.executeSelect();
    if (!matchingRows || matchingRows.length === 0) {
      return { data: [], error: null };
    }

    const updatedRows: any[] = [];
    for (const row of matchingRows) {
      // Must own the record to update
      if (!this.isRowAccessible(row)) {
        return { data: null, error: new Error('RLS: Cannot update record owned by another user.') };
      }
      const existing = this.tableMap.get(row.id);
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.tableMap.set(row.id, updated);
      updatedRows.push(updated);
    }

    this.onMutate();
    return { data: updatedRows, error: null };
  }

  async delete() {
    if (!this.currentUserId) {
      return { data: null, error: new Error('RLS: User not authenticated. Operation denied.') };
    }

    const { data: matchingRows } = await this.executeSelect();
    if (!matchingRows || matchingRows.length === 0) {
      return { data: [], error: null };
    }

    for (const row of matchingRows) {
      if (!this.isRowAccessible(row)) {
        return { data: null, error: new Error('RLS: Cannot delete record owned by another user.') };
      }
      this.tableMap.delete(row.id);
    }

    this.onMutate();
    return { data: matchingRows, error: null };
  }
}

// ---------------------------------------------------------------------------------
// Unified Supabase Client Export
// Connects to live Supabase if configured, otherwise leverages the RLS local engine.
// ---------------------------------------------------------------------------------

export const localSupabaseInstance = new LocalSupabaseEngine();

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : localSupabaseInstance;
