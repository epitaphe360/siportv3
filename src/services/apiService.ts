import { supabase } from '../lib/supabase';

// Whitelist of allowed tables - prevents SQL injection and unauthorized access
const ALLOWED_TABLES = [
  'exhibitors',
  'products',
  'events',
  'news_articles',
  'partners',
  'mini_sites',
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];

// Safe columns to select per table - prevents exposure of sensitive data
const SAFE_COLUMNS: Record<AllowedTable, string> = {
  'exhibitors': 'id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info',
  'products': 'id, exhibitor_id, name, description, category, images, specifications, price, featured',
  'events': 'id, title, description, event_type, start_time, end_time, location, capacity, registered, category, virtual, featured, meeting_link, tags, speakers',
  'news_articles': 'id, title, content, excerpt, category, tags, image_url, published, published_at, views, author_id',
  'partners': 'id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level',
  'mini_sites': 'id, exhibitor_id, theme, custom_colors, sections, published, views, last_updated',
};

/**
 * Validates if a table name is in the allowed list
 */
function validateTable(tableName: string): asserts tableName is AllowedTable {
  if (!ALLOWED_TABLES.includes(tableName as AllowedTable)) {
    throw new Error(`Table "${tableName}" is not allowed. Access denied.`);
  }
}

/**
 * API Service with security validations
 * IMPORTANT: This service is for PUBLIC read-only access
 * For authenticated operations, use SupabaseService directly
 */
export const apiService = {
  /**
   * Get all records from an allowed table
   * Only returns safe columns to prevent data exposure
   */
  async getAll(tableName: string) {
    validateTable(tableName);
    const columns = SAFE_COLUMNS[tableName];

    const { data, error } = await supabase
      .from(tableName)
      .select(columns);

    if (error) {
      console.error(`API Service error fetching ${tableName}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Get a single record by ID from an allowed table
   * Only returns safe columns to prevent data exposure
   */
  async getById(tableName: string, id: string) {
    validateTable(tableName);
    const columns = SAFE_COLUMNS[tableName];

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID parameter');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`API Service error fetching ${tableName}/${id}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async create(_tableName: string, _newData: any) {
    throw new Error('Create operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async update(_tableName: string, _id: string, _updatedData: any) {
    throw new Error('Update operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async delete(_tableName: string, _id: string) {
    throw new Error('Delete operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },
};

