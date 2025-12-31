import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const ImportCandidatesPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      navigate('/candidates');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Import Candidates</h1>
          <p className="text-neutral-600">Bulk upload candidates from CSV file</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">CSV Format Requirements</p>
                <p className="text-sm text-blue-800 mb-2">
                  Your CSV file must include the following columns:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• full_name (required)</li>
                  <li>• email (required)</li>
                  <li>• phone (optional)</li>
                  <li>• job_title (optional)</li>
                  <li>• experience_years (optional)</li>
                  <li>• current_company (optional)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <Button variant="outline" className="mb-4" leftIcon={<Download className="w-4 h-4" />}>
              Download Sample Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center hover:border-primary-400 transition-colors">
            {!file ? (
              <>
                <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-secondary mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-neutral-600 mb-4">
                  Maximum file size: 10MB
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button as="span">
                    Select File
                  </Button>
                </label>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div className="text-left">
                  <p className="font-semibold text-secondary">{file.name}</p>
                  <p className="text-sm text-neutral-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" id="skip-duplicates" />
            <label htmlFor="skip-duplicates" className="text-sm text-secondary cursor-pointer">
              Skip duplicate emails
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" id="send-notifications" />
            <label htmlFor="send-notifications" className="text-sm text-secondary cursor-pointer">
              Send email notifications to imported candidates
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/candidates')}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!file || importing}>
          {importing ? 'Importing...' : 'Import Candidates'}
        </Button>
      </div>
    </div>
  );
};
