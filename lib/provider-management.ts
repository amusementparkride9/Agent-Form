// Provider management service
export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  displayOrder: number;
}

// Default provider configuration - ONLY providers actually implemented
const DEFAULT_PROVIDERS: ProviderConfig[] = [
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
];

// Storage key for provider settings
const PROVIDER_SETTINGS_KEY = 'admin_provider_settings';

// Get current provider configuration
export function getProviderConfig(): ProviderConfig[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PROVIDERS;
  }
  
  try {
    const stored = localStorage.getItem(PROVIDER_SETTINGS_KEY);
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      // Merge with defaults to handle new providers
      return mergeWithDefaults(parsedConfig);
    }
  } catch (error) {
    console.error('Error loading provider config:', error);
  }
  
  return DEFAULT_PROVIDERS;
}

// Save provider configuration
export function saveProviderConfig(config: ProviderConfig[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving provider config:', error);
  }
}

// Get enabled providers only
export function getEnabledProviders(): ProviderConfig[] {
  return getProviderConfig()
    .filter(provider => provider.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

// Filter ZIP code results based on enabled providers
export function filterProvidersByZip(zipProviders: any[], zipCode: string): any[] {
  const enabledProviders = getEnabledProviders();
  const enabledProviderIds = new Set(enabledProviders.map(p => p.id));
  
  return zipProviders.filter(provider => {
    // Map provider names to IDs (you may need to adjust these mappings)
    const providerId = mapProviderNameToId(provider.name || provider.provider);
    return enabledProviderIds.has(providerId);
  });
}

// Update a single provider's enabled status
export function updateProviderEnabled(providerId: string, enabled: boolean): void {
  const config = getProviderConfig();
  const updatedConfig = config.map(provider => 
    provider.id === providerId 
      ? { ...provider, enabled }
      : provider
  );
  saveProviderConfig(updatedConfig);
}

// Bulk update provider configuration
export function bulkUpdateProviders(updates: Partial<ProviderConfig>[]): void {
  const config = getProviderConfig();
  const updatedConfig = config.map(provider => {
    const update = updates.find(u => u.id === provider.id);
    return update ? { ...provider, ...update } : provider;
  });
  saveProviderConfig(updatedConfig);
}

// Reset to default configuration
export function resetToDefaults(): void {
  saveProviderConfig(DEFAULT_PROVIDERS);
}

// Helper functions
function mergeWithDefaults(storedConfig: ProviderConfig[]): ProviderConfig[] {
  const storedMap = new Map(storedConfig.map(p => [p.id, p]));
  
  return DEFAULT_PROVIDERS.map(defaultProvider => {
    const stored = storedMap.get(defaultProvider.id);
    return stored ? { ...defaultProvider, ...stored } : defaultProvider;
  });
}

function mapProviderNameToId(providerName: string): string {
  const nameToIdMap: Record<string, string> = {
    'xfinity': 'xfinity',
    'spectrum': 'spectrum',
    'frontier fiber': 'frontier-fiber',
    'frontier copper': 'frontier-copper',
    'brightspeed fiber': 'brightspeed-fiber',
    'brightspeed copper': 'brightspeed-copper',
    'altafiber': 'altafiber',
    'metronet': 'metronet',
    'optimum': 'optimum',
    'kinetic': 'kinetic',
    'earthlink': 'earthlink',
    'directv': 'directv'
  };
  
  const normalized = providerName.toLowerCase().trim();
  return nameToIdMap[normalized] || normalized.replace(/[^a-z0-9]/g, '-');
}
