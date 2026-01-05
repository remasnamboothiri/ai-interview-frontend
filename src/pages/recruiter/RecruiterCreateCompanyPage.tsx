import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from '@/components/ui';
import { Building2, Save, X } from 'lucide-react';

export const RecruiterCreateCompanyPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: 'Technology',
    size: '1-10',
    location: '',
    logo_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success and go back
    alert('Company created successfully!');
    navigate('/companies');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Create New Company</h1>
            <p className="text-neutral-600">Add a new company to your portfolio</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Company Name *
              </label>
              <Input
                required
                placeholder="e.g., TechCorp Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Description *
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Brief description about the company..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Industry *
                </label>
                <Select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
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

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Location *
              </label>
              <Input
                required
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Logo URL
              </label>
              <Input
                placeholder="https://www.company.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/companies')}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Create Company
          </Button>
        </div>
      </form>
    </div>
  );
};
