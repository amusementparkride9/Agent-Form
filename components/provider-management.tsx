'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { 
  getProviderConfig, 
  saveProviderConfig, 
  resetToDefaults, 
  ProviderConfig 
} from '@/lib/provider-management';

export default function ProviderManagement() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setProviders(getProviderConfig());
  }, []);

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    const updatedProviders = providers.map(provider =>
      provider.id === providerId ? { ...provider, enabled } : provider
    );
    setProviders(updatedProviders);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    saveProviderConfig(providers);
    setHasChanges(false);
    
    // Force a page reload to reload ZIP data with new provider settings
    alert('Provider settings saved! Page will reload to apply changes.');
    window.location.reload();
  };

  const handleReset = () => {
    resetToDefaults();
    setProviders(getProviderConfig());
    setHasChanges(true);
  };

  const enabledCount = providers.filter(p => p.enabled).length;
  const totalCount = providers.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Provider Management
        </CardTitle>
        <CardDescription>
          Control which providers appear in ZIP code search results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {enabledCount} of {totalCount} providers enabled
            </span>
          </div>
          <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
            {enabledCount === 0 ? "No providers" : `${enabledCount} active`}
          </Badge>
        </div>

        {/* Provider List */}
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {provider.enabled ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <span className={`font-medium ${provider.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                    {provider.name}
                  </span>
                  <div className="text-xs text-gray-500">
                    Display order: {provider.displayOrder}
                  </div>
                </div>
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={(enabled) => handleToggleProvider(provider.id, enabled)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className="flex-1"
          >
            {hasChanges ? "Save Changes" : "No Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How it works:</strong></p>
          <p>• Disabled providers won't appear in ZIP code search results</p>
          <p>• Agents will only see enabled providers as options</p>
          <p>• Changes take effect immediately after saving</p>
          <p>• Use this to control which services you want to offer</p>
        </div>
      </CardContent>
    </Card>
  );
}
