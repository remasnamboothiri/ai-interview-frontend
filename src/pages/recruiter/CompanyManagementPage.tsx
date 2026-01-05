import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Plus, Search, Building2, Users, MapPin, Calendar, Trash2 } from 'lucide-react';
import { mockCompanies } from '@/data/mockData';
import { formatRelativeTime } from '@/utils/format';
import { COMPANY_STATUSES } from '@/constants';

export const CompanyManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCompany = (companyId: string) => {
    // This would normally call an API to delete the company
    console.log('Delete company:', companyId);
    // For now, just show an alert
    alert('Delete functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Company Management</h1>
          <p className="text-neutral-600 mt-1">Manage your company listings and details</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/companies/create')}>
          Create Company
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search companies by name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              <option value={COMPANY_STATUSES.ACTIVE}>Active</option>
              <option value={COMPANY_STATUSES.INACTIVE}>Inactive</option>
              <option value={COMPANY_STATUSES.PENDING}>Pending</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {company.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-secondary">{company.name}</h3>
                      <Badge
                        variant={
                          company.status === 'active' ? 'success' :
                          company.status === 'inactive' ? 'danger' : 'warning'
                        }
                      >
                        {company.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{company.size} employees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatRelativeTime(new Date(company.created_at))}</span>
                      </div>
                    </div>

                    <p className="text-neutral-700 mb-4">{company.description}</p>

                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-neutral-700 mb-1">Contact:</p>
                      <p className="text-sm text-neutral-600">{company.email} • {company.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/companies/${company.id}`)}>
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/companies/${company.id}/edit`)}>
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCompany(company.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCompanies.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No companies found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
