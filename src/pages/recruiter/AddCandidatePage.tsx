import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { Education } from '@/types';
import { UserPlus, Save, X, Upload, Plus, GraduationCap } from 'lucide-react';

export const AddCandidatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    job_id: '',
    experience_years: '',
    current_company: '',
    linkedin_url: '',
    portfolio_url: '',
    skills: [] as string[],
    education: [] as Education[],
    resume_file: null as File | null,
    notes: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [educationForm, setEducationForm] = useState({ degree: '', school: '', year: '' });

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
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
    }
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/candidates');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Add New Candidate</h1>
            <p className="text-neutral-600">Manually add a candidate to the system</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g., John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="john.doe@example.com"
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
            <CardTitle>Skills & Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Skills
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

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Education
              </label>
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Degree (e.g., BS Computer Science)"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  />
                  <Input
                    placeholder="School (e.g., Stanford University)"
                    value={educationForm.school}
                    onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Year (e.g., 2020)"
                      value={educationForm.year}
                      onChange={(e) => setEducationForm({ ...educationForm, year: e.target.value })}
                    />
                    <Button type="button" onClick={addEducation}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {formData.education.length > 0 && (
                  <div className="space-y-2">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="font-semibold text-secondary">{edu.degree}</p>
                            <p className="text-sm text-neutral-600">{edu.school} • {edu.year}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-error hover:text-error-dark"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Applying For *
              </label>
              <Select
                required
                value={formData.job_id}
                onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
              >
                <option value="">Select a job</option>
                <option value="1">Senior Software Engineer</option>
                <option value="2">Product Manager</option>
                <option value="3">UX Designer</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Resume / CV
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-neutral-500">PDF, DOC, DOCX (max 5MB)</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, resume_file: e.target.files?.[0] || null })}
                  className="hidden"
                />
              </div>
            </div>

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
          <Button type="button" variant="outline" onClick={() => navigate('/candidates')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </form>
    </div>
  );
};
