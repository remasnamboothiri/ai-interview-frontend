import { Video, Mic } from 'lucide-react';

export const PermissionDeniedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl bg-white rounded-xl p-8 shadow-lg">
        <div className="flex gap-4 justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-4">Camera & Microphone Access Required</h1>
        <p className="text-neutral-600 mb-8">
          To join the interview, you need to allow access to your camera and microphone. Follow these steps:
        </p>
        <div className="bg-neutral-50 rounded-lg p-6 text-left mb-8">
          <h3 className="font-semibold text-secondary mb-4">How to Enable Permissions:</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-neutral-700 mb-2">Chrome / Edge:</p>
              <ol className="text-sm text-neutral-600 space-y-1 ml-4">
                <li>1. Click the lock icon in the address bar</li>
                <li>2. Find Camera and Microphone settings</li>
                <li>3. Select "Allow" for both</li>
                <li>4. Reload this page</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-neutral-700 mb-2">Firefox:</p>
              <ol className="text-sm text-neutral-600 space-y-1 ml-4">
                <li>1. Click the camera icon in the address bar</li>
                <li>2. Click "Allow" for Camera and Microphone</li>
                <li>3. Reload this page</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-neutral-700 mb-2">Safari:</p>
              <ol className="text-sm text-neutral-600 space-y-1 ml-4">
                <li>1. Go to Safari → Settings → Websites</li>
                <li>2. Select Camera and Microphone</li>
                <li>3. Allow access for this website</li>
                <li>4. Reload this page</li>
              </ol>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          I've Enabled Permissions - Reload Page
        </button>
      </div>
    </div>
  );
};
