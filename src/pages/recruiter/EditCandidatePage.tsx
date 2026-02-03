import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Badge, Loading } from '@/components/ui';
import { Education } from '@/types';
import { Edit, Save, X, Plus, GraduationCap } from 'lucide-react';
import { candidateService } from '@/services/candidateService';

export const EditCandidatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    experience_years: '',
    current_company: '',
    linkedin_url: '',
    portfolio_url: '',
    skills: [] as string[],
    education: [] as Education[],
    notes: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [educationForm, setEducationForm] = useState({ degree: '', school: '', year: '' });

  // Load candidate data when page opens
  useEffect(() => {
    if (id) {
      loadCandidate();
    }
  }, [id]);

  const loadCandidate = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await candidateService.getCandidate(id);
      
      // Pre-fill form with existing data
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        experience_years: data.experience_years?.toString() || '',
        current_company: data.current_company || '',
        linkedin_url: data.linkedin_url || '',
        portfolio_url: data.portfolio_url || '',
        skills: data.skills || [],
        education: [],
        notes: data.general_notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    } else {
      alert('Please enter a skill name');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addEducation = () => {
    if (educationForm.degree && educationForm.school && educationForm.year) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...educationForm }]
      });
      setEducationForm({ degree: '', school: '', year: '' });
    } else {
      alert('Please fill in all education fields (Degree, School, and Year)');
    }
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      setIsSaving(true);
      setError(null);

      // Update candidate profile
      const candidateData = {
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        current_company: formData.current_company || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        portfolio_url: formData.portfolio_url || undefined,
        skills: formData.skills,
        general_notes: formData.notes || undefined,
      };

      await candidateService.updateCandidate(id, candidateData);

      alert('Candidate updated successfully!');
      navigate(`/candidates/${id}`);
      
    } catch (err: any) {
      console.error('Error updating candidate:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update candidate');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && !formData.email) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <X className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => navigate('/candidates')}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Edit className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Edit Candidate</h1>
            <p className="text-neutral-600">Update candidate information</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate(`/candidates/${id}`)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name
              </label>
              <Input
                disabled
                value={formData.full_name}
                className="bg-neutral-50"
              />
              <p className="text-xs text-neutral-500 mt-1">Name cannot be changed here</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email
                </label>
                <Input
                  disabled
                  type="email"
                  value={formData.email}
                  className="bg-neutral-50"
                />
                <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Phone
                </label>
                <Input
                  disabled
                  value={formData.phone}
                  className="bg-neutral-50"
                />
                <p className="text-xs text-neutral-500 mt-1">Phone cannot be changed</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Current Company
                </label>
                <Input
                  placeholder="e.g., TechCorp"
                  value={formData.current_company}
                  onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                LinkedIn Profile
              </label>
              <Input
                placeholder="https://linkedin.com/in/johndoe"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Portfolio URL
              </label>
              <Input
                placeholder="https://portfolio.com"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Add/Remove Skills
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React, Python, AWS"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="neutral"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Notes
              </label>
              <Textarea
                rows={4}
                placeholder="Add any additional notes about the candidate..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/candidates/${id}`)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
