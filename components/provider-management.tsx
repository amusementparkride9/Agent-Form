'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, RotateCcw, Eye, EyeOff, Database, Loader2 } from 'lucide-react';
// Provider management now uses API endpoints instead of direct Supabase calls

interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  displayOrder: number;
}

export default function ProviderManagement() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch provider config');
      }
      const data = await response.json();
      setProviders(data.providers);
    } catch (error) {
      console.error('Error loading providers:', error);
      alert('Failed to load provider settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    const updatedProviders = providers.map(provider =>
      provider.id === providerId ? { ...provider, enabled } : provider
    );
    setProviders(updatedProviders);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providers }),
      });

      if (!response.ok) {
        throw new Error('Failed to save provider config');
      }

      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        alert('Provider settings saved! Changes will take effect for all users immediately.');
      } else {
        alert('Failed to save provider settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving providers:', error);
      alert('Failed to save provider settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset to default provider settings? This will enable all providers.')) {
      setIsLoading(true);
      try {
        // Reset by reloading the default configuration
        await loadProviders();
        setHasChanges(true);
      } catch (error) {
        console.error('Error resetting providers:', error);
        alert('Failed to reset provider settings');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const enabledCount = providers.filter(p => p.enabled).length;
  const totalCount = providers.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Provider Management
          </CardTitle>
          <CardDescription>Loading provider settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
            disabled={!hasChanges || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : hasChanges ? (
              "Save Changes"
            ) : (
              "No Changes"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            size="sm"
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How it works:</strong></p>
          <p>• Disabled providers won't appear in ZIP code search results for ANY user</p>
          <p>• Changes affect ALL users of the form globally</p>
          <p>• Settings are stored in database (not browser storage)</p>
          <p>• Use this to control which services you want to offer</p>
        </div>
      </CardContent>
    </Card>
  );
}
