import { Button } from '@/components/ui';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflinePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <WifiOff className="w-24 h-24 text-orange-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-secondary mb-4">No Internet Connection</h1>
        <p className="text-neutral-600 mb-8">
          Please check your internet connection and try again. Make sure you're connected to a stable network.
        </p>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="w-5 h-5" />}
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </Button>
        <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-700 mb-2">Troubleshooting Tips:</p>
          <ul className="text-sm text-neutral-600 text-left space-y-1">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Restart your router</li>
            <li>• Try switching between WiFi and mobile data</li>
            <li>• Check if other websites are accessible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
