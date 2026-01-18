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
      users: {
        Row: {
          id: string
          email: string
          role: 'tali' | 'calisan' | 'admin'
          full_name: string
          phone: string | null
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          role: 'tali' | 'calisan' | 'admin'
          full_name: string
          phone?: string | null
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'tali' | 'calisan' | 'admin'
          full_name?: string
          phone?: string | null
          created_at?: string
          last_login?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          full_name: string
          birth_date: string | null
          company: string | null
          date: string
          chassis_number: string | null
          plate_number: string | null
          identity_number: string | null
          document_number: string | null
          vehicle_type: string | null
          gross_premium: number | null
          type: string | null
          issuer: string | null
          related_person: string | null
          policy_number: string | null
          agency: string | null
          card_info: string | null
          additional_info: string | null
          net_premium: number | null
          commission: number | null
          status: 'pending' | 'approved' | 'rejected'
          document_url: string | null
          document_uploaded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          birth_date?: string | null
          company?: string | null
          date?: string
          chassis_number?: string | null
          plate_number?: string | null
          identity_number?: string | null
          document_number?: string | null
          vehicle_type?: string | null
          gross_premium?: number | null
          type?: string | null
          issuer?: string | null
          related_person?: string | null
          policy_number?: string | null
          agency?: string | null
          card_info?: string | null
          additional_info?: string | null
          net_premium?: number | null
          commission?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          document_url?: string | null
          document_uploaded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          birth_date?: string | null
          company?: string | null
          date?: string
          chassis_number?: string | null
          plate_number?: string | null
          identity_number?: string | null
          document_number?: string | null
          vehicle_type?: string | null
          gross_premium?: number | null
          type?: string | null
          issuer?: string | null
          related_person?: string | null
          policy_number?: string | null
          agency?: string | null
          card_info?: string | null
          additional_info?: string | null
          net_premium?: number | null
          commission?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          document_url?: string | null
          document_uploaded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          quote_id: string
          user_id: string
          policy_number: string
          status: 'active' | 'expired' | 'cancelled'
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          user_id: string
          policy_number: string
          status?: 'active' | 'expired' | 'cancelled'
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          user_id?: string
          policy_number?: string
          status?: 'active' | 'expired' | 'cancelled'
          start_date?: string
          end_date?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}
