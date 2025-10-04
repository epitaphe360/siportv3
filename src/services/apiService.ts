import { supabase } from '../lib/supabase';

export const apiService = {
  async getAll(tableName: string) {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data;
  },

  async getById(tableName: string, id: string) {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(tableName: string, newData: any) {
    const { data, error } = await supabase.from(tableName).insert([newData]);
    if (error) throw error;
    return data;
  },

  async update(tableName: string, id: string, updatedData: any) {
    const { data, error } = await supabase.from(tableName).update(updatedData).eq('id', id);
    if (error) throw error;
    return data;
  },

  async delete(tableName: string, id: string) {
    const { data, error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return data;
  },
};

