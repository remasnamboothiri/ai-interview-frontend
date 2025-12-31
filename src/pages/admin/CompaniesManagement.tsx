import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Loading } from '@/components/ui';
import { Search, Plus, Users, AlertCircle } from 'lucide-react';
import { adminService, Company } from '@/services/adminService';

interface CompanyWithStats extends Company {
  recruiterCount?: number;
}

export const CompaniesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllCompanies();

      const companiesWithStats = await Promise.all(
        data.map(async (company) => {
          try {
            const stats = await adminService.getCompanyStats(company.id);
            return { ...company, recruiterCount: stats.recruiterCount };
          } catch {
            return { ...company, recruiterCount: 0 };
          }
        })
      );

      setCompanies(companiesWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Companies Management</h1>
          <p className="text-neutral-600 mt-1">Manage registered companies</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/admin/companies/create')}>
          Add Company
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">
                {searchTerm ? 'No companies found matching your search.' : 'No companies yet. Create your first company!'}
              </p>
              {!searchTerm && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/admin/companies/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Company
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {company.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-secondary mb-1">{company.name}</h3>
                        <p className="text-sm text-neutral-600 mb-3">
                          {company.industry || 'N/A'} • {company.size || 'N/A'} employees
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-neutral-600">
                            <Users className="w-4 h-4" />
                            <span>{company.recruiterCount || 0} recruiters</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant={company.status === 'active' ? 'success' : 'neutral'}>
                        {company.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/companies/${company.id}`)}>View Details</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/companies/${company.id}`)}>Edit</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
