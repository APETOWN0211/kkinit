/**
 * app/types/cms.ts
 *
 * Type definitions for the Content CMS schema.
 * Mirrors `docs/supabase-cms.sql` exactly.
 *
 * - Use `SupabaseDatabase` for `createClient<Database>(...)`.
 * - Row types are what `SELECT` returns.
 * - Insert/Update types are what `INSERT/UPDATE` expects.
 */

export type ChipVariant = 'lime' | 'orange' | 'gray' | 'teal'

/* ============================================================
 * Row types (what SELECT returns)
 * ============================================================ */
export interface ProfileRow {
  id: string
  username: string
  display_name: string
  avatar_path: string | null
  bio: string | null
  created_at: string
}

export interface PostRow {
  id: string
  author_id: string
  content: string
  like_count: number
  comment_count: number
  repost_count: number
  is_following: boolean
  location_name: string | null
  restaurant_name: string | null
  created_at: string
  updated_at: string
}

export interface PostImageRow {
  id: string
  post_id: string
  image_path: string
  sort_order: number
  created_at: string
}

export interface PostTagRow {
  id: string
  post_id: string
  label: string
  variant: ChipVariant
  sort_order: number
}

export interface AdminUserRow {
  user_id: string
  created_at: string
}

/* ============================================================
 * Insert/Update types
 * ============================================================ */
export type ProfileInsert = Partial<ProfileRow> & {
  username: string
  display_name: string
}
export type ProfileUpdate = Partial<ProfileRow>

export type PostInsert = Omit<PostRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
}
export type PostUpdate = Partial<PostInsert>

export type PostImageInsert = Omit<PostImageRow, 'id' | 'created_at'>
export type PostTagInsert = Omit<PostTagRow, 'id'>

/* ============================================================
 * Aggregated / "with relations" types (Home feed)
 * ============================================================ */
export interface PostWithRelations {
  post: PostRow
  author: ProfileRow
  images: PostImageRow[]
  tags: PostTagRow[]
}

/* ============================================================
 * Database (for createClient<Database>)
 * ============================================================ */
type Insert<T, K extends keyof T = never> = Partial<T> & Pick<T, K>
type Update<T> = Partial<T>

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Insert<ProfileRow, 'username' | 'display_name'>
        Update: Update<ProfileRow>
      }
      posts: {
        Row: PostRow
        Insert: Insert<
          PostRow,
          'author_id' | 'content' | 'like_count' | 'comment_count' | 'repost_count' | 'is_following'
        >
        Update: Update<PostRow>
      }
      post_images: {
        Row: PostImageRow
        Insert: Insert<PostImageRow, 'post_id' | 'image_path'>
        Update: Update<PostImageRow>
      }
      post_tags: {
        Row: PostTagRow
        Insert: Insert<PostTagRow, 'post_id' | 'label' | 'variant'>
        Update: Update<PostTagRow>
      }
      admin_users: {
        Row: AdminUserRow
        Insert: Insert<AdminUserRow, 'user_id'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
