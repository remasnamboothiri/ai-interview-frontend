import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Lock, ChevronRight } from 'lucide-react';

export const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Settings</h1>
        <p className="text-neutral-600 mt-1">Configure your preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">Change Password</p>
                  <p className="text-sm text-neutral-600">Update your account password</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/change-password')}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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



// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// export const SettingsPage = () => {
//   return (
//     <div className="space-y-6 max-w-3xl">
//       <div>
//         <h1 className="text-3xl font-bold text-secondary">Settings</h1>
//         <p className="text-neutral-600 mt-1">Configure your preferences</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>General Settings</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-neutral-600">Settings options will appear here...</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
