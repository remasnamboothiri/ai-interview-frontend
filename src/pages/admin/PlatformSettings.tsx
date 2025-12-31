import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select } from '@/components/ui';
import { Settings, Save } from 'lucide-react';

export const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    platform_name: 'AI Interview Platform',
    support_email: 'support@platform.com',
    max_interviews_per_month: '1000',
    email_notifications: true,
    auto_archive_days: '90',
    maintenance_mode: false,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Platform Settings</h1>
          <p className="text-neutral-600">Configure global platform settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Platform Name
            </label>
            <Input
              value={settings.platform_name}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Support Email
            </label>
            <Input
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Max Interviews Per Month
            </label>
            <Input
              type="number"
              value={settings.max_interviews_per_month}
              onChange={(e) => setSettings({ ...settings, max_interviews_per_month: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Auto Archive After (days)
            </label>
            <Input
              type="number"
              value={settings.auto_archive_days}
              onChange={(e) => setSettings({ ...settings, auto_archive_days: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-neutral-50 rounded-lg">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-secondary">
              Enable Email Notifications
            </label>
          </div>

          <div className="flex items-center gap-2 p-4 bg-warning-50 rounded-lg border border-warning-200">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-warning-800">
              Maintenance Mode (disables all user access)
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
