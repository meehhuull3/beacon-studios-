import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

const mapRowResponse = (row) => {
  if (!row) return row;
  return {
    ...row,
    created_at: row.created_date || row.created_at,
    updated_at: row.updated_date || row.updated_at,
  };
};

const mapResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapRowResponse);
  }
  return mapRowResponse(data);
};

const generateHexId = () => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
};

const createEntityApi = (tableName) => {
  return {
    list: async (orderBy = '-created_at', limit = null) => {
      let query = supabase.from(tableName).select('*');
      
      if (orderBy) {
        const isDesc = orderBy.startsWith('-');
        let column = isDesc ? orderBy.substring(1) : orderBy;
        if (column === 'created_at') column = 'created_date';
        if (column === 'updated_at') column = 'updated_date';
        query = query.order(column, { ascending: !isDesc });
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return mapResponse(data) || [];
    },
    create: async (data) => {
      const payload = { ...data };
      if (!payload.id) {
        payload.id = generateHexId();
      }
      if (!payload.created_date) {
        payload.created_date = new Date().toISOString();
      }
      if (!payload.updated_date) {
        payload.updated_date = new Date().toISOString();
      }
      const { data: result, error } = await supabase.from(tableName).insert([payload]).select();
      if (error) throw error;
      return mapResponse(result?.[0]) || null;
    },
    update: async (id, data) => {
      const payload = { ...data };
      payload.updated_date = new Date().toISOString();
      const { data: result, error } = await supabase.from(tableName).update(payload).eq('id', id).select();
      if (error) throw error;
      return mapResponse(result?.[0]) || null;
    },
    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    filter: async (whereObj = {}, orderBy = '-created_at', limit = null) => {
      // Remove null/undefined values from whereObj to avoid match() issues
      const cleanWhere = Object.fromEntries(
        Object.entries(whereObj).filter(([_, v]) => v != null)
      );
      
      let query = supabase.from(tableName).select('*');
      
      if (Object.keys(cleanWhere).length > 0) {
        query = query.match(cleanWhere);
      }
      
      if (orderBy) {
        const isDesc = orderBy.startsWith('-');
        let column = isDesc ? orderBy.substring(1) : orderBy;
        if (column === 'created_at') column = 'created_date';
        if (column === 'updated_at') column = 'updated_date';
        query = query.order(column, { ascending: !isDesc });
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return mapResponse(data) || [];
    }
  };
};

export const base44 = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Fetch team member profile by email (handles migrated Base44 records)
      const { data: member, error } = await supabase
        .from('team_member')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found — not a real error
        console.warn('me() query error:', error.message);
        throw error;
      }
        
      if (member) {
        // Auto-heal user_id if it still points to old Base44 hex ID
        if (member.user_id !== user.id) {
          await supabase.from('team_member').update({ user_id: user.id }).eq('id', member.id);
          member.user_id = user.id;
        }
        return mapRowResponse(member);
      }
      
      // No team_member record — throw so AuthContext knows this is a real problem
      if (user) {
        throw new Error('No team member profile found for this user. Please contact your admin.');
      }
      return null;
    },

    loginViaEmailPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    },

    redirectToLogin: () => {
      window.location.href = '/login';
    },

    register: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },

    verifyOtp: async ({ email, otpCode }) => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return { access_token: data.session?.access_token };
    },

    resendOtp: async (email) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return true;
    },

    setToken: (_token) => {
      // No-op: Supabase manages its own session tokens
    },

    updateMe: async ({ full_name }) => {
      // Update Supabase auth metadata
      await supabase.auth.updateUser({ data: { full_name } });
      // Also update the team_member record
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('team_member').update({ full_name }).eq('email', user.email);
      }
    },

    resetPasswordRequest: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      return true;
    },

    resetPassword: async ({ newPassword }) => {
      // Supabase session is already established via PASSWORD_RECOVERY event
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    }
  },

  entities: {
    College: createEntityApi('college'),
    TeamMember: createEntityApi('team_member'),
    Student: createEntityApi('student'),
    Startup: createEntityApi('startup'),
    Event: createEntityApi('event'),
    Proposal: createEntityApi('proposal'),
    Task: createEntityApi('task'),
    Notification: createEntityApi('notification'),
    Message: createEntityApi('message'),
    Broadcast: createEntityApi('broadcast'),
    // User operations now go directly to team_member table
    User: createEntityApi('team_member'),
  }
};
