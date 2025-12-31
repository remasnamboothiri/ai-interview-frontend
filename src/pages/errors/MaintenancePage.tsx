import { Settings, Clock } from 'lucide-react';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <Settings className="w-24 h-24 text-primary-600 mx-auto mb-6 animate-spin" style={{ animationDuration: '3s' }} />
        <h1 className="text-4xl font-bold text-secondary mb-4">Under Maintenance</h1>
        <p className="text-neutral-600 mb-6">
          We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!
        </p>
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-center gap-2 text-neutral-700 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Estimated Return Time</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">2 hours</p>
        </div>
        <p className="text-sm text-neutral-500">
          Follow us on Twitter <a href="#" className="text-primary-600 hover:underline">@aiinterview</a> for updates
        </p>
      </div>
    </div>
  );
};
