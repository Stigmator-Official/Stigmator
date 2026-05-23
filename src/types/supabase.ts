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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          instagram_handle: string | null
          role: 'admin' | 'artist' | 'customer' | 'fulfillment'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          instagram_handle?: string | null
          role?: 'admin' | 'artist' | 'customer' | 'fulfillment'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          instagram_handle?: string | null
          role?: 'admin' | 'artist' | 'customer' | 'fulfillment'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      studios: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          instagram_handle: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          instagram_handle?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          instagram_handle?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artist_studio_links: {
        Row: {
          id: string
          artist_id: string
          studio_id: string
          is_primary: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          studio_id: string
          is_primary?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          studio_id?: string
          is_primary?: boolean
          joined_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          base_price: number
          sku: string | null
          images: string[] | null
          sizes: string[] | null
          colors: Json | null
          design_areas: Json | null
          specifications: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          base_price: number
          sku?: string | null
          images?: string[] | null
          sizes?: string[] | null
          colors?: Json | null
          design_areas?: Json | null
          specifications?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          base_price?: number
          sku?: string | null
          images?: string[] | null
          sizes?: string[] | null
          colors?: Json | null
          design_areas?: Json | null
          specifications?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      designs: {
        Row: {
          id: string
          artist_id: string
          studio_id: string | null
          title: string
          description: string | null
          images: string[]
          tags: string[] | null
          style_tags: string[] | null
          is_original_flash: boolean
          is_exclusive: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          studio_id?: string | null
          title: string
          description?: string | null
          images: string[]
          tags?: string[] | null
          style_tags?: string[] | null
          is_original_flash?: boolean
          is_exclusive?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          studio_id?: string | null
          title?: string
          description?: string | null
          images?: string[]
          tags?: string[] | null
          style_tags?: string[] | null
          is_original_flash?: boolean
          is_exclusive?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_designs: {
        Row: {
          id: string
          design_id: string
          product_id: string
          artist_id: string
          mockup_images: string[]
          design_placement: Json
          price_override: number | null
          deposit_amount: number
          is_active: boolean
          total_sales: number
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          product_id: string
          artist_id: string
          mockup_images: string[]
          design_placement: Json
          price_override?: number | null
          deposit_amount: number
          is_active?: boolean
          total_sales?: number
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          product_id?: string
          artist_id?: string
          mockup_images?: string[]
          design_placement?: Json
          price_override?: number | null
          deposit_amount?: number
          is_active?: boolean
          total_sales?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: 'pending_deposit' | 'deposit_paid' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          deposit_amount: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          shipping_address: Json
          tracking_number: string | null
          shipped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          status?: 'pending_deposit' | 'deposit_paid' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          deposit_amount: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          shipping_address: Json
          tracking_number?: string | null
          shipped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: 'pending_deposit' | 'deposit_paid' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          deposit_amount?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          shipping_address?: Json
          tracking_number?: string | null
          shipped_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_design_id: string
          quantity: number
          size: string
          color: string
          unit_price: number
          total_price: number
          fulfillment_partner_id: string | null
          fulfillment_status: 'unassigned' | 'assigned' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | null
          fulfillment_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_design_id: string
          quantity?: number
          size: string
          color: string
          unit_price: number
          total_price: number
          fulfillment_partner_id?: string | null
          fulfillment_status?: 'unassigned' | 'assigned' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | null
          fulfillment_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_design_id?: string
          quantity?: number
          size?: string
          color?: string
          unit_price?: number
          total_price?: number
          fulfillment_partner_id?: string | null
          fulfillment_status?: 'unassigned' | 'assigned' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | null
          fulfillment_notes?: string | null
          created_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'monthly_design' | 'bracket_tournament' | 'ranking_challenge'
          status: 'upcoming' | 'active' | 'voting' | 'completed'
          submission_start: string
          submission_end: string
          voting_start: string | null
          voting_end: string | null
          theme: string | null
          required_product_category: string | null
          prizes: Json | null
          winner_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'monthly_design' | 'bracket_tournament' | 'ranking_challenge'
          status?: 'upcoming' | 'active' | 'voting' | 'completed'
          submission_start: string
          submission_end: string
          voting_start?: string | null
          voting_end?: string | null
          theme?: string | null
          required_product_category?: string | null
          prizes?: Json | null
          winner_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'monthly_design' | 'bracket_tournament' | 'ranking_challenge'
          status?: 'upcoming' | 'active' | 'voting' | 'completed'
          submission_start?: string
          submission_end?: string
          voting_start?: string | null
          voting_end?: string | null
          theme?: string | null
          required_product_category?: string | null
          prizes?: Json | null
          winner_ids?: string[] | null
          created_at?: string
        }
      }
      competition_entries: {
        Row: {
          id: string
          competition_id: string
          design_id: string
          artist_id: string
          submission_notes: string | null
          final_rank: number | null
          created_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          design_id: string
          artist_id: string
          submission_notes?: string | null
          final_rank?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          design_id?: string
          artist_id?: string
          submission_notes?: string | null
          final_rank?: number | null
          created_at?: string
        }
      }
      competition_votes: {
        Row: {
          id: string
          competition_id: string
          entry_id: string
          voter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          entry_id: string
          voter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          entry_id?: string
          voter_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: 'order_update' | 'competition' | 'payout' | 'verification' | 'system'
          title: string
          message: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: 'order_update' | 'competition' | 'payout' | 'verification' | 'system'
          title: string
          message: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: 'order_update' | 'competition' | 'payout' | 'verification' | 'system'
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
      }
      fulfillment_partners: {
        Row: {
          id: string
          profile_id: string
          business_name: string
          description: string | null
          specialties: string[] | null
          min_order_value: number | null
          turnaround_days: number | null
          rating: number
          total_orders: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          business_name: string
          description?: string | null
          specialties?: string[] | null
          min_order_value?: number | null
          turnaround_days?: number | null
          rating?: number
          total_orders?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          business_name?: string
          description?: string | null
          specialties?: string[] | null
          min_order_value?: number | null
          turnaround_days?: number | null
          rating?: number
          total_orders?: number
          is_active?: boolean
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          recipient_id: string
          recipient_type: 'artist' | 'fulfillment'
          order_item_id: string
          amount: number
          status: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          recipient_type: 'artist' | 'fulfillment'
          order_item_id: string
          amount: number
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          recipient_type?: 'artist' | 'fulfillment'
          order_item_id?: string
          amount?: number
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      artist_rankings: {
        Row: {
          id: string
          artist_id: string
          period: string
          total_sales: number
          total_votes: number
          competition_wins: number
          average_rating: number
          ranking_score: number
          rank_position: number | null
          calculated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          period: string
          total_sales?: number
          total_votes?: number
          competition_wins?: number
          average_rating?: number
          ranking_score?: number
          rank_position?: number | null
          calculated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          period?: string
          total_sales?: number
          total_votes?: number
          competition_wins?: number
          average_rating?: number
          ranking_score?: number
          rank_position?: number | null
          calculated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
