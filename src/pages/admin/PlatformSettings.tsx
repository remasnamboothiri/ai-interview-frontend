import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select } from '@/components/ui';
import { Settings, Save, AlertCircle, Loader } from 'lucide-react';
import systemSettingsService, { SystemSetting } from '@/services/systemSettingsService';

export const PlatformSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for creating new settings
  const [newSetting, setNewSetting] = useState({
    setting_key: '',
    setting_value: '',
    data_type: 'string' as 'string' | 'integer' | 'boolean' | 'json',
    description: '',
    is_public: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemSettingsService.getAllSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetting = async () => {
    if (!newSetting.setting_key || !newSetting.setting_value) {
      setError('Setting key and value are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await systemSettingsService.createSetting(newSetting);
      setSuccessMessage('Setting created successfully!');
      
      // Reset form
      setNewSetting({
        setting_key: '',
        setting_value: '',
        data_type: 'string',
        description: '',
        is_public: false,
      });
      
      // Refresh settings list
      await fetchSettings();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error creating setting:', err);
      setError('Failed to create setting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSetting = async (id: number, updates: Partial<SystemSetting>) => {
    try {
      await systemSettingsService.updateSetting(id, updates);
      setSuccessMessage('Setting updated successfully!');
      await fetchSettings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating setting:', err);
      setError('Failed to update setting. Please try again.');
    }
  };

  const handleDeleteSetting = async (id: number) => {
    if (!confirm('Are you sure you want to delete this setting?')) {
      return;
    }

    try {
      await systemSettingsService.deleteSetting(id);
      setSuccessMessage('Setting deleted successfully!');
      await fetchSettings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting setting:', err);
      setError('Failed to delete setting. Please try again.');
    }
  };

  const handleSettingChange = (id: number, field: keyof SystemSetting, value: any) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

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

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent>
            <div className="flex items-center gap-3 text-green-800">
              <AlertCircle className="w-5 h-5" />
              <p>{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Setting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Setting Key *
              </label>
              <Input
                placeholder="e.g., platform_name"
                value={newSetting.setting_key}
                onChange={(e) => setNewSetting({ ...newSetting, setting_key: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Data Type
              </label>
              <Select
                value={newSetting.data_type}
                onChange={(e) => setNewSetting({ ...newSetting, data_type: e.target.value as any })}
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Setting Value *
            </label>
            <Input
              placeholder="Enter value"
              value={newSetting.setting_value}
              onChange={(e) => setNewSetting({ ...newSetting, setting_value: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Description
            </label>
            <Textarea
              placeholder="Optional description"
              value={newSetting.description}
              onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-neutral-50 rounded-lg">
            <input
              type="checkbox"
              checked={newSetting.is_public}
              onChange={(e) => setNewSetting({ ...newSetting, is_public: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-secondary">
              Public Setting (visible to all users)
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateSetting} disabled={saving}>
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Setting
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Settings ({settings.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              No settings found. Create your first setting above.
            </div>
          ) : (
            settings.map((setting) => (
              <div
                key={setting.id}
                className="p-4 border-2 border-neutral-100 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-secondary">{setting.setting_key}</h3>
                      <span className="text-xs px-2 py-1 bg-neutral-100 rounded">
                        {setting.data_type}
                      </span>
                      {setting.is_public && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          Public
                        </span>
                      )}
                    </div>
                    <Input
                      value={setting.setting_value}
                      onChange={(e) => handleSettingChange(setting.id, 'setting_value', e.target.value)}
                      onBlur={() => handleUpdateSetting(setting.id, { setting_value: setting.setting_value })}
                      className="mb-2"
                    />
                    {setting.description && (
                      <p className="text-sm text-neutral-600">{setting.description}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      Last updated: {new Date(setting.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSetting(setting.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
