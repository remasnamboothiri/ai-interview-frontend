import { Button } from '@/components/ui';
import { FileX, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UploadErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg bg-white rounded-xl p-8 shadow-lg">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileX className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-4">File Upload Failed</h1>
        <p className="text-neutral-600 mb-6">
          We couldn't upload your file. This might be due to:
        </p>
        <div className="bg-neutral-50 rounded-lg p-4 mb-8 text-left">
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>File size exceeds the 10MB limit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Unsupported file format (PDF, DOC, DOCX only)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Network connection interrupted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>File is corrupted or empty</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<RefreshCw className="w-5 h-5" />}
            onClick={() => window.history.back()}
          >
            Try Again
          </Button>
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full" leftIcon={<Home className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
