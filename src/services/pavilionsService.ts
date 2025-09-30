import { supabase } from '../lib/supabase';

export interface PavilionProgram {
  id: string;
  pavilion_id: string;
  title: string;
  time: string;
  speaker: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Pavilion {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  programs?: PavilionProgram[];
}

export class PavillionsService {
  static async getAllPavilions(): Promise<Pavilion[]> {
    const { data, error } = await supabase
      .from('pavilions')
      .select(`
        *,
        programs:pavilion_programs(*)
      `)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching pavilions:', error);
      throw error;
    }

    return data || [];
  }

  static async getPavilionBySlug(slug: string): Promise<Pavilion | null> {
    const { data, error } = await supabase
      .from('pavilions')
      .select(`
        *,
        programs:pavilion_programs(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching pavilion:', error);
      return null;
    }

    return data;
  }

  static async getFeaturedPavilions(): Promise<Pavilion[]> {
    const { data, error } = await supabase
      .from('pavilions')
      .select(`
        *,
        programs:pavilion_programs(*)
      `)
      .eq('featured', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching featured pavilions:', error);
      throw error;
    }

    return data || [];
  }
}