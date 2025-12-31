import { Monitor, Download } from 'lucide-react';
import { Button } from '@/components/ui';

export const BrowserNotSupportedPage = () => {
  const browsers = [
    { name: 'Google Chrome', url: 'https://www.google.com/chrome/', icon: '🌐' },
    { name: 'Mozilla Firefox', url: 'https://www.mozilla.org/firefox/', icon: '🦊' },
    { name: 'Microsoft Edge', url: 'https://www.microsoft.com/edge', icon: '🔷' },
    { name: 'Safari', url: 'https://www.apple.com/safari/', icon: '🧭' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl bg-white rounded-xl p-8 shadow-lg">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Monitor className="w-12 h-12 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-4">Browser Not Supported</h1>
        <p className="text-neutral-600 mb-8">
          Your current browser is not supported or outdated. For the best experience, please use one of the following browsers:
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {browsers.map((browser) => (
            <a
              key={browser.name}
              href={browser.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-50 rounded-lg p-6 hover:bg-neutral-100 transition-colors border-2 border-neutral-200 hover:border-primary-300"
            >
              <div className="text-4xl mb-2">{browser.icon}</div>
              <h3 className="font-semibold text-secondary mb-1">{browser.name}</h3>
              <div className="flex items-center justify-center gap-1 text-sm text-primary-600">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </div>
            </a>
          ))}
        </div>
        <p className="text-sm text-neutral-500">
          Minimum versions: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
        </p>
      </div>
    </div>
  );
};
