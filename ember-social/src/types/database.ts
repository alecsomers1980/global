export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            workspaces: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    logo_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    logo_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    logo_url?: string | null
                    created_at?: string
                }
            }
            client_intelligence: {
                Row: {
                    id: string
                    workspace_id: string
                    industry: string | null
                    target_audience: string | null
                    brand_voice: string | null
                    goals: string | null
                    current_month_focus: string | null
                    key_messages: string[] | null
                    do_not_post: string[] | null
                    learned_preferences: Json | null
                    last_updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    industry?: string | null
                    target_audience?: string | null
                    brand_voice?: string | null
                    goals?: string | null
                    current_month_focus?: string | null
                    key_messages?: string[] | null
                    do_not_post?: string[] | null
                    learned_preferences?: Json | null
                    last_updated_at?: string
                }
                Update: {
                    industry?: string | null
                    target_audience?: string | null
                    brand_voice?: string | null
                    goals?: string | null
                    current_month_focus?: string | null
                    key_messages?: string[] | null
                    do_not_post?: string[] | null
                    learned_preferences?: Json | null
                    last_updated_at?: string
                }
            }
            client_intel_notes: {
                Row: {
                    id: string
                    workspace_id: string
                    author: 'agency' | 'client'
                    note: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    author: 'agency' | 'client'
                    note: string
                    created_at?: string
                }
                Update: {
                    note?: string
                }
            }
            social_accounts: {
                Row: {
                    id: string
                    workspace_id: string
                    platform: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
                    access_token: string
                    refresh_token: string | null
                    token_expires_at: string | null
                    account_name: string
                    account_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    platform: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
                    access_token: string
                    refresh_token?: string | null
                    token_expires_at?: string | null
                    account_name: string
                    account_id: string
                    created_at?: string
                }
                Update: {
                    access_token?: string
                    refresh_token?: string | null
                    token_expires_at?: string | null
                    account_name?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    workspace_id: string
                    content: string
                    media_urls: string[] | null
                    platforms: string[]
                    scheduled_at: string | null
                    status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed'
                    approval_token: string | null
                    qstash_message_id: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    content: string
                    media_urls?: string[] | null
                    platforms: string[]
                    scheduled_at?: string | null
                    status?: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed'
                    approval_token?: string | null
                    qstash_message_id?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    content?: string
                    media_urls?: string[] | null
                    platforms?: string[]
                    scheduled_at?: string | null
                    status?: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed'
                    approval_token?: string | null
                    qstash_message_id?: string | null
                }
            }
            post_results: {
                Row: {
                    id: string
                    post_id: string
                    platform: string
                    platform_post_id: string | null
                    impressions: number | null
                    reach: number | null
                    likes: number | null
                    comments: number | null
                    shares: number | null
                    saved: number | null
                    fetched_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    platform: string
                    platform_post_id?: string | null
                    impressions?: number | null
                    reach?: number | null
                    likes?: number | null
                    comments?: number | null
                    shares?: number | null
                    saved?: number | null
                    fetched_at?: string
                }
                Update: {
                    impressions?: number | null
                    reach?: number | null
                    likes?: number | null
                    comments?: number | null
                    shares?: number | null
                    saved?: number | null
                }
            }
            media: {
                Row: {
                    id: string
                    workspace_id: string
                    file_url: string
                    file_type: string
                    tags: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    file_url: string
                    file_type: string
                    tags?: string[] | null
                    created_at?: string
                }
                Update: {
                    tags?: string[] | null
                }
            }
            brand_kits: {
                Row: {
                    id: string
                    workspace_id: string
                    logo_url: string | null
                    primary_color: string
                    secondary_color: string
                    accent_color: string
                    font_preference: string
                    watermark_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    logo_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    font_preference?: string
                    watermark_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    logo_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    font_preference?: string
                    watermark_url?: string | null
                    updated_at?: string
                }
            }
            workspace_api_keys: {
                Row: {
                    id: string
                    workspace_id: string
                    key_hash: string
                    label: string
                    last_used_at: string | null
                    created_at: string
                    revoked_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    key_hash: string
                    label: string
                    last_used_at?: string | null
                    created_at?: string
                    revoked_at?: string | null
                }
                Update: {
                    last_used_at?: string | null
                    revoked_at?: string | null
                }
            }
        }
    }
}
