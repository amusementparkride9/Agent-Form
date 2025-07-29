import NotificationSettings from "@/components/notification-settings"
import AdminNotificationListener from "@/components/admin-notification-listener"
import ProviderManagement from "@/components/provider-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Settings, Bell } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <AdminNotificationListener />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Private admin settings - not visible to agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Management */}
        <div className="lg:col-span-2">
          <ProviderManagement />
        </div>
        
        {/* Notification Settings */}
        <div>
          <NotificationSettings />
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>
              Form submission overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Form Status</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Google Sheets</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Email Service</span>
              <span className="text-sm font-medium text-green-600">Resend Active</span>
            </div>
            <div className="pt-3 border-t">
              <a 
                href="/" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                → View Agent Form
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            How Mobile Notifications Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Setup:</strong> Enable notifications above (one-time setup)</p>
            <p><strong>2. Mobile:</strong> Open this page on your phone and enable notifications there too</p>
            <p><strong>3. Agents:</strong> They use the main form at <code className="bg-gray-100 px-1 rounded">/</code> - they see nothing about notifications</p>
            <p><strong>4. You get notified:</strong> Every form submission triggers an instant notification on your devices</p>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Bookmark this page: <code>/admin</code> - Keep it private, don't share with agents
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
