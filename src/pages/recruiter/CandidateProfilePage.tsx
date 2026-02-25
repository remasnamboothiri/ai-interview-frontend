import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Edit, Video, Globe, Linkedin } from 'lucide-react';
import { candidateService, Candidate } from '@/services/candidateService';
import { format } from 'date-fns';

import { interviewService } from '@/services/interviewService';
import type { Interview } from '@/services/interviewService';

export const CandidateProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Add state to store interviews
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCandidate();
      loadInterviews(); // ✅ CHANGE 3: Also load interviews when page opens
    }
  }, [id]);

  const loadCandidate = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await candidateService.getCandidate(id);
      setCandidate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate');
    } finally {
      setIsLoading(false);
    }
  };

  // : New function to fetch interviews for this candidate
  const loadInterviews = async () => {
    if (!id) return;
    try {
      setInterviewsLoading(true);
      // Calls: GET /api/interviews/by_candidate/?candidate_id=4
      const data = await interviewService.getInterviewsByCandidate(Number(id));
      // data might be array directly or { results: [] }
      if (Array.isArray(data)) {
        setInterviews(data);
      } else if ((data as any).results) {
        setInterviews((data as any).results);
      } else {
        setInterviews([]);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  };

  //  Helper to get badge color based on interview status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'warning';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'danger';
      case 'no_show': return 'neutral';
      default: return 'neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Candidate not found'}</p>
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Video className="w-4 h-4" />}
            onClick={() => navigate(`/interviews/schedule?candidate=${id}`)}
          >
            Schedule Interview
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/candidates/${id}/edit`)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {candidate.full_name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{candidate.full_name || 'No Name'}</h1>
                <Badge variant="success">Active</Badge>
              </div>
              {candidate.current_company && (
                <p className="text-xl text-neutral-600 mb-3">{candidate.current_company}</p>
              )}
              <div className="grid md:grid-cols-2 gap-3 text-neutral-600">
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.experience_years !== undefined && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {candidate.experience_years} years experience
                  </div>
                )}
                {candidate.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Added {format(new Date(candidate.created_at), 'MMM dd, yyyy')}
                  </div>
                )}
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
            {candidate.skills && candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, idx) => (
                  <Badge key={idx} variant="primary">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No skills listed</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {candidate.linkedin_url && (
                <a 
                  href={candidate.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </a>
              )}
              {candidate.portfolio_url && (
                <a 
                  href={candidate.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio Website
                </a>
              )}
              {!candidate.linkedin_url && !candidate.portfolio_url && (
                <p className="text-neutral-500">No links available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {candidate.general_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 whitespace-pre-wrap">{candidate.general_notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Interview History</span>
            {/* Shows count of interviews */}
            {interviews.length > 0 && (
              <Badge variant="neutral">{interviews.length} interview{interviews.length !== 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        {/* <CardContent>
          
          <div className="text-center py-8 text-neutral-500">
            No interviews scheduled yet
          </div>
        </CardContent> */}

        <CardContent>

          {/* Loading state */}
          {interviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loading size="sm" />
            </div>

          /* No interviews found */
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p>No interviews scheduled yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => navigate(`/interviews/schedule?candidate=${id}`)}
              >
                Schedule First Interview
              </Button>
            </div>

          /* Show interviews list */
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 border-2 border-neutral-100 rounded-lg hover:border-primary-200 transition-colors cursor-pointer"
                  onClick={() => navigate(`/interviews/${interview.id}`)}
                >
                  <div className="flex-1">
                    {/* Job title */}
                    <p className="font-semibold text-secondary">
                      {interview.job_title || 'Interview'}
                    </p>
                    {/* Date and time */}
                    <p className="text-sm text-neutral-600 mt-1">
                      {format(new Date(interview.scheduled_at), 'MMMM dd, yyyy • hh:mm a')}
                    </p>
                    {/* Duration */}
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Duration: {interview.duration_minutes} minutes
                      {' • '}
                      {interview.interview_type?.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Status badge */}
                    <Badge variant={getStatusVariant(interview.status)}>
                      {interview.status.replace('_', ' ')}
                    </Badge>
                    {/* View details link */}
                    <span className="text-xs text-primary-600 hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};





