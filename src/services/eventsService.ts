import { supabase } from '../lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'conference' | 'workshop' | 'networking' | 'exhibition';
  start_time: string;
  end_time: string;
  location: string | null;
  pavilion_id: string | null;
  organizer_id: string | null;
  capacity: number | null;
  registered: number;
  is_featured: boolean;
  image_url: string | null;
  registration_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export class EventsService {
  static async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    return data || [];
  }

  static async getUpcomingEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }

    return data || [];
  }

  static async getPastEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_date', new Date().toISOString())
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeaturedEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }

    return data || [];
  }

  static async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  }
}