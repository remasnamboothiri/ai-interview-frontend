import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Building2, Globe, MapPin, Users, Calendar, Edit } from 'lucide-react';
import { mockCompanies } from '@/data/mockData';
import { formatRelativeTime } from '@/utils/format';

export const RecruiterCompanyDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find the company by ID (for now, just use the first one)
  const company = mockCompanies.find(c => c.id === id) || mockCompanies[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/companies/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Company
        </Button>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-20 h-20 object-contain rounded-lg" />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {company.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{company.name}</h1>
                <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
                  {company.status}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3 text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {company.industry}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {company.size} employees
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created {formatRelativeTime(new Date(company.created_at))}
                </div>
              </div>

              {company.website && (
                <div className="flex items-center gap-2 text-neutral-600 mb-4">
                  <Globe className="w-4 h-4" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {company.website}
                  </a>
                </div>
              )}

              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-medium text-secondary mb-2">About</h3>
                <p className="text-neutral-700">{company.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
