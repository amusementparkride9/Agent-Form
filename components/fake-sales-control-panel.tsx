"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Play, Square, TestTube, Clock } from 'lucide-react';

interface FakeSaleData {
  customerName: string;
  agentName: string;
  selectedProvider: string;
  selectedPackage: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export default function FakeSalesControlPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSale, setLastSale] = useState<FakeSaleData | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const generateTestSale = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/fake-sales', {
        method: 'GET'
      });
      const result = await response.json();
      
      if (result.success) {
        setLastSale(result.generatedData);
      } else {
        console.error('Failed to generate test sale:', result.error);
      }
    } catch (error) {
      console.error('Error generating test sale:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerCronJob = async () => {
    try {
      const response = await fetch(`/api/cron/fake-sales?secret=${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-cron-secret-here'}`, {
        method: 'GET'
      });
      const result = await response.json();
      console.log('Cron job result:', result);
    } catch (error) {
      console.error('Error triggering cron job:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Fake Sales Control Panel</h1>
        <Badge variant="secondary">Admin Only</Badge>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Monitor and control fake sales notifications to Slack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automated Fake Sales</p>
              <p className="text-sm text-muted-foreground">
                Sends fake sales to Slack every 5 minutes via cron job
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled}
                disabled={true} // Controlled via Vercel cron
              />
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Active" : "Configured via Vercel Cron"}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Configuration:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Frequency: Every 5 minutes</li>
              <li>• Target: Slack only (bypasses Google Sheets)</li>
              <li>• AI Provider: Google Gemini for realistic data</li>
              <li>• Fallback: Predefined data if Gemini unavailable</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Generator
            </CardTitle>
            <CardDescription>
              Generate a single fake sale for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateTestSale} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Test Sale"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Manual Trigger
            </CardTitle>
            <CardDescription>
              Manually trigger the cron job endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={triggerCronJob}
              variant="outline"
              className="w-full"
            >
              Trigger Cron Job
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Generated Sale */}
      {lastSale && (
        <Card>
          <CardHeader>
            <CardTitle>Last Generated Sale</CardTitle>
            <CardDescription>
              Preview of the most recent fake sale data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">{lastSale.customerName}</p>
              </div>
              <div>
                <p className="font-medium">Agent</p>
                <p className="text-muted-foreground">{lastSale.agentName}</p>
              </div>
              <div>
                <p className="font-medium">Provider</p>
                <p className="text-muted-foreground">{lastSale.selectedProvider}</p>
              </div>
              <div>
                <p className="font-medium">Package</p>
                <p className="text-muted-foreground">{lastSale.selectedPackage}</p>
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">{lastSale.city}, {lastSale.state}</p>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">{lastSale.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">1. Environment Variables</p>
            <p className="text-muted-foreground">Add GEMINI_API_KEY and CRON_SECRET to your environment</p>
          </div>
          <div>
            <p className="font-medium">2. Vercel Deployment</p>
            <p className="text-muted-foreground">Deploy to Vercel - the cron job will automatically start</p>
          </div>
          <div>
            <p className="font-medium">3. Slack Integration</p>
            <p className="text-muted-foreground">Uses existing SLACK_WEBHOOK_URL - no changes needed</p>
          </div>
          <div>
            <p className="font-medium">4. Google Sheets</p>
            <p className="text-muted-foreground">Fake sales bypass Google Sheets entirely</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
