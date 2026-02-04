import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  Video,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants';
import { format } from 'date-fns';
import interviewResultService, { InterviewResult } from '@/services/interviewResultService';
import candidateService from '@/services/candidateService';
import jobService from '@/services/jobService';

export const ResultDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResultData(parseInt(id));
    }
  }, [id]);

  const loadResultData = async (resultId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Load result data
      const resultData = await interviewResultService.getResult(resultId);
      setResult(resultData);

      // Load related candidate and job data
      const [candidateData, jobData] = await Promise.all([
        candidateService.getCandidate(resultData.candidate_id),
        jobService.getJob(resultData.job_id)
      ]);

      setCandidate(candidateData);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading result data:', error);
      setError('Failed to load result details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4 text-success" />;
    if (score >= 6) return <AlertCircle className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-error" />;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading result details...</div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Result not found'}</p>
          <Button onClick={() => id && loadResultData(parseInt(id))} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(ROUTES.RESULTS)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Interview Result</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {candidate?.full_name || 'Unknown Candidate'}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {job?.title || 'Unknown Job'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(result.created_at), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {result.overall_score.toFixed(1)}
          </div>
          <Badge
            variant={result.passed ? 'success' : 'error'}
            className="text-base px-4 py-1"
          >
            {result.passed ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {result.passed ? 'Passed' : 'Not Passed'}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Full Name</p>
              <p className="font-semibold text-secondary">{candidate?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Email</p>
              <p className="font-semibold text-secondary">{candidate?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Phone</p>
              <p className="font-semibold text-secondary">{candidate?.phone || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(result.scores).map(([category, score]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getScoreIcon(score)}
                  <span className="font-medium text-secondary capitalize">
                    {category.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 leading-relaxed">{result.assessment_summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-neutral-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-warning" />
                  </div>
                  <span className="text-neutral-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {result.transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-neutral-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-neutral-700 whitespace-pre-wrap">{result.transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
