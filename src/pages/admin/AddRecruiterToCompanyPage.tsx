import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import { UserPlus, Save, X, ArrowLeft } from 'lucide-react';

export const AddRecruiterToCompanyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // company ID
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'recruiter',
    department: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success and go back
    alert('Recruiter added to company successfully!');
    navigate(`/admin/companies/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Add Recruiter to Company</h1>
          <p className="text-neutral-600">Create a new recruiter account for this company</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recruiter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g., John Smith"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email *
              </label>
              <Input
                required
                type="email"
                placeholder="john.smith@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Phone
              </label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="senior_recruiter">Senior Recruiter</option>
                  <option value="hr_manager">HR Manager</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Department
                </label>
                <Input
                  placeholder="e.g., Human Resources"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/companies/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Add Recruiter
          </Button>
        </div>
      </form>
    </div>
  );
};
