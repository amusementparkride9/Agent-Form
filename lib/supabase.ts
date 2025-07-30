import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AdminSetting {
  id: number
  setting_key: string
  setting_value: any
  updated_at: string
  created_at: string
}

export interface ProviderConfig {
  id: string
  name: string
  enabled: boolean
  displayOrder: number
}

export interface NotificationConfig {
  admin_email: string
  push_notifications_enabled: boolean
  email_notifications_enabled: boolean
}

export interface FormConfig {
  form_enabled: boolean
  maintenance_mode: boolean
  custom_message: string
}
