import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { useState } from 'react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Profile</h1>
        <p className="text-neutral-600 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={user?.full_name || ''}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />
            <Input
              label="Role"
              value={user?.role || ''}
              disabled
            />
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button variant="primary">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
