import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Edit, Video, FileText } from 'lucide-react';
import { format } from 'date-fns';

const mockCandidate = {
  id: '1',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  job_title: 'Senior Software Engineer',
  experience_years: 8,
  current_company: 'TechStartup Inc.',
  status: 'active',
  applied_date: new Date('2024-12-15'),
  linkedin_url: 'https://linkedin.com/in/johndoe',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  education: [
    { degree: 'BS Computer Science', school: 'Stanford University', year: '2016' },
  ],
  experience: [
    { title: 'Senior Software Engineer', company: 'TechStartup Inc.', years: '2020 - Present' },
    { title: 'Software Engineer', company: 'BigTech Corp', years: '2016 - 2020' },
  ],
  interviews: [
    { id: '1', date: new Date('2024-12-20'), status: 'completed', score: 8.5 },
    { id: '2', date: new Date('2024-12-25'), status: 'scheduled', score: null },
  ],
};

export const CandidateProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Video className="w-4 h-4" />}>
            Schedule Interview
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            Edit Profile
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {mockCandidate.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{mockCandidate.full_name}</h1>
                <Badge variant={mockCandidate.status === 'active' ? 'success' : 'neutral'}>
                  {mockCandidate.status}
                </Badge>
              </div>
              <p className="text-xl text-neutral-600 mb-3">{mockCandidate.job_title}</p>
              <div className="grid md:grid-cols-2 gap-3 text-neutral-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {mockCandidate.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {mockCandidate.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {mockCandidate.experience_years} years experience
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Applied {format(mockCandidate.applied_date, 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockCandidate.skills.map((skill, idx) => (
                <Badge key={idx} variant="primary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                Resume.pdf
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                Cover Letter.pdf
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCandidate.experience.map((exp, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">{exp.title}</p>
                  <p className="text-neutral-600">{exp.company}</p>
                  <p className="text-sm text-neutral-500">{exp.years}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCandidate.interviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-4 border-2 border-neutral-100 rounded-lg">
                <div>
                  <p className="font-semibold text-secondary">
                    {interview.status === 'completed' ? 'Completed Interview' : 'Scheduled Interview'}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {format(interview.date, 'MMMM dd, yyyy • hh:mm a')}
                  </p>
                  {interview.score && (
                    <p className="text-sm text-primary-600 font-semibold mt-1">
                      Score: {interview.score}/10
                    </p>
                  )}
                </div>
                <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                  {interview.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
