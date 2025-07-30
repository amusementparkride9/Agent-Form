import { supabase, ProviderConfig, NotificationConfig, FormConfig } from './supabase'

// Cache for client-side performance
let settingsCache: { [key: string]: any } = {}
let cacheExpiry: { [key: string]: number } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Generic function to get admin settings
async function getAdminSetting<T>(settingKey: string, defaultValue: T): Promise<T> {
  // Check cache first
  const now = Date.now()
  if (settingsCache[settingKey] && cacheExpiry[settingKey] > now) {
    return settingsCache[settingKey] as T
  }

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single()

    if (error) {
      console.error(`Error fetching ${settingKey}:`, error)
      return defaultValue
    }

    const value = data.setting_value as T
    
    // Update cache
    settingsCache[settingKey] = value
    cacheExpiry[settingKey] = now + CACHE_DURATION
    
    return value
  } catch (error) {
    console.error(`Error fetching ${settingKey}:`, error)
    return defaultValue
  }
}

// Generic function to save admin settings
async function saveAdminSetting(settingKey: string, settingValue: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue
      })

    if (error) {
      console.error(`Error saving ${settingKey}:`, error)
      return false
    }

    // Clear cache for this setting
    delete settingsCache[settingKey]
    delete cacheExpiry[settingKey]
    
    return true
  } catch (error) {
    console.error(`Error saving ${settingKey}:`, error)
    return false
  }
}

// Provider Management Functions
export async function getProviderConfig(): Promise<ProviderConfig[]> {
  const defaultProviders: ProviderConfig[] = [
    { id: 'xfinity', name: 'Xfinity', enabled: true, displayOrder: 1 },
    { id: 'spectrum', name: 'Spectrum', enabled: true, displayOrder: 2 },
    { id: 'frontier-fiber', name: 'Frontier Fiber', enabled: true, displayOrder: 3 },
    { id: 'frontier-copper', name: 'Frontier Copper', enabled: true, displayOrder: 4 },
    { id: 'brightspeed-fiber', name: 'BrightSpeed Fiber', enabled: true, displayOrder: 5 },
    { id: 'brightspeed-copper', name: 'BrightSpeed Copper', enabled: true, displayOrder: 6 },
    { id: 'altafiber', name: 'Altafiber', enabled: true, displayOrder: 7 },
    { id: 'metronet', name: 'Metronet', enabled: true, displayOrder: 8 },
    { id: 'optimum', name: 'Optimum', enabled: true, displayOrder: 9 },
    { id: 'kinetic', name: 'Kinetic', enabled: true, displayOrder: 10 },
    { id: 'earthlink', name: 'EarthLink', enabled: true, displayOrder: 11 },
    { id: 'directv', name: 'DirecTV', enabled: true, displayOrder: 12 }
  ]

  return await getAdminSetting('provider_config', defaultProviders)
}

export async function saveProviderConfig(providers: ProviderConfig[]): Promise<boolean> {
  return await saveAdminSetting('provider_config', providers)
}

// Notification Management Functions
export async function getNotificationConfig(): Promise<NotificationConfig> {
  const defaultConfig: NotificationConfig = {
    admin_email: 'gamblerspassion@gmail.com',
    push_notifications_enabled: false,
    email_notifications_enabled: true
  }

  return await getAdminSetting('notification_config', defaultConfig)
}

export async function saveNotificationConfig(config: NotificationConfig): Promise<boolean> {
  return await saveAdminSetting('notification_config', config)
}

// Form Configuration Functions
export async function getFormConfig(): Promise<FormConfig> {
  const defaultConfig: FormConfig = {
    form_enabled: true,
    maintenance_mode: false,
    custom_message: ''
  }

  return await getAdminSetting('form_config', defaultConfig)
}

export async function saveFormConfig(config: FormConfig): Promise<boolean> {
  return await saveAdminSetting('form_config', config)
}

// Cache invalidation function for real-time updates
export function invalidateSettingsCache(): void {
  settingsCache = {}
  cacheExpiry = {}
}
