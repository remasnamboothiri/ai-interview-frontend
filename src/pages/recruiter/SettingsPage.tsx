import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Settings</h1>
        <p className="text-neutral-600 mt-1">Configure your preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Settings options will appear here...</p>
        </CardContent>
      </Card>
    </div>
  );
};
