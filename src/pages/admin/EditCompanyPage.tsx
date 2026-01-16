import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea, Loading } from '@/components/ui';
import { Building, Save, X, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/adminService';

export const EditCompanyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: 'technology',
    size: '50-200',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    description: '',
    subscription_plan: 'basic',
    status: 'active' as 'active' | 'inactive' | 'pending'
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        if (!id) return;
        const company = await adminService.getCompany(Number(id));
        setFormData({
            name: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            website: company.website || '',
            industry: company.industry || 'technology',
            size: company.size || '50-200',
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            country: company.country || '',
            postal_code: company.postal_code || '',
            description: company.description || '',
            subscription_plan: company.subscription_plan || 'basic',
            status: company.status || 'active'
        });
      } catch (err) {
        setError('Failed to load company details');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await adminService.updateCompany(Number(id), formData);
      navigate('/admin/companies');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-8 text-center">Loading company data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Edit Company</h1>
            <p className="text-neutral-600">Update company details</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/companies')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
           <CardContent className="p-4"><p className="text-red-800">{error}</p></CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
         <Card>
           <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Company Name *</label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            {/* Add more fields here as needed, copying structure from CreateCompanyPage */}
           </CardContent>
         </Card>
         <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/companies')}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loading size="sm" /> : <><Save className="w-4 h-4 mr-2" /> Update Company</>}
          </Button>
        </div>
      </form>
    </div>
  );
};