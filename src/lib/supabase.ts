import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Supabase tables
export type Database = {
  public: {
    Tables: {
      clients_records: {
        Row: {
          id: string
          name: string
          surname: string
          phone: string
          dni: string
          birth_date: string
          address: string
          city: string
          postal_code: string
          email: string
          profession: string
          pathologies: string
          surgical_interventions: string
          medication: string
          family_history: string
          reason_for_consultation: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          surname: string
          phone: string
          dni: string
          birth_date: string
          address: string
          city: string
          postal_code: string
          email: string
          profession: string
          pathologies: string
          surgical_interventions: string
          medication: string
          family_history: string
          reason_for_consultation: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          surname?: string
          phone?: string
          dni?: string
          birth_date?: string
          address?: string
          city?: string
          postal_code?: string
          email?: string
          profession?: string
          pathologies?: string
          surgical_interventions?: string
          medication?: string
          family_history?: string
          reason_for_consultation?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          client_id: string
          date: string
          treatment_notes: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          date: string
          treatment_notes: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          date?: string
          treatment_notes?: string
          price?: number
        }
      }
      pending_records: {
        Row: {
          id: string
          client_name: string
          appointment_id: string
          appointment_date: string
          created_at: string
          is_completed: boolean
        }
        Insert: {
          id?: string
          client_name: string
          appointment_id: string
          appointment_date: string
          created_at?: string
          is_completed?: boolean
        }
        Update: {
          id?: string
          client_name?: string
          appointment_id?: string
          appointment_date?: string
          is_completed?: boolean
        }
      }
    }
  }
}

