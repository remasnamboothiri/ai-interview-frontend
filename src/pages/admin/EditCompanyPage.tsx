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
        {/* CARD 1: Basic Information */}
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Company Name *
        </label>
        <Input
          required
          placeholder="e.g., TechCorp Inc."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Email and Phone in 2 columns */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Email *
          </label>
          <Input
            required
            type="email"
            placeholder="contact@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Phone
          </label>
          <Input
            placeholder="+1 (555) 100-2000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Website
        </label>
        <Input
          placeholder="https://www.company.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Description
        </label>
        <Textarea
          rows={3}
          placeholder="Brief description about the company..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Industry and Size in 2 columns */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Industry *
          </label>
          <Select
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          >
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Company Size *
          </label>
          <Select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          >
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* CARD 2: Address */}
  <Card>
    <CardHeader>
      <CardTitle>Address</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Street Address
        </label>
        <Textarea
          rows={2}
          placeholder="123 Main St, Suite 100"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      {/* City, State, Country in 3 columns */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">City</label>
          <Input
            placeholder="San Francisco"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">State</label>
          <Input
            placeholder="CA"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Country</label>
          <Input
            placeholder="United States"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Postal Code
        </label>
        <Input
          placeholder="94105"
          value={formData.postal_code}
          onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
        />
      </div>
    </CardContent>
  </Card>

  {/* CARD 3: Subscription & Status */}
  <Card>
    <CardHeader>
      <CardTitle>Subscription & Status</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Subscription Plan */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Plan *
        </label>
        <Select
          value={formData.subscription_plan}
          onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
        >
          <option value="basic">Basic - $99/month</option>
          <option value="professional">Professional - $299/month</option>
          <option value="enterprise">Enterprise - Custom</option>
        </Select>
      </div>
      
      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Status *
        </label>
        <Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </Select>
      </div>
    </CardContent>
  </Card>

  {/* Buttons at the bottom */}
  <div className="flex items-center justify-end gap-3">
    <Button type="button" variant="outline" onClick={() => navigate('/admin/companies')} disabled={isLoading}>
      Cancel
    </Button>
    <Button type="submit" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loading size="sm" className="mr-2" />
          Updating...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Update Company
        </>
      )}
    </Button>
  </div>
</form>

    </div>
  );
};